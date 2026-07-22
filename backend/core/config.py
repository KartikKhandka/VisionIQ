from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionIQ"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "generate-a-secure-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/visioniq"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"
    
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_BUCKET_NAME: str = "visioniq-storage"
    
    
    VISION_PROVIDER: str = "gemini"
    LLM_PROVIDER: str = "groq"
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    GROQ_API_KEY: str = ""
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_VISION_MODEL: str = ""
    DEFAULT_TEMPERATURE: float = 0.7
    DEFAULT_MAX_TOKENS: int = 1024

    @property
    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"), 
        case_sensitive=True, 
        extra="ignore"
    )

settings = Settings()
