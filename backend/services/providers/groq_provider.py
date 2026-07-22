import logging
import asyncio
from typing import AsyncGenerator
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception
from groq import AsyncGroq, APIError, RateLimitError, APIConnectionError, APITimeoutError

from core.config import settings
from services.providers.base import LLMProvider
from services.providers.exceptions import (
    AIProviderError, AIQuotaExceededError, AIRateLimitError,
    AITimeoutError, AINetworkError
)

logger = logging.getLogger(__name__)

def is_transient_error(exception: Exception) -> bool:
    if isinstance(exception, (AIRateLimitError, AITimeoutError, AINetworkError)):
        return True
    return False

def map_groq_error(e: Exception) -> Exception:
    if isinstance(e, asyncio.TimeoutError) or isinstance(e, APITimeoutError):
        return AITimeoutError("The AI provider request timed out.")
    if isinstance(e, RateLimitError):
        return AIRateLimitError("AI provider rate limit exceeded.")
    if isinstance(e, APIConnectionError):
        return AINetworkError(f"Network error: {e}")
    if isinstance(e, APIError):
        if getattr(e, 'status_code', None) == 429:
             return AIRateLimitError("AI provider rate limit exceeded.")
        return AIProviderError(f"AI provider error: {e}")
    return e

class GroqProvider(LLMProvider):
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required when LLM_PROVIDER=groq")
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=settings.GROQ_LLM_MODEL,
                    messages=messages,
                    temperature=settings.DEFAULT_TEMPERATURE,
                    max_tokens=settings.DEFAULT_MAX_TOKENS,
                ),
                timeout=30.0
            )
            return response.choices[0].message.content
        except Exception as e:
            mapped_e = map_groq_error(e)
            logger.error(f"Groq generate_response failed: {mapped_e.__class__.__name__} - {mapped_e}")
            raise mapped_e

    @retry(
        retry=retry_if_exception(is_transient_error),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_stream(self, prompt: str, system_prompt: str = None) -> AsyncGenerator[str, None]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response_stream = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=settings.GROQ_LLM_MODEL,
                    messages=messages,
                    temperature=settings.DEFAULT_TEMPERATURE,
                    max_tokens=settings.DEFAULT_MAX_TOKENS,
                    stream=True
                ),
                timeout=20.0
            )
            async for chunk in response_stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            mapped_e = map_groq_error(e)
            logger.error(f"Groq generate_stream failed: {mapped_e.__class__.__name__} - {mapped_e}")
            raise mapped_e
