import os
import uuid
import logging
import httpx
import aiofiles
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

class CrawlerService:
    def __init__(self, upload_dir: str = "/app/uploads/knowledge"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def fetch_appliance_manual(self, brand: str, model_number: str) -> str | None:
        """
        Searches the web for a PDF manual for the given brand and model.
        Downloads the first valid PDF and returns its local file path.
        Returns None if no manual is found or download fails.
        """
        query = f"{brand} {model_number} user manual filetype:pdf"
        logger.info(f"Crawler: Searching web for '{query}'")
        
        pdf_url = None
        try:
            # Synchronous call for DDGS, but since it's network I/O, it would block.
            # We can run it in a thread or just use it synchronously since background tasks run in threadpool.
            with DDGS() as ddgs:
                results = ddgs.text(query, max_results=5)
                for res in results:
                    url = res.get('href', '')
                    if url.lower().endswith('.pdf'):
                        pdf_url = url
                        break
        except Exception as e:
            logger.error(f"Crawler: DDGS search failed: {e}")
            return None

        if not pdf_url:
            logger.warning(f"Crawler: No PDF manual found for {brand} {model_number}")
            return None

        logger.info(f"Crawler: Found PDF manual at {pdf_url}. Downloading...")
        
        # Download the PDF
        # Use safe filename
        safe_brand = "".join([c for c in brand if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
        safe_model = "".join([c for c in model_number if c.isalnum() or c in (' ', '-', '_')]).strip().replace(' ', '_')
        filename = f"{safe_brand}_{safe_model}_{uuid.uuid4().hex[:8]}.pdf"
        file_path = os.path.join(self.upload_dir, filename)
        
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(pdf_url)
                response.raise_for_status()
                
                # Verify it's actually a PDF
                content_type = response.headers.get("Content-Type", "")
                if "application/pdf" not in content_type and not pdf_url.lower().endswith('.pdf'):
                    logger.warning(f"Crawler: Downloaded file is not a PDF (Content-Type: {content_type})")
                    return None
                    
                async with aiofiles.open(file_path, "wb") as f:
                    await f.write(response.content)
                    
            logger.info(f"Crawler: Successfully downloaded manual to {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Crawler: Failed to download PDF from {pdf_url}: {e}")
            if os.path.exists(file_path):
                os.remove(file_path)
            return None
