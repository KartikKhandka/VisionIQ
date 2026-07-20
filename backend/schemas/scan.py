from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class ScanBase(BaseModel):
    original_filename: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None

class ScanCreate(ScanBase):
    user_id: uuid.UUID
    stored_filename: str
    storage_path: str
    image_hash: str
    status: str = "uploaded"
    original_filename: str
    mime_type: str
    file_size: int

class ScanUpdate(BaseModel):
    status: Optional[str] = None
    started_processing_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    processing_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    detected_objects: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    ocr_raw_text: Optional[str] = None
    detected_model_number: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None

class ScanResponse(ScanBase):
    id: uuid.UUID
    user_id: uuid.UUID
    stored_filename: str
    storage_path: str
    status: str
    uploaded_at: Optional[datetime] = None
    started_processing_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    processing_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    image_hash: Optional[str] = None
    detected_objects: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    ocr_raw_text: Optional[str] = None
    detected_model_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
