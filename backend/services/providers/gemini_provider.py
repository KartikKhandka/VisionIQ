from typing import AsyncGenerator
import logging
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from google import genai
from google.genai import types
from google.genai.errors import APIError

from core.config import settings
from services.providers.base import LLMProvider
from services.providers.exceptions import (
    AIProviderError, AIQuotaExceededError, AIRateLimitError,
    AITimeoutError, AINetworkError
)

logger = logging.getLogger(__name__)

def is_transient_error(exception: Exception) -> bool:
    """Determine if the exception is a transient error that should be retried."""
    if isinstance(exception, (AIRateLimitError, AITimeoutError, AINetworkError)):
        return True
    return False

def map_gemini_error(e: Exception) -> Exception:
    if isinstance(e, asyncio.TimeoutError):
        return AITimeoutError("The AI provider request timed out.")
    if isinstance(e, APIError):
        err_msg = str(e).lower()
        if e.code == 429:
            # Distinguish between hard quota and transient rate limit
            if "quota" in err_msg or "limit: 0" in err_msg:
                return AIQuotaExceededError("AI provider quota exceeded.")
            return AIRateLimitError("AI provider rate limit exceeded.")
        if e.code in [500, 503, 504]:
            return AITimeoutError(f"AI provider unavailable: {e}")
        return AIProviderError(f"AI provider error: {e}")
    if isinstance(e, (ConnectionError, TimeoutError)):
        return AINetworkError(f"Network error: {e}")
    return e

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY is required when LLM_PROVIDER=gemini"
            )
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

        try:
            # Set a 30 second timeout for simple generation
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=config
                ),
                timeout=30.0
            )
            return response.text
        except Exception as e:
            mapped_e = map_gemini_error(e)
            logger.error(f"Gemini generate_response failed: {mapped_e.__class__.__name__} - {mapped_e}")
            raise mapped_e

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

        try:
            response_stream = await asyncio.wait_for(
                self.client.aio.models.generate_content_stream(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=config
                ),
                timeout=20.0 # Timeout for initial connection
            )
            
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            mapped_e = map_gemini_error(e)
            logger.error(f"Gemini generate_stream failed: {mapped_e.__class__.__name__} - {mapped_e}")
            raise mapped_e
