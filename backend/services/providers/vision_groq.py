import logging
import json
import asyncio
import base64
import aiofiles
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from groq import AsyncGroq

from core.config import settings
from services.providers.vision_base import VisionProvider, VisionAnalysis
from services.providers.groq_provider import is_transient_error, map_groq_error
from services.providers.exceptions import AIInvalidResponseError

logger = logging.getLogger(__name__)

class GroqVisionProvider(VisionProvider):
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required when VISION_PROVIDER=groq")
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def analyze_image(self, file_path: str, mime_type: str = "image/jpeg") -> VisionAnalysis:
        async with aiofiles.open(file_path, "rb") as f:
            image_bytes = await f.read()

        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        image_url = f"data:{mime_type};base64,{base64_image}"

        prompt = (
            "You are an experienced appliance technician and product identification expert. "
            "Analyze this image thoroughly and output ONLY valid JSON matching this structure exactly:\n"
            "{\n"
            '  "is_appliance": true,\n'
            '  "appliance_type": "string",\n'
            '  "brand": "string",\n'
            '  "detected_model_number": "string",\n'
            '  "detected_serial_number": "string",\n'
            '  "components": ["string"],\n'
            '  "warning_labels": ["string", "string"], // include printed warnings AND visible physical damage/broken parts\n'
            '  "energy_rating": "string",\n'
            '  "ocr_text": "string",\n'
            '  "detected_objects": [{"label": "string", "confidence": 0.9}],\n'
            '  "colors": ["string"],\n'
            '  "tags": ["string"],\n'
            '  "health_summary": "string",\n'
            '  "suggested_questions": ["string"],\n'
            '  "scene_summary": "string"\n'
            "}\n\n"
            "CRITICAL RULES:\n"
            "- If you CANNOT confidently determine a field, return null for that field.\n"
            "- NEVER fabricate model numbers, serial numbers, specifications, or brand names.\n"
            "- Only report what is clearly visible in the image.\n"
            "- If 'is_appliance' is false, set all appliance fields to null."
        )

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                        },
                    },
                ],
            }
        ]

        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=settings.GROQ_VISION_MODEL,
                    messages=messages,
                    temperature=0.2,
                    max_tokens=2000,
                    response_format={"type": "json_object"}
                ),
                timeout=45.0
            )
            
            content = response.choices[0].message.content
            data = json.loads(content)
            logger.info(f"Groq Vision: Successfully analyzed image. Appliance: {data.get('appliance_type', 'N/A')}")
            return VisionAnalysis(**data)
        except json.JSONDecodeError as e:
            err = AIInvalidResponseError(f"Invalid JSON from AI provider: {e}")
            logger.error(f"Groq Vision Error: {err}")
            raise err
        except Exception as e:
            mapped_e = map_groq_error(e)
            logger.error(f"Groq Vision Error: {mapped_e.__class__.__name__} - {mapped_e}")
            raise mapped_e
