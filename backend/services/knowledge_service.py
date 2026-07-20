import uuid
import os
import re
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile

from models.knowledge import KnowledgeDocument, KnowledgeChunk
from .vector_search_service import VectorSearchService
from .chunking_service import ChunkStrategy
from .providers.base import EmbeddingProvider

# For basic text extraction
import fitz  # PyMuPDF
import markdown

import logging
logger = logging.getLogger(__name__)

# Common appliance brands for filename inference
KNOWN_BRANDS = [
    "lg", "samsung", "whirlpool", "bosch", "siemens", "haier", "godrej",
    "panasonic", "sony", "philips", "daikin", "voltas", "carrier", "hitachi",
    "ifb", "kent", "eureka", "dyson", "miele", "electrolux", "frigidaire",
    "ge", "kenmore", "maytag", "kitchenaid", "honeywell", "breville",
    "cuisinart", "delonghi", "nespresso", "toshiba", "sharp", "midea",
    "blue star", "bajaj", "crompton", "havells", "prestige", "butterfly",
    "morphy richards", "preethi", "usha", "orient", "anchor"
]

# Document type patterns for filename inference
DOC_TYPE_PATTERNS = {
    "manual": ["manual", "user guide", "user_guide", "userguide", "owner"],
    "warranty": ["warranty", "guarantee"],
    "installation guide": ["install", "setup", "installation"],
    "service guide": ["service", "repair", "technician"],
    "quick start guide": ["quick start", "quickstart", "quick_start", "getting started"],
    "datasheet": ["datasheet", "data sheet", "spec sheet", "specification"],
}

class KnowledgeService:
    def __init__(
        self, 
        vector_search_service: VectorSearchService, 
        chunk_strategy: ChunkStrategy, 
        embedding_provider: EmbeddingProvider
    ):
        self.vector_search = vector_search_service
        self.chunk_strategy = chunk_strategy
        self.embedding_provider = embedding_provider

    def _infer_metadata_from_filename(self, filename: str) -> dict:
        """Attempt to infer brand, category, and document type from the filename."""
        inferred = {"brand": None, "document_type_label": None}
        name_lower = filename.lower().replace("_", " ").replace("-", " ")
        
        # Infer brand
        for brand in KNOWN_BRANDS:
            if brand in name_lower:
                inferred["brand"] = brand.title()
                break
        
        # Infer document type
        for doc_type, patterns in DOC_TYPE_PATTERNS.items():
            for pattern in patterns:
                if pattern in name_lower:
                    inferred["document_type_label"] = doc_type.title()
                    break
            if inferred["document_type_label"]:
                break
        
        return inferred

    async def extract_text(self, file_path: str, mime_type: str) -> tuple:
        """Extracts text and page count based on document type. Returns (text, page_count)."""
        text = ""
        page_count = 0
        try:
            if mime_type == "application/pdf":
                doc = fitz.open(file_path)
                page_count = len(doc)
                for page in doc:
                    text += page.get_text() + "\n"
                
                # If text is empty (scanned PDF), use Gemini Vision
                if not text.strip():
                    from services.providers.provider_factory import get_vision_provider
                    vision_provider = get_vision_provider()
                    analysis = await vision_provider.analyze_image(file_path, mime_type)
                    if analysis.ocr_text:
                        text = analysis.ocr_text
                        
            elif mime_type == "text/plain":
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                page_count = 1
            elif mime_type == "text/markdown":
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                page_count = 1
            else:
                raise ValueError(f"Unsupported MIME type: {mime_type}")
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise e
        return text, page_count

    async def ingest_document(
        self, 
        db: Session, 
        file_path: str, 
        original_filename: str, 
        mime_type: str, 
        brand: Optional[str] = None, 
        category: Optional[str] = None
    ) -> KnowledgeDocument:
        # Phase 6C: Auto-infer metadata from filename if not provided
        inferred = self._infer_metadata_from_filename(original_filename)
        if not brand:
            brand = inferred.get("brand")
        doc_type_label = inferred.get("document_type_label") or "Document"
        
        # 1. Create Document Record
        document = KnowledgeDocument(
            title=original_filename,
            source=original_filename,
            document_type=mime_type.split('/')[-1].upper(),
            brand=brand,
            category=category
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        # 2. Extract Text
        full_text, page_count = await self.extract_text(file_path, mime_type)

        if not full_text or not full_text.strip():
            logger.warning(f"No text extracted from {original_filename}. Skipping chunk generation.")
            return document

        # 3. Chunk Text
        text_chunks = self.chunk_strategy.chunk(full_text)
        
        if not text_chunks:
            return document

        # 4. Generate Embeddings (batch)
        embeddings = self.embedding_provider.generate_embeddings(text_chunks)

        # 5. Prepare Chunks with enriched metadata
        db_chunks = []
        for i, (text, emb) in enumerate(zip(text_chunks, embeddings)):
            # Estimate page number from chunk position in the document
            estimated_page = max(1, int((i / max(len(text_chunks), 1)) * page_count) + 1) if page_count > 1 else 1
            
            chunk = KnowledgeChunk(
                document_id=document.id,
                chunk_index=i,
                page_number=estimated_page,
                text=text,
                embedding=emb,
                metadata_={
                    "title": document.title,
                    "brand": document.brand,
                    "category": document.category,
                    "document_type_label": doc_type_label,
                    "page_number": estimated_page,
                    "page_count": page_count,
                }
            )
            db_chunks.append(chunk)

        # 6. Index Vectors
        self.vector_search.index_document(db, db_chunks)
        
        logger.info(f"Knowledge Ingestion: {original_filename} | Brand: {brand} | Type: {doc_type_label} | Pages: {page_count} | Chunks: {len(db_chunks)}")
        
        return document

    def get_document(self, db: Session, document_id: uuid.UUID) -> KnowledgeDocument:
        return db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()

    def get_all_documents(self, db: Session) -> List[KnowledgeDocument]:
        return db.query(KnowledgeDocument).all()

    def delete_document(self, db: Session, document_id: uuid.UUID):
        # Cascading delete will remove the chunks if configured in SQLAlchemy models.
        # Otherwise we can manually delete chunks via vector_search.delete_document(db, document_id)
        self.vector_search.delete_document(db, document_id)
        
        doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
        if doc:
            db.delete(doc)
            db.commit()
