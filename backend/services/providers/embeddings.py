from typing import List
from .base import EmbeddingProvider
from sentence_transformers import SentenceTransformer

class SentenceTransformerEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # Load the model. Note: In production, this might be loaded once globally or cached.
        self.model = SentenceTransformer(model_name)
        
    def generate_embedding(self, text: str) -> List[float]:
        embedding = self.model.encode(text)
        return embedding.tolist()

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts)
        return embeddings.tolist()

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

class GeminiEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("Gemini embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("Gemini embeddings not yet configured.")

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
