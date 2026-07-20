import logging
import json
import aiofiles
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from google import genai
from google.genai import types

from core.config import settings
from services.providers.vision_base import VisionProvider, VisionAnalysis
from services.providers.gemini_provider import is_transient_error

logger = logging.getLogger(__name__)

class GeminiVisionProvider(VisionProvider):
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is required when VISION_PROVIDER=gemini")
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def analyze_image(self, file_path: str, mime_type: str = "image/jpeg") -> VisionAnalysis:
        async with aiofiles.open(file_path, "rb") as f:
            image_bytes = await f.read()

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        
        prompt = (
            "You are an experienced appliance technician and product identification expert. "
            "Analyze this image thoroughly.\n\n"
            "1. IDENTIFICATION: Determine if the image contains a home appliance (e.g., washing machine, refrigerator, oven, dishwasher, air conditioner, microwave, etc.). "
            "If it DOES contain an appliance, set 'is_appliance' to true. If it does NOT, set 'is_appliance' to false and skip extracting appliance-specific details. "
            "If true, identify the appliance type and brand. Extract the model number and serial number if visible on any label or sticker.\n\n"
            "2. COMPONENTS: List every visible component (e.g., control panel, door, drum, filter, display screen, buttons, knobs, hoses, vents).\n\n"
            "3. LABELS & WARNINGS: Extract any warning labels (e.g., 'High Voltage', 'Do Not Cover') and energy rating labels (e.g., '5 Star', 'A++', 'Energy Star').\n\n"
            "4. OCR: Extract ALL visible text exactly as printed — model numbers, serial numbers, instructions, labels, warnings.\n\n"
            "5. OBJECTS: Identify all objects in the scene with confidence scores (0.0 to 1.0).\n\n"
            "6. VISUAL: List prominent colors and generate relevant tags.\n\n"
            "7. HEALTH SUMMARY: Provide a concise 1-2 sentence assessment of the appliance's visible condition "
            "(e.g., 'No visible damage. Control panel is clearly visible and operational.').\n\n"
            "8. SUGGESTED QUESTIONS: Generate 3-5 practical questions a user would naturally ask about this appliance "
            "(e.g., 'How do I clean the filter?', 'What does this error code mean?', 'Where is the serial number?').\n\n"
            "9. SCENE SUMMARY: Provide a comprehensive description of the scene.\n\n"
            "CRITICAL RULES:\n"
            "- If you CANNOT confidently determine a field, return null for that field.\n"
            "- NEVER fabricate model numbers, serial numbers, specifications, or brand names.\n"
            "- Only report what is clearly visible in the image.\n"
            "- If 'is_appliance' is false, set all appliance fields (type, model, serial, components, warnings, energy, health, questions) to null."
        )

        config = types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",
            response_schema=VisionAnalysis,
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=[image_part, prompt],
                config=config
            )
            data = json.loads(response.text)
            logger.info(f"Gemini Vision: Successfully analyzed image. Appliance: {data.get('appliance_type', 'N/A')}")
            return VisionAnalysis(**data)
        except Exception as e:
            logger.error(f"Gemini Vision Error: {e}")
            # Re-raise so scan_service marks the scan as 'failed' instead of 'completed' with empty data
            raise
