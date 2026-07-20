from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from schemas.auth import LoginRequest, TokenResponse, PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest, ResendVerificationRequest, SessionResponse
from schemas.user import UserCreate, UserResponse
from services.auth_service import AuthService
from services.session_service import SessionService
from database.database import get_db
from api.deps import get_current_active_user
from models.user import User
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter(
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        404: {"description": "Not Found"},
        500: {"description": "Internal Server Error"},
    }
)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post(
    "/register", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    return auth_service.register_user(user_in, session_metadata)

@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="Authenticate user"
)
def login(request: Request, login_req: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    return auth_service.authenticate_user(login_req, session_metadata)

@router.post(
    "/refresh", 
    response_model=TokenResponse,
    summary="Refresh access token"
)
def refresh_token(request: Request, req: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    return auth_service.refresh_access_token(req.refresh_token, session_metadata)

@router.post(
    "/logout",
    summary="Logout user"
)
def logout(request: Request, req: RefreshTokenRequest, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> Dict[str, str]:
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    auth_service.logout(req.refresh_token, current_user, session_metadata)
    return {"message": "Logged out successfully"}

@router.post(
    "/forgot-password",
    summary="Request password reset"
)
def forgot_password(request: Request, req: PasswordResetRequest, db: Session = Depends(get_db)) -> Dict[str, str]:
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    auth_service.forgot_password(req.email, session_metadata)
    return {"message": "If the email exists, a reset link has been sent"}

@router.post(
    "/reset-password",
    summary="Reset password"
)
def reset_password(request: Request, req: PasswordResetConfirm, db: Session = Depends(get_db)) -> Dict[str, str]:
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    auth_service.reset_password(req.token, req.new_password, session_metadata)
    return {"message": "Password reset successfully"}

@router.post(
    "/verify-email",
    summary="Verify email address"
)
def verify_email(request: Request, req: EmailVerificationRequest, db: Session = Depends(get_db)) -> Dict[str, str]:
    auth_service = AuthService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    auth_service.verify_email(req.token, session_metadata)
    return {"message": "Email successfully verified"}

@router.get(
    "/sessions",
    response_model=List[SessionResponse],
    summary="Get active sessions"
)
def get_sessions(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.get_sessions(current_user.id)

@router.delete(
    "/sessions/{session_id}",
    summary="Revoke a specific session"
)
def revoke_session(session_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.revoke_session(current_user.id, session_id)
    return {"message": "Session revoked"}

@router.delete(
    "/sessions",
    summary="Revoke all other sessions"
)
def revoke_all_sessions(req: RefreshTokenRequest, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.revoke_all_other_sessions(current_user.id, req.refresh_token)
    return {"message": "All other sessions revoked"}
