from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Role(BaseModel):
    __tablename__ = "roles"

    name = Column(String, unique=True, index=True, nullable=False)
    permissions = Column(String, nullable=True)
    
    users = relationship("User", back_populates="role")

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=False, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role_id = Column(ForeignKey("roles.id"), nullable=True)
    
    role = relationship("Role", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    scans = relationship("Scan", back_populates="user")
    conversations = relationship("ChatConversation", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")
    email_verification_tokens = relationship("EmailVerificationToken", back_populates="user")

class RefreshToken(BaseModel):
    __tablename__ = "refresh_tokens"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(String, nullable=False) # ISO Format
    revoked = Column(Boolean, default=False)
    
    device_name = Column(String, nullable=True)
    browser = Column(String, nullable=True)
    operating_system = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    last_active_at = Column(String, nullable=True) # ISO Format
    
    user = relationship("User", back_populates="refresh_tokens")

class PasswordResetToken(BaseModel):
    __tablename__ = "password_reset_tokens"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(String, nullable=False)
    used = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="password_reset_tokens")

class EmailVerificationToken(BaseModel):
    __tablename__ = "email_verification_tokens"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(String, nullable=False)
    used = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="email_verification_tokens")
