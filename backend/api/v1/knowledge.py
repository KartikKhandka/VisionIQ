import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database.database import get_db
from api.deps import get_current_active_user
from models.user import User

from schemas.knowledge import (
    KnowledgeDocumentResponse,
    KnowledgeDocumentCreate
)

from services.knowledge_service import KnowledgeService
from services.vector_search_service import VectorSearchService
from services.chunking_service import RecursiveChunker
from services.providers.embeddings import GeminiEmbeddingProvider
import tempfile
import os

router = APIRouter()

# Dependency Injection setup
vector_search_service = VectorSearchService()
chunk_strategy = RecursiveChunker(chunk_size=1000, chunk_overlap=200)

try:
    embedding_provider = GeminiEmbeddingProvider()
except Exception as e:
    print(f"Warning: Could not initialize embedding provider: {e}")
    embedding_provider = None

knowledge_service = KnowledgeService(
    vector_search_service=vector_search_service,
    chunk_strategy=chunk_strategy,
    embedding_provider=embedding_provider
)

@router.post("/upload", response_model=KnowledgeDocumentResponse)
async def upload_knowledge_document(
    file: UploadFile = File(...),
    brand: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.role or current_user.role.name != "admin":
        # In a real system, you might limit uploads to admins or allow users to have personal knowledge bases
        pass # We'll allow it for demonstration

    if not embedding_provider:
        raise HTTPException(status_code=500, detail="Embedding provider not initialized.")

    # Save temp file
    temp_fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
    try:
        content = await file.read()
        with os.fdopen(temp_fd, 'wb') as f:
            f.write(content)
            
        doc = await knowledge_service.ingest_document(
            db=db,
            file_path=temp_path,
            original_filename=file.filename,
            mime_type=file.content_type,
            brand=brand,
            category=category
        )
    finally:
        os.remove(temp_path)

    return doc

@router.get("", response_model=List[KnowledgeDocumentResponse])
def get_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return knowledge_service.get_all_documents(db)

@router.get("/{document_id}", response_model=KnowledgeDocumentResponse)
def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = knowledge_service.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = knowledge_service.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    knowledge_service.delete_document(db, document_id)
    return {"message": "Document deleted successfully"}
