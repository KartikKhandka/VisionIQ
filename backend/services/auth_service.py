from sqlalchemy.orm import Session
from core.security import verify_password, get_password_hash, create_access_token
from core.exceptions import CredentialsException, BadRequestException, NotFoundException
from repositories.user_repo import UserRepository
from repositories.token_repo import RefreshTokenRepository, PasswordResetTokenRepository, EmailVerificationTokenRepository
from repositories.activity_repo import ActivityLogRepository
from schemas.auth import LoginRequest, TokenResponse
from schemas.user import UserCreate
from models.user import User
from services.token_service import TokenService
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from core.config import settings
import uuid

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = RefreshTokenRepository(db)
        self.reset_repo = PasswordResetTokenRepository(db)
        self.verification_repo = EmailVerificationTokenRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    def _log_activity(self, user_id: uuid.UUID, action: str, session_metadata: Dict[str, Any] = None):
        log_data = {
            "user_id": user_id,
            "action": action,
            "resource": "auth"
        }
        if session_metadata:
            log_data.update({
                "ip_address": session_metadata.get("ip_address"),
                "user_agent": session_metadata.get("user_agent"),
                "device_info": session_metadata.get("device_info")
            })
        self.activity_repo.create(log_data)

    def register_user(self, user_in: UserCreate, session_metadata: Dict[str, Any] = None) -> User:
        print(f"[DEBUG] register_user called with email: {user_in.email}")
        if self.user_repo.get_by_email(user_in.email):
            print(f"[DEBUG] Email already registered: {user_in.email}")
            raise BadRequestException(detail="Email already registered")
            
        hashed_password = get_password_hash(user_in.password)
        print(f"[DEBUG] Password hashed successfully")
        
        user_data = {
            "email": user_in.email,
            "username": user_in.username,
            "password_hash": hashed_password,
            "full_name": user_in.full_name,
            "is_active": True,
            "is_verified": False
        }
        
        try:
            user = self.user_repo.create(user_data)
            print(f"[DEBUG] User created in database with ID: {user.id}")
        except Exception as e:
            print(f"[DEBUG] Exception creating user: {e}")
            raise
        
        # Email Verification Token
        try:
            raw_token = TokenService.generate_secure_token()
            token_hash = TokenService.hash_token(raw_token)
            expire_date = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
            
            self.verification_repo.create({
                "user_id": user.id,
                "token": token_hash,
                "expires_at": expire_date
            })
            print(f"[DEBUG] Verification token created")
        except Exception as e:
            print(f"[DEBUG] Exception creating verification token: {e}")
            raise
        
        # Placeholder for celery email task: send_verification_email.delay(user.email, raw_token)
        
        self._log_activity(user.id, "register", session_metadata)
        return user

    def authenticate_user(self, login_req: LoginRequest, session_metadata: Dict[str, Any] = None) -> TokenResponse:
        print(f"[DEBUG] authenticate_user called for email: {login_req.email}")
        try:
            user = self.user_repo.get_by_email(login_req.email)
        except Exception as e:
            print(f"[DEBUG] Exception fetching user: {e}")
            raise
            
        if not user:
            print(f"[DEBUG] User not found for email: {login_req.email}")
            raise CredentialsException(detail="Incorrect email or password")
            
        try:
            is_valid = verify_password(login_req.password, user.password_hash)
        except Exception as e:
            print(f"[DEBUG] Exception verifying password: {e}")
            raise
            
        if not is_valid:
            print(f"[DEBUG] Password verification failed for email: {login_req.email}")
            self._log_activity(user.id, "failed_login", session_metadata)
            raise CredentialsException(detail="Incorrect email or password")
            
        print(f"[DEBUG] User authenticated successfully: {user.id}")
        if user.deleted_at:
            raise CredentialsException(detail="Account is inactive")
            
        # Stateless Access Token
        access_token = create_access_token(subject=str(user.id))
        
        # Stateful Refresh Token
        raw_refresh_token = TokenService.generate_secure_token(64)
        hashed_refresh_token = TokenService.hash_token(raw_refresh_token)
        
        expire_days = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
        expire_date = (datetime.now(timezone.utc) + timedelta(days=expire_days)).isoformat()
        
        token_data = {
            "user_id": user.id,
            "token": hashed_refresh_token,
            "expires_at": expire_date,
            "last_active_at": datetime.now(timezone.utc).isoformat()
        }
        if session_metadata:
            token_data.update({
                "device_name": session_metadata.get("device_name"),
                "browser": session_metadata.get("browser"),
                "operating_system": session_metadata.get("operating_system"),
                "ip_address": session_metadata.get("ip_address"),
                "user_agent": session_metadata.get("user_agent")
            })
            
        self.token_repo.create(token_data)
        self._log_activity(user.id, "login_success", session_metadata)
        
        return TokenResponse(access_token=access_token, refresh_token=raw_refresh_token)

    def refresh_access_token(self, raw_refresh_token: str, session_metadata: Dict[str, Any] = None) -> TokenResponse:
        hashed_token = TokenService.hash_token(raw_refresh_token)
        token_obj = self.token_repo.get_by_token(hashed_token)
        
        if not token_obj:
            raise CredentialsException(detail="Invalid or revoked refresh token")
            
        # Check expiry
        if datetime.fromisoformat(token_obj.expires_at) < datetime.now(timezone.utc):
            self.token_repo.update(token_obj, {"revoked": True})
            raise CredentialsException(detail="Refresh token expired")
            
        user = self.user_repo.get_by_id(token_obj.user_id)
        if not user or user.deleted_at:
            raise CredentialsException(detail="User inactive or deleted")

        # ROTATION: Revoke the old token
        self.token_repo.update(token_obj, {"revoked": True})
        
        # Issue new pair
        new_access_token = create_access_token(subject=str(user.id))
        new_raw_refresh = TokenService.generate_secure_token(64)
        new_hashed_refresh = TokenService.hash_token(new_raw_refresh)
        
        expire_days = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
        expire_date = (datetime.now(timezone.utc) + timedelta(days=expire_days)).isoformat()
        
        token_data = {
            "user_id": user.id,
            "token": new_hashed_refresh,
            "expires_at": expire_date,
            "last_active_at": datetime.now(timezone.utc).isoformat()
        }
        if session_metadata:
            token_data.update({
                "device_name": session_metadata.get("device_name"),
                "browser": session_metadata.get("browser"),
                "operating_system": session_metadata.get("operating_system"),
                "ip_address": session_metadata.get("ip_address"),
                "user_agent": session_metadata.get("user_agent")
            })
            
        self.token_repo.create(token_data)
        self._log_activity(user.id, "refresh_token_rotation", session_metadata)
        
        return TokenResponse(access_token=new_access_token, refresh_token=new_raw_refresh)
        
    def logout(self, raw_refresh_token: str, user: User, session_metadata: Dict[str, Any] = None):
        hashed_token = TokenService.hash_token(raw_refresh_token)
        token_obj = self.token_repo.get_by_token(hashed_token)
        if token_obj:
            self.token_repo.update(token_obj, {"revoked": True})
            
        self._log_activity(user.id, "logout", session_metadata)

    def forgot_password(self, email: str, session_metadata: Dict[str, Any] = None) -> None:
        user = self.user_repo.get_by_email(email)
        if not user or user.deleted_at:
            return # Silent fail for security
            
        raw_token = TokenService.generate_secure_token()
        token_hash = TokenService.hash_token(raw_token)
        expire_date = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
        
        self.reset_repo.create({
            "user_id": user.id,
            "token": token_hash,
            "expires_at": expire_date
        })
        
        # Placeholder for celery: send_password_reset_email.delay(email, raw_token)
        self._log_activity(user.id, "password_reset_requested", session_metadata)

    def reset_password(self, raw_token: str, new_password: str, session_metadata: Dict[str, Any] = None) -> None:
        token_hash = TokenService.hash_token(raw_token)
        token_obj = self.reset_repo.get_by_token(token_hash)
        
        if not token_obj:
            raise BadRequestException(detail="Invalid or expired token")
            
        if datetime.fromisoformat(token_obj.expires_at) < datetime.now(timezone.utc):
            self.reset_repo.update(token_obj, {"used": True})
            raise BadRequestException(detail="Token expired")
            
        user = self.user_repo.get_by_id(token_obj.user_id)
        if not user or user.deleted_at:
            raise BadRequestException(detail="User inactive or deleted")
            
        hashed_password = get_password_hash(new_password)
        self.user_repo.update(user, {"password_hash": hashed_password})
        
        self.reset_repo.update(token_obj, {"used": True})
        self._log_activity(user.id, "password_reset_completed", session_metadata)

    def verify_email(self, raw_token: str, session_metadata: Dict[str, Any] = None) -> None:
        token_hash = TokenService.hash_token(raw_token)
        token_obj = self.verification_repo.get_by_token(token_hash)
        
        if not token_obj:
            raise BadRequestException(detail="Invalid or expired token")
            
        if datetime.fromisoformat(token_obj.expires_at) < datetime.now(timezone.utc):
            self.verification_repo.update(token_obj, {"used": True})
            raise BadRequestException(detail="Token expired")
            
        user = self.user_repo.get_by_id(token_obj.user_id)
        if user and not user.deleted_at:
            self.user_repo.update(user, {"is_verified": True})
            
        self.verification_repo.update(token_obj, {"used": True})
        self._log_activity(user.id, "email_verified", session_metadata)

    def get_sessions(self, user_id: uuid.UUID):
        return self.db.query(self.token_repo.model).filter(
            self.token_repo.model.user_id == user_id, 
            self.token_repo.model.revoked == False
        ).all()
        
    def revoke_session(self, user_id: uuid.UUID, session_id: str):
        session = self.token_repo.get_by_id(session_id)
        if session and session.user_id == user_id:
            self.token_repo.update(session, {"revoked": True})
            self._log_activity(user_id, "session_revoked")
            
    def revoke_all_other_sessions(self, user_id: uuid.UUID, current_raw_token: str):
        current_hash = TokenService.hash_token(current_raw_token)
        sessions = self.get_sessions(user_id)
        for session in sessions:
            if session.token != current_hash:
                self.token_repo.update(session, {"revoked": True})
        self._log_activity(user_id, "all_other_sessions_revoked")
