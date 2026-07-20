from typing import List, Optional
import uuid
import time
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, BackgroundTasks

from sqlalchemy.orm import Session
from models.activity import Scan
from repositories.scan_repo import ScanRepository
from services.image_service import ImageService
from services.providers.provider_factory import get_vision_provider
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    logger.addHandler(ch)

class ScanService:
    def __init__(self, db: Session):
        self.db = db
        self.scan_repo = ScanRepository(db)
        self.image_service = ImageService()
        self.vision_engine = get_vision_provider()

    async def process_upload(self, file: UploadFile, user_id: uuid.UUID, background_tasks: BackgroundTasks = None) -> Scan:
        """Processes the uploaded file synchronously for V1."""
        logger.info(f"=== PIPELINE START: Uploading file {file.filename} ===")
        # 1. Validate and save image locally
        try:
            metadata = await self.image_service.validate_and_save(file)
            logger.info(f"Storage: Saved to {metadata['storage_path']}")
        except ValueError as e:
            logger.error(f"Storage Error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
            
        # 2. Check for duplicate upload (optional, we just log it for now)
        existing = self.scan_repo.get_by_hash_and_user(metadata["image_hash"], user_id)
        if existing:
            # We could return the existing scan here, but for now we process it again
            pass

        # 3. Create Scan record (status: uploaded)
        scan_data = {
            "user_id": user_id,
            "original_filename": metadata["original_filename"],
            "stored_filename": metadata["stored_filename"],
            "mime_type": metadata["mime_type"],
            "file_size": metadata["file_size"],
            "width": metadata["width"],
            "height": metadata["height"],
            "storage_path": metadata["storage_path"],
            "status": "uploaded",
            "uploaded_at": datetime.now(timezone.utc),
            "image_hash": metadata["image_hash"]
        }
        scan = self.scan_repo.create(scan_data)
        
        # 4. Synchronous Processing (Mocking Future Celery Worker)
        scan = await self._run_vision_pipeline(scan.id)
        
        # 5. Background Tasks
        if background_tasks and scan.status == "completed" and scan.detected_model_number:
            brand = None
            if scan.tags:
                for tag in scan.tags:
                    if tag.startswith("Brands: "):
                        brand = tag.replace("Brands: ", "").strip()
                        break
            if brand:
                background_tasks.add_task(fetch_and_ingest_manual_task, brand, scan.detected_model_number)
                
        return scan

    async def _run_vision_pipeline(self, scan_id: uuid.UUID) -> Scan:
        """Executes the CV pipeline. In V2, this will be run by a celery worker."""
        scan = self.scan_repo.get_by_id(scan_id)
        if not scan:
            return None
            
        start_time = time.time()
        logger.info(f"Vision Engine: Starting analysis for {scan.original_filename}")
        scan = self.scan_repo.update(scan, {
            "status": "processing",
            "started_processing_at": datetime.now(timezone.utc)
        })
        
        try:
            # Generate thumbnails
            await self.image_service.generate_thumbnails(scan.stored_filename)
            
            # Run AI analysis
            results = await self.vision_engine.analyze_image(scan.storage_path, scan.mime_type)
            
            # Update scan with success
            processing_time = int((time.time() - start_time) * 1000)
            
            # Phase 6C: Validation check for Appliance Copilot MVP
            if not results.is_appliance:
                logger.warning(f"Vision Engine: Image rejected (not an appliance) for {scan.original_filename}")
                update_data = {
                    "status": "failed",
                    "completed_at": datetime.now(timezone.utc),
                    "processing_time_ms": processing_time,
                    "error_message": "The uploaded image does not appear to be a recognized home appliance. Please upload an image of a supported home appliance."
                }
                return self.scan_repo.update(scan, update_data)
            
            objs = [{"label": obj.label, "confidence": obj.confidence} for obj in results.objects]
            
            # Pack rich metadata into tags using structured prefixes
            tags = results.tags.copy()
            if results.scene_summary:
                tags.append(f"Scene Summary: {results.scene_summary}")
            if results.colors:
                tags.append(f"Colors: {', '.join(results.colors)}")
            if results.brands:
                tags.append(f"Brands: {', '.join(results.brands)}")
            
            # Phase 6C: Appliance Copilot metadata
            if results.appliance_type:
                tags.append(f"Appliance Type: {results.appliance_type}")
            if results.model_number:
                tags.append(f"Model: {results.model_number}")
            if results.serial_number:
                tags.append(f"Serial: {results.serial_number}")
            if results.components:
                for comp in results.components:
                    tags.append(f"Component: {comp}")
            if results.warning_labels:
                for warning in results.warning_labels:
                    tags.append(f"Warning: {warning}")
            if results.energy_labels:
                for energy in results.energy_labels:
                    tags.append(f"Energy Rating: {energy}")
            if results.suggested_questions:
                for q in results.suggested_questions:
                    tags.append(f"Suggested Question: {q}")
            if results.health_summary:
                tags.append(f"Health Summary: {results.health_summary}")
            
            ocr = results.ocr_text
            
            logger.info(f"Vision Engine: Completed in {processing_time}ms")
            logger.info(f"Vision Results: Detected Objects: {len(objs)} | Tags & Metadata: {len(tags)} | OCR Present: {'Yes' if ocr else 'No'}")
            if results.appliance_type:
                logger.info(f"Appliance: {results.appliance_type} | Brand: {results.brands} | Model: {results.model_number}")
            
            update_data = {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc),
                "processing_time_ms": processing_time,
                "detected_objects": objs,
                "tags": tags,
                "ocr_raw_text": ocr
            }
            
            # Populate legacy detected_model_number column if model extracted
            if results.model_number:
                update_data["detected_model_number"] = results.model_number
            
            scan = self.scan_repo.update(scan, update_data)
            logger.info(f"=== PIPELINE END: Scan {scan.id} completed successfully ===")
            
        except Exception as e:
            logger.error(f"=== PIPELINE ERROR: Vision Engine failed: {str(e)} ===")
            # Update scan with failure
            scan = self.scan_repo.update(scan, {
                "status": "failed",
                "completed_at": datetime.now(timezone.utc),
                "error_message": str(e)
            })
            
        return scan

    def get_user_scans(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Scan]:
        return self.scan_repo.get_user_scans(user_id, skip, limit)
        
    def get_scan(self, scan_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Scan]:
        return self.scan_repo.get_by_id_and_user(scan_id, user_id)

    def delete_scan(self, scan_id: uuid.UUID, user_id: uuid.UUID):
        scan = self.scan_repo.get_by_id_and_user(scan_id, user_id)
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
            
        # Delete local files
        self.image_service.delete_files(scan.stored_filename)
        
        # Soft delete database record
        self.scan_repo.soft_delete(scan)

async def fetch_and_ingest_manual_task(brand: str, model_number: str):
    from database.database import SessionLocal
    from services.crawler_service import CrawlerService
    from services.knowledge_service import KnowledgeService
    from services.vector_search_service import VectorSearchService
    from services.chunking_service import RecursiveCharacterChunkStrategy
    from services.providers.provider_factory import get_embedding_provider
    from models.knowledge import KnowledgeDocument
    
    logger.info(f"Background Task: Starting fetch_and_ingest_manual_task for {brand} {model_number}")
    db = SessionLocal()
    try:
        # Check if manual already exists
        existing = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.brand.ilike(f"%{brand}%"),
            KnowledgeDocument.title.ilike(f"%{model_number}%")
        ).first()
        
        if existing:
            logger.info(f"Background Task: Manual for {brand} {model_number} already exists in knowledge base.")
            return

        crawler = CrawlerService()
        file_path = await crawler.fetch_appliance_manual(brand, model_number)
        
        if not file_path:
            return
            
        vector_search = VectorSearchService()
        chunk_strategy = RecursiveCharacterChunkStrategy()
        embedding_provider = get_embedding_provider()
        
        knowledge_service = KnowledgeService(vector_search, chunk_strategy, embedding_provider)
        
        filename = file_path.split("/")[-1]
        # or os.path.basename(file_path)
        
        await knowledge_service.ingest_document(
            db=db,
            file_path=file_path,
            original_filename=filename,
            mime_type="application/pdf",
            brand=brand,
            category="Appliance"
        )
        logger.info(f"Background Task: Successfully ingested manual for {brand} {model_number}")
        
    except Exception as e:
        logger.error(f"Background Task Error: Failed to fetch and ingest manual for {brand} {model_number}: {e}")
    finally:
        db.close()
