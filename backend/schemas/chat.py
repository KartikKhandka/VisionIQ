import uuid
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str
    content: str
    tokens: Optional[int] = None

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatConversationBase(BaseModel):
    scan_id: Optional[uuid.UUID] = None
    title: str = "New Conversation"
    metadata_: Optional[Dict[str, Any]] = None

class ChatConversationCreate(ChatConversationBase):
    pass

class ChatConversationUpdate(BaseModel):
    title: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None

class ChatConversationResponse(ChatConversationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
