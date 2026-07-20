from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from core.config import settings
from core.exceptions import CredentialsException, NotFoundException
from database.database import get_db
from repositories.user_repo import UserRepository
from models.user import User
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise CredentialsException()
    except JWTError:
        raise CredentialsException()
    
    user_repo = UserRepository(db)
    try:
        user_uuid = uuid.UUID(user_id)
        user = user_repo.get_by_id(user_uuid)
    except ValueError:
        raise CredentialsException()
        
    if user is None:
        raise NotFoundException(detail="User not found")
    if user.deleted_at is not None:
        raise CredentialsException(detail="User is inactive")
        
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise CredentialsException(detail="Inactive user")
    return current_user
