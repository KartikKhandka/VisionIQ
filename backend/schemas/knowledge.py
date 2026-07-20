import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class KnowledgeDocumentBase(BaseModel):
    title: str
    source: Optional[str] = None
    document_type: str
    brand: Optional[str] = None
    category: Optional[str] = None
    language: str = "en"

class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    pass

class KnowledgeDocumentResponse(KnowledgeDocumentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class KnowledgeChunkBase(BaseModel):
    document_id: uuid.UUID
    chunk_index: int
    page_number: Optional[int] = None
    text: str
    metadata_: Optional[Dict[str, Any]] = None

class KnowledgeChunkResponse(KnowledgeChunkBase):
    id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
