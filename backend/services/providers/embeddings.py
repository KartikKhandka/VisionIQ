from typing import List
from .base import EmbeddingProvider
from google import genai
from core.config import settings

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def generate_embedding(self, text: str) -> List[float]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("OpenAI embeddings not yet configured.")

import httpx

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model_name = "models/text-embedding-004"

    def generate_embedding(self, text: str) -> List[float]:
        url = f"https://generativelanguage.googleapis.com/v1/{self.model_name}:embedContent?key={self.api_key}"
        payload = {
            "model": self.model_name,
            "content": {"parts": [{"text": text}]}
        }
        response = httpx.post(url, json=payload, timeout=10.0)
        if response.status_code != 200:
            print(f"Gemini API Error: {response.text}")
        response.raise_for_status()
        return response.json()["embedding"]["values"]

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        url = f"https://generativelanguage.googleapis.com/v1/{self.model_name}:batchEmbedContents?key={self.api_key}"
        requests = [
            {"model": self.model_name, "content": {"parts": [{"text": t}]}}
            for t in texts
        ]
        response = httpx.post(url, json={"requests": requests}, timeout=30.0)
        if response.status_code != 200:
            print(f"Gemini API Error: {response.text}")
        response.raise_for_status()
        embeddings = response.json().get("embeddings", [])
        return [emb["values"] for emb in embeddings]

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
