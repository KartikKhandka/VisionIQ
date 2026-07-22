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
        self.candidate_models = [
            ("v1", "models/text-embedding-004"),
            ("v1beta", "models/text-embedding-004"),
            ("v1beta", "models/embedding-001"),
        ]

    def generate_embedding(self, text: str) -> List[float]:
        last_err = None
        for version, model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/{version}/{model}:embedContent?key={self.api_key}"
            payload = {
                "model": model,
                "content": {"parts": [{"text": text}]}
            }
            try:
                response = httpx.post(url, json=payload, timeout=10.0)
                if response.status_code == 200:
                    return response.json()["embedding"]["values"]
                last_err = response.text
            except Exception as e:
                last_err = str(e)
        
        print(f"Gemini API Error across all fallback models: {last_err}")
        raise RuntimeError(f"Failed to generate embedding: {last_err}")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        last_err = None
        for version, model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/{version}/{model}:batchEmbedContents?key={self.api_key}"
            requests = [
                {"model": model, "content": {"parts": [{"text": t}]}}
                for t in texts
            ]
            try:
                response = httpx.post(url, json={"requests": requests}, timeout=30.0)
                if response.status_code == 200:
                    embeddings = response.json().get("embeddings", [])
                    return [emb["values"] for emb in embeddings]
                last_err = response.text
            except Exception as e:
                last_err = str(e)

        print(f"Gemini API Error across all fallback models: {last_err}")
        raise RuntimeError(f"Failed to generate embeddings: {last_err}")

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
