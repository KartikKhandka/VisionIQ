import uuid
import asyncio
from typing import AsyncGenerator
from sqlalchemy.orm import Session
import logging

from .vector_search_service import VectorSearchService
from .providers.base import EmbeddingProvider, LLMProvider
from .chat_service import ChatService

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    logger.addHandler(ch)

CHAT_HISTORY_WINDOW = 6

class RAGService:
    def __init__(
        self,
        vector_search_service: VectorSearchService,
        embedding_provider: EmbeddingProvider,
        llm_provider: LLMProvider,
        chat_service: ChatService
    ):
        self.vector_search = vector_search_service
        self.embedding_provider = embedding_provider
        self.llm_provider = llm_provider
        self.chat_service = chat_service

    def build_system_prompt(self, context_chunks: list, scan_metadata: dict, chat_history_text: str) -> str:
        prompt = (
            "You are VisionIQ Appliance Expert, a highly knowledgeable AI assistant specializing in "
            "home and commercial appliances.\n\n"
            "YOUR EXPERTISE:\n"
            "- Identify appliances, brands, and models from images\n"
            "- Explain how appliances work and how to use them\n"
            "- Interpret control panels, buttons, displays, and error codes\n"
            "- Provide maintenance tips and troubleshooting guidance\n"
            "- Explain warning labels and safety information\n"
            "- Reference product manuals when available\n"
            "- Explain energy ratings and specifications\n\n"
            "STRICT RULES:\n"
            "1. Answer from retrieved manuals and knowledge base FIRST.\n"
            "2. Then use OCR text extracted from the scanned image.\n"
            "3. Then use scan metadata (detected objects, tags, appliance info).\n"
            "4. NEVER invent model numbers, serial numbers, specifications, or brand names.\n"
            "5. NEVER hallucinate features, error codes, or maintenance procedures.\n"
            "6. If the information is NOT available in the provided context, clearly say:\n"
            "   'I don't have enough information to answer that. You may want to check the product manual.'\n"
            "7. Explain uncertainty naturally and honestly.\n"
            "8. Be conversational, direct, and helpful.\n"
            "9. DO NOT use generic opening phrases like 'I analyzed the image...'.\n"
            "10. When citing manual content, mention the source document.\n\n"
        )
        
        prompt += "--- CONVERSATION HISTORY ---\n"
        if chat_history_text:
            prompt += chat_history_text + "\n"
        else:
            prompt += "No previous conversation.\n\n"
        
        prompt += "--- APPLIANCE SCAN METADATA ---\n"
        if scan_metadata and any(scan_metadata.values()):
            for k, v in scan_metadata.items():
                if v:  # Only include non-empty values
                    prompt += f"- {k}: {v}\n"
        else:
            prompt += "No scan metadata available.\n"
        prompt += "\n"
            
        prompt += "--- RELEVANT KNOWLEDGE BASE / MANUAL CONTENT ---\n"
        if context_chunks:
            for i, chunk_tuple in enumerate(context_chunks):
                chunk = chunk_tuple[0]
                source_title = "Unknown"
                if hasattr(chunk, 'metadata_') and chunk.metadata_:
                    source_title = chunk.metadata_.get('title', 'Unknown')
                prompt += f"[Source {i+1} - {source_title}]: {chunk.text}\n"
        else:
            prompt += "No relevant knowledge found.\n"
        prompt += "\n"
            
        prompt += "Answer the user's latest question accurately using the provided context."
        return prompt

    def _rerank_chunks(self, retrieved_chunks: list, scan_metadata: dict) -> list:
        """Re-rank retrieved chunks by boosting those matching the scan's brand/model/appliance_type."""
        if not scan_metadata or not retrieved_chunks:
            return retrieved_chunks
        
        # Extract appliance identifiers from scan metadata
        scan_brand = ""
        scan_model = ""
        scan_appliance_type = ""
        
        tags = scan_metadata.get("tags", [])
        if isinstance(tags, list):
            for tag in tags:
                if isinstance(tag, str):
                    if tag.startswith("Brands: "):
                        scan_brand = tag.replace("Brands: ", "").lower()
                    elif tag.startswith("Model: "):
                        scan_model = tag.replace("Model: ", "").lower()
                    elif tag.startswith("Appliance Type: "):
                        scan_appliance_type = tag.replace("Appliance Type: ", "").lower()
        
        if not scan_brand and not scan_model and not scan_appliance_type:
            return retrieved_chunks
        
        reranked = []
        for chunk, distance in retrieved_chunks:
            boost = 0.0
            chunk_meta = chunk.metadata_ if hasattr(chunk, 'metadata_') and chunk.metadata_ else {}
            chunk_brand = (chunk_meta.get("brand") or "").lower()
            chunk_category = (chunk_meta.get("category") or "").lower()
            chunk_title = (chunk_meta.get("title") or "").lower()
            
            # Brand match: strong boost
            if scan_brand and (scan_brand in chunk_brand or scan_brand in chunk_title):
                boost += 0.3
            
            # Model match: strongest boost
            if scan_model and scan_model in chunk_title:
                boost += 0.4
            
            # Appliance type match: moderate boost
            if scan_appliance_type and (scan_appliance_type in chunk_category or scan_appliance_type in chunk_title):
                boost += 0.2
            
            # Apply boost: lower distance = more relevant
            adjusted_distance = max(0.0, distance - boost)
            reranked.append((chunk, adjusted_distance))
        
        # Re-sort by adjusted distance
        reranked.sort(key=lambda x: x[1])
        return reranked

    async def generate_rag_response(
        self,
        db: Session,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        user_message: str,
        scan_metadata: dict = None
    ) -> AsyncGenerator[str, None]:
        
        # 1. Fetch previous conversation context BEFORE saving the new user message
        conv = self.chat_service.get_conversation(db, conversation_id, user_id)
        chat_history_text = ""
        has_history = False
        if conv and conv.messages:
            history_msgs = conv.messages[-CHAT_HISTORY_WINDOW:]
            if history_msgs:
                has_history = True
                for msg in history_msgs:
                    chat_history_text += f"{msg.role.upper()}: {msg.content}\n"
        
        # 2. Save new user message
        self.chat_service.add_message(db, conversation_id, role="user", content=user_message)
        
        # 3. Generate embedding for the question & retrieve Top-K Chunks
        retrieved_chunks = []
        if self.embedding_provider:
            try:
                question_embedding = self.embedding_provider.generate_embedding(user_message)
                retrieved_chunks = self.vector_search.similarity_search(
                    db, 
                    query_embedding=question_embedding, 
                    top_k=10
                )
                retrieved_chunks = self._rerank_chunks(retrieved_chunks, scan_metadata)
                retrieved_chunks = retrieved_chunks[:5]
            except Exception as e:
                logger.warning(f"[RAGService] Knowledge embedding failed, proceeding with general LLM chat: {e}")
                retrieved_chunks = []
        
        # Determine availability flags
        has_objects = bool(scan_metadata and scan_metadata.get("detected_objects"))
        has_ocr = bool(scan_metadata and scan_metadata.get("ocr_text"))
        has_tags = bool(scan_metadata and scan_metadata.get("tags"))
        has_vision = has_objects or has_ocr or has_tags
        has_knowledge = len(retrieved_chunks) > 0
        
        # 6. Assemble Context
        system_prompt = self.build_system_prompt(retrieved_chunks, scan_metadata or {}, chat_history_text)
        final_prompt_length = len(system_prompt) + len(user_message)
        
        # --- DEBUG LOGGING ---
        logger.info("\n=== RAG PROMPT PREPARATION ===")
        logger.info(f"Vision Context Available: {'YES' if has_vision else 'NO'}")
        logger.info(f"Knowledge Context Available: {'YES' if has_knowledge else 'NO'}")
        logger.info(f"Conversation History Available: {'YES' if has_history else 'NO'}")
        logger.info(f"Scan Metadata: Objects: {len(scan_metadata.get('detected_objects', [])) if scan_metadata else 0} | OCR: {'Present' if has_ocr else 'None'} | Tags: {len(scan_metadata.get('tags', [])) if scan_metadata else 0}")
        logger.info(f"Retrieved Chunk Count: {len(retrieved_chunks)}")
        
        if has_knowledge:
            for i, (chunk, distance) in enumerate(retrieved_chunks):
                chunk_id = getattr(chunk, 'id', 'Unknown')
                title = chunk.metadata_.get('title', 'Unknown') if hasattr(chunk, 'metadata_') and chunk.metadata_ else 'Unknown'
                logger.info(f"  [Chunk {i+1}] ID: {chunk_id} | Distance: {distance:.4f} | Source: {title}")
                
        logger.info(f"Final Prompt Length: {final_prompt_length} characters")
        logger.info("==============================\n")
        
        # 7. Stream LLM Response
        full_response = ""
        try:
            logger.info(f"[DEBUG-TRACE] services/rag_service.py: Calling generate_stream on {self.llm_provider.__class__.__name__}")
            async for chunk in self.llm_provider.generate_stream(prompt=user_message, system_prompt=system_prompt):
                full_response += chunk
                yield chunk
                
            # Append Citations metadata block at the very end
            if has_knowledge:
                import json
                citations = []
                for i, (chunk, distance) in enumerate(retrieved_chunks):
                    # convert distance (L2 or cosine) to a similarity score 0-1
                    similarity = max(0.0, min(1.0, 1.0 - (distance / 2.0))) if distance > 0 else 0.99
                    
                    title = "Unknown Document"
                    page = 1
                    if hasattr(chunk, 'metadata_') and chunk.metadata_:
                        title = chunk.metadata_.get('title', title)
                        page = chunk.metadata_.get('page_number', page)
                        
                    citations.append({
                        "id": i + 1,
                        "title": title,
                        "page": page,
                        "score": round(similarity, 2),
                        "text": chunk.text
                    })
                
                citations_block = "\n\n---CITATIONS---\n" + json.dumps(citations)
                full_response += citations_block
                yield citations_block
                
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error generating response: {error_str}", exc_info=True)
            
            # Hide raw API errors from the user
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                error_msg = "The AI service is temporarily unavailable because the API quota has been exceeded. Please try again in about a minute, or contact the administrator if the issue persists."
            else:
                error_msg = "An error occurred while generating the response. Please try again later."
                
            self.chat_service.add_message(db, conversation_id, role="assistant", content=error_msg)
            yield error_msg
            return

        # 8. Persist Assistant Message
        if full_response:
            self.chat_service.add_message(db, conversation_id, role="assistant", content=full_response)
