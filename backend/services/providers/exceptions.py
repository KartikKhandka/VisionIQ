class AIProviderError(Exception):
    """Base exception for AI provider errors."""
    pass

class AIQuotaExceededError(AIProviderError):
    """Raised when the AI provider quota is exceeded (e.g., 429 quota limit)."""
    pass

class AIRateLimitError(AIProviderError):
    """Raised when the AI provider rate limit is exceeded temporarily (e.g., 429 transient)."""
    pass

class AITimeoutError(AIProviderError):
    """Raised when the AI provider request times out."""
    pass

class AINetworkError(AIProviderError):
    """Raised on network or connection failures to the AI provider."""
    pass

class AIInvalidResponseError(AIProviderError):
    """Raised when the AI provider returns an invalid or malformed response."""
    pass
