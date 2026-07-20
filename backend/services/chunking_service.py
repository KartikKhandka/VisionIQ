from abc import ABC, abstractmethod
from typing import List
import re

class ChunkStrategy(ABC):
    @abstractmethod
    def chunk(self, text: str) -> List[str]:
        pass

class RecursiveChunker(ChunkStrategy):
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, text: str) -> List[str]:
        """
        Splits text recursively. In a full implementation, this uses separators like 
        ['\n\n', '\n', ' ', ''] to recursively split text while keeping related content together.
        For simplicity, this provides a basic character-based sliding window.
        """
        if not text:
            return []
            
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + self.chunk_size
            
            # If we're not at the end of the text, try to find a nice break point (e.g. newline or space)
            if end < text_length:
                # Look backwards for a newline
                last_newline = text.rfind('\n', start, end)
                if last_newline != -1 and last_newline > start + self.chunk_size // 2:
                    end = last_newline + 1
                else:
                    # Look backwards for a space
                    last_space = text.rfind(' ', start, end)
                    if last_space != -1 and last_space > start + self.chunk_size // 2:
                        end = last_space + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
                
            start = end - self.chunk_overlap
            
            # Prevent infinite loop if overlap is somehow greater or we didn't advance
            if start <= end - self.chunk_size + self.chunk_overlap:
                start = end - self.chunk_overlap if self.chunk_overlap < self.chunk_size else end

        return chunks

class SemanticChunker(ChunkStrategy):
    def chunk(self, text: str) -> List[str]:
        raise NotImplementedError("SemanticChunker not implemented yet.")

class SentenceChunker(ChunkStrategy):
    def chunk(self, text: str) -> List[str]:
        raise NotImplementedError("SentenceChunker not implemented yet.")
