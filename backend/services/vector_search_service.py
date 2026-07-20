from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import UUID
from typing import List, Optional
import uuid

from models.knowledge import KnowledgeChunk

class VectorSearchService:
    def __init__(self):
        pass
        
    def index_document(self, db: Session, chunks: List[KnowledgeChunk]):
        db.add_all(chunks)
        db.commit()

    def batch_index(self, db: Session, chunks: List[KnowledgeChunk]):
        self.index_document(db, chunks)

    def similarity_search(self, db: Session, query_embedding: List[float], top_k: int = 5, filters: Optional[dict] = None) -> List[tuple]:
        # Utilizing pgvector's cosine_distance operator (<=>)
        distance_col = KnowledgeChunk.embedding.cosine_distance(query_embedding).label("distance")
        stmt = select(KnowledgeChunk, distance_col).order_by(
            distance_col
        ).limit(top_k)
        
        # We could add WHERE clauses here based on `filters` (e.g. metadata matches)
        
        result = db.execute(stmt)
        return [(row[0], row[1]) for row in result.all()]

    def update_document(self, db: Session, document_id: uuid.UUID, new_chunks: List[KnowledgeChunk]):
        # Delete old chunks
        self.delete_document(db, document_id)
        # Add new chunks
        self.index_document(db, new_chunks)

    def delete_document(self, db: Session, document_id: uuid.UUID):
        stmt = delete(KnowledgeChunk).where(KnowledgeChunk.document_id == document_id)
        db.execute(stmt)
        db.commit()
