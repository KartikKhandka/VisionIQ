from sqlalchemy import Column, String, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class ChatConversation(BaseModel):
    __tablename__ = "chat_conversations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, default="New Conversation")
    metadata_ = Column("metadata", JSON, nullable=True)
    
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")
    user = relationship("User", back_populates="conversations")


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    tokens = Column(Integer, nullable=True)
    
    conversation = relationship("ChatConversation", back_populates="messages")
