from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uuid

from models.activity import Scan
from .base import BaseRepository

class ScanRepository(BaseRepository[Scan]):
    def __init__(self, db: Session):
        super().__init__(Scan, db)

    def get_user_scans(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Scan]:
        return self.db.query(Scan).filter(
            Scan.user_id == user_id, 
            Scan.deleted_at.is_(None)
        ).order_by(desc(Scan.created_at)).offset(skip).limit(limit).all()

    def get_by_id_and_user(self, scan_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Scan]:
        return self.db.query(Scan).filter(
            Scan.id == scan_id,
            Scan.user_id == user_id,
            Scan.deleted_at.is_(None)
        ).first()

    def get_by_hash_and_user(self, image_hash: str, user_id: uuid.UUID) -> Optional[Scan]:
        return self.db.query(Scan).filter(
            Scan.image_hash == image_hash,
            Scan.user_id == user_id,
            Scan.deleted_at.is_(None)
        ).first()
