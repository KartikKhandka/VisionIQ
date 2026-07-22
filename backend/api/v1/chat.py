import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from database.database import get_db
from api.deps import get_current_active_user
from models.user import User

from schemas.chat import (
    ChatConversationResponse,
    ChatConversationCreate,
    ChatConversationUpdate,
    ChatMessageResponse
)

from services.chat_service import ChatService
from services.rag_service import RAGService
from services.vector_search_service import VectorSearchService
from services.providers.embeddings import GeminiEmbeddingProvider
from services.providers.provider_factory import get_llm_provider

router = APIRouter()


chat_service = ChatService()
vector_search_service = VectorSearchService()

try:
    embedding_provider = GeminiEmbeddingProvider()
except Exception as e:
    print(f"Warning: Could not initialize embedding provider: {e}")
    embedding_provider = None

llm_provider = get_llm_provider()

rag_service = RAGService(
    vector_search_service=vector_search_service,
    embedding_provider=embedding_provider,
    llm_provider=llm_provider,
    chat_service=chat_service
)


@router.post("/conversations", response_model=ChatConversationResponse)
def create_conversation(
    conv_in: ChatConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return chat_service.create_conversation(
        db, 
        user_id=current_user.id, 
        scan_id=conv_in.scan_id, 
        title=conv_in.title,
        metadata=conv_in.metadata_
    )


@router.get("/conversations", response_model=List[ChatConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return chat_service.search_conversations(db, current_user.id)


@router.get("/{conversation_id}", response_model=ChatConversationResponse)
def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return chat_service.get_conversation(db, conversation_id, current_user.id)


@router.patch("/{conversation_id}", response_model=ChatConversationResponse)
def update_conversation(
    conversation_id: uuid.UUID,
    conv_in: ChatConversationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return chat_service.update_conversation(
        db, 
        conversation_id, 
        current_user.id, 
        title=conv_in.title, 
        metadata=conv_in.metadata_
    )


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    chat_service.delete_conversation(db, conversation_id, current_user.id)
    return {"message": "Conversation deleted"}


class MessageCreate(BaseModel):
    content: str

@router.post("/{conversation_id}/message")
async def send_message(
    conversation_id: uuid.UUID,
    message: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    
    conv = chat_service.get_conversation(db, conversation_id, current_user.id)
    
    if not message.content:
        raise HTTPException(status_code=400, detail="Content is required")

    scan_metadata = conv.metadata_ if conv.metadata_ else None
    
    import logging
    logger = logging.getLogger("chat_debug")
    logger.info(f"[DEBUG-TRACE] api/v1/chat.py: send_message called for conv {conversation_id}")
    logger.info(f"[DEBUG-TRACE] api/v1/chat.py: scan_metadata passed to RAG: {bool(scan_metadata)}")
    
    async def event_generator():
        try:
            async for chunk in rag_service.generate_rag_response(
                db=db,
                conversation_id=conversation_id,
                user_id=current_user.id,
                user_message=message.content,
                scan_metadata=scan_metadata
            ):
                yield chunk
        except Exception as e:
            from services.providers.exceptions import AIProviderError
            if isinstance(e, AIProviderError):
                logger.error(f"[DEBUG-TRACE] api/v1/chat.py: AIProviderError during stream: {e}")
                yield "\n\n[System: The AI service is temporarily unavailable. Please try again shortly.]"
            else:
                logger.error(f"[DEBUG-TRACE] api/v1/chat.py: Unexpected error during stream: {e}")
                yield "\n\n[System: An unexpected error occurred. Please try again shortly.]"

    return StreamingResponse(event_generator(), media_type="text/plain")
