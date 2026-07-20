from sqlalchemy import Column, String, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from .base import BaseModel

class KnowledgeDocument(BaseModel):
    __tablename__ = "knowledge_documents"

    title = Column(String, index=True, nullable=False)
    source = Column(String, nullable=True)
    document_type = Column(String, nullable=False)  # PDF, TXT, MD
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)
    language = Column(String, default="en")
    
    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(BaseModel):
    __tablename__ = "knowledge_chunks"

    document_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    text = Column(Text, nullable=False)
    
    # 384 is default dimension for sentence-transformers all-MiniLM-L6-v2
    embedding = Column(Vector(384))
    
    metadata_ = Column("metadata", JSON, nullable=True)
    
    document = relationship("KnowledgeDocument", back_populates="chunks")
