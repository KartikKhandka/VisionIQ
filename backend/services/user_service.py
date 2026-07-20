from sqlalchemy.orm import Session
from core.security import get_password_hash
from core.exceptions import BadRequestException
from repositories.user_repo import UserRepository
from repositories.activity_repo import ActivityLogRepository
from schemas.user import UserUpdate
from models.user import User
from typing import Dict, Any
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.activity_repo = ActivityLogRepository(db)
        
    def _log_activity(self, user_id: uuid.UUID, action: str, session_metadata: Dict[str, Any] = None):
        log_data = {
            "user_id": user_id,
            "action": action,
            "resource": "user"
        }
        if session_metadata:
            log_data.update({
                "ip_address": session_metadata.get("ip_address"),
                "user_agent": session_metadata.get("user_agent"),
                "device_info": session_metadata.get("device_info")
            })
        self.activity_repo.create(log_data)

    def update_user(self, current_user: User, user_in: UserUpdate, session_metadata: Dict[str, Any] = None) -> User:
        update_data = user_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
            self._log_activity(current_user.id, "password_change", session_metadata)
            
        if "email" in update_data and update_data["email"] != current_user.email:
            if self.user_repo.get_by_email(update_data["email"]):
                raise BadRequestException(detail="Email already taken")
                
        user = self.user_repo.update(current_user, update_data)
        self._log_activity(current_user.id, "profile_updated", session_metadata)
        return user

    def soft_delete_user(self, current_user: User, session_metadata: Dict[str, Any] = None):
        self.user_repo.soft_delete(current_user)
        self._log_activity(current_user.id, "account_deleted", session_metadata)
