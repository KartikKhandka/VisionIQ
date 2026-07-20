from typing import Dict, Any, List
import asyncio
import random

class VisionEngine:
    async def analyze(self, image_path: str) -> Dict[str, Any]:
        """Analyzes an image and returns a complete analysis report."""
        raise NotImplementedError

    async def extract_objects(self, image_path: str) -> List[Dict[str, Any]]:
        """Extracts objects from an image."""
        raise NotImplementedError

    async def generate_tags(self, image_path: str) -> List[str]:
        """Generates tags for an image."""
        raise NotImplementedError


class MockVisionEngine(VisionEngine):
    async def analyze(self, image_path: str) -> Dict[str, Any]:
        # Simulate processing delay
        await asyncio.sleep(2)
        
        return {
            "objects": [],
            "tags": [],
            "ocr_text": "",
            "summary": "Unable to identify image contents."
        }

    async def extract_objects(self, image_path: str) -> List[Dict[str, Any]]:
        return []

    async def generate_tags(self, image_path: str) -> List[str]:
        return []
