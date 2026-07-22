from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
import uuid
import re

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[0-9]", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
