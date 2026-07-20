from typing import AsyncGenerator
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from google import genai
from google.genai import types
from google.genai.errors import APIError

from core.config import settings
from services.providers.base import LLMProvider

logger = logging.getLogger(__name__)

def is_transient_error(exception: Exception) -> bool:
    """Determine if the exception is a transient error that should be retried."""
    if isinstance(exception, APIError):
        # Retry on Rate Limit (429), Internal Server Error (500), Service Unavailable (503)
        if exception.code in [429, 500, 503]:
            return True
        # Note: Do not retry on 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)
        return False
    # Retry on network errors or timeouts (usually caught as built-in exceptions like ConnectionError)
    if isinstance(exception, (ConnectionError, TimeoutError)):
        return True
    return False

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY is required when LLM_PROVIDER=gemini"
            )
        # Instantiate the client
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        config = types.GenerateContentConfig(
            temperature=settings.DEFAULT_TEMPERATURE,
            max_output_tokens=settings.DEFAULT_MAX_TOKENS,
        )
        if system_prompt:
            config.system_instruction = system_prompt

        response = await self.client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config
        )
        return response.text

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_stream(self, prompt: str, system_prompt: str = None) -> AsyncGenerator[str, None]:
        config = types.GenerateContentConfig(
            temperature=settings.DEFAULT_TEMPERATURE,
            max_output_tokens=settings.DEFAULT_MAX_TOKENS,
        )
        if system_prompt:
            config.system_instruction = system_prompt

        response_stream = await self.client.aio.models.generate_content_stream(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=config
        )
        
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text
