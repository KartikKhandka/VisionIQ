from typing import Optional
from sqlalchemy.orm import Session
from models.activity import ActivityLog
from .base import BaseRepository

class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)
