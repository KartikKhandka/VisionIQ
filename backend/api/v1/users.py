from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.user import UserResponse, UserUpdate
from services.user_service import UserService
from services.session_service import SessionService
from api.deps import get_current_active_user
from models.user import User
from typing import Dict

router = APIRouter(
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        404: {"description": "Not Found"},
        500: {"description": "Internal Server Error"},
    }
)

@router.get("/me", response_model=UserResponse, summary="Get current user profile")
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.patch("/me", response_model=UserResponse, summary="Update current user profile")
def update_me(request: Request, user_in: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    user_service = UserService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    return user_service.update_user(current_user, user_in, session_metadata)

@router.delete("/me", summary="Delete current user account")
def delete_me(request: Request, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> Dict[str, str]:
    user_service = UserService(db)
    session_metadata = SessionService.extract_session_metadata(request)
    user_service.soft_delete_user(current_user, session_metadata)
    return {"message": "Account successfully deleted"}
