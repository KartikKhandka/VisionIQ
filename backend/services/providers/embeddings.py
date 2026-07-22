from typing import List
from .base import EmbeddingProvider
from google import genai
from core.config import settings

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model_name = "text-embedding-004"

    def generate_embedding(self, text: str) -> List[float]:
        result = self.client.models.embed_content(
            model=self.model_name,
            contents=text,
        )
        return result.embeddings[0].values

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        result = self.client.models.embed_content(
            model=self.model_name,
            contents=texts,
        )
        return [embedding.values for embedding in result.embeddings]

class OllamaEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("Ollama embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("Ollama embeddings not yet configured.")

class CohereEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("Cohere embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("Cohere embeddings not yet configured.")
