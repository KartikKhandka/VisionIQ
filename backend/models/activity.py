from sqlalchemy import Column, String, ForeignKey, Text, Integer, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel

from sqlalchemy.dialects.postgresql import JSONB

class Scan(BaseModel):
    __tablename__ = "scans"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=True) # Kept for backward compatibility, made nullable
    
    # Phase 4 New Fields
    original_filename = Column(String, nullable=True)
    stored_filename = Column(String, nullable=True, unique=True, index=True)
    mime_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    storage_path = Column(String, nullable=True)
    status = Column(String, default="uploaded")
    uploaded_at = Column(DateTime(timezone=True), nullable=True)
    started_processing_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    error_message = Column(String, nullable=True)
    image_hash = Column(String, nullable=True, index=True)  # SHA256
    
    detected_objects = Column(JSONB, nullable=True)
    tags = Column(JSONB, nullable=True)

    # Legacy fields
    detected_category_id = Column(ForeignKey("categories.id"), nullable=True)
    detected_brand_id = Column(ForeignKey("brands.id"), nullable=True)
    detected_model_number = Column(String, nullable=True)
    ocr_raw_text = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="scans")

class ActivityLog(BaseModel):
    __tablename__ = "activity_logs"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    device_info = Column(String, nullable=True)
    
    user = relationship("User", back_populates="activity_logs")
