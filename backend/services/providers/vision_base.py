from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class DetectedObject(BaseModel):
    label: str
    confidence: float

class VisionAnalysis(BaseModel):
    objects: List[DetectedObject] = []
    scene_summary: str = ""
    colors: List[str] = []
    ocr_text: str = ""
    brands: List[str] = []
    tags: List[str] = []
    
    is_appliance: bool = False

    # Phase 6C: Appliance Copilot fields (all optional)
    appliance_type: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    components: Optional[List[str]] = None
    warning_labels: Optional[List[str]] = None
    energy_labels: Optional[List[str]] = None
    suggested_questions: Optional[List[str]] = None
    health_summary: Optional[str] = None

class VisionProvider(ABC):
    @abstractmethod
    async def analyze_image(self, file_path: str, mime_type: str = "image/jpeg") -> VisionAnalysis:
        pass
