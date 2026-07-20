import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.chat import ChatConversation, ChatMessage

class ChatService:
    def __init__(self):
        pass

    def create_conversation(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        scan_id: Optional[uuid.UUID] = None, 
        title: str = "New Conversation",
        metadata: Optional[dict] = None
    ) -> ChatConversation:
        conversation = ChatConversation(
            user_id=user_id,
            scan_id=scan_id,
            title=title,
            metadata_=metadata
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def get_conversation(self, db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> ChatConversation:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv

    def search_conversations(self, db: Session, user_id: uuid.UUID) -> List[ChatConversation]:
        return db.query(ChatConversation).filter(
            ChatConversation.user_id == user_id
        ).order_by(ChatConversation.updated_at.desc()).all()

    def update_conversation(
        self, 
        db: Session, 
        conversation_id: uuid.UUID, 
        user_id: uuid.UUID, 
        title: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> ChatConversation:
        conv = self.get_conversation(db, conversation_id, user_id)
        if title is not None:
            conv.title = title
        if metadata is not None:
            # Merge metadata or overwrite? Overwrite for simplicity in this implementation
            conv.metadata_ = metadata
            
        db.commit()
        db.refresh(conv)
        return conv

    def delete_conversation(self, db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID):
        conv = self.get_conversation(db, conversation_id, user_id)
        db.delete(conv)
        db.commit()

    def add_message(
        self, 
        db: Session, 
        conversation_id: uuid.UUID, 
        role: str, 
        content: str
    ) -> ChatMessage:
        message = ChatMessage(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        db.add(message)
        
        # Also update the conversation's updated_at timestamp
        conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
        if conv:
            conv.updated_at = datetime.now(timezone.utc)
            
        db.commit()
        db.refresh(message)
        return message
