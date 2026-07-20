from core.config import settings
from services.providers.base import LLMProvider

def get_llm_provider() -> LLMProvider:
    provider_name = settings.LLM_PROVIDER.lower()
    
    import logging
    logger = logging.getLogger("chat_debug")
    logger.info(f"[DEBUG-TRACE] services/providers/provider_factory.py: get_llm_provider called. LLM_PROVIDER is '{provider_name}'")
    
    if provider_name == "gemini":
        from services.providers.gemini_provider import GeminiProvider
        return GeminiProvider()
    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider_name}")

def get_vision_provider():
    provider_name = settings.VISION_PROVIDER.lower()
    
    if provider_name == "gemini":
        from services.providers.vision_gemini import GeminiVisionProvider
        return GeminiVisionProvider()
    else:
        raise ValueError(f"Unsupported VISION_PROVIDER: {provider_name}")
