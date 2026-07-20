from typing import Optional
from sqlalchemy.orm import Session
from models.user import RefreshToken, PasswordResetToken, EmailVerificationToken
from .base import BaseRepository

class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: Session):
        super().__init__(RefreshToken, db)
        
    def get_by_token(self, token: str) -> Optional[RefreshToken]:
        return self.db.query(RefreshToken).filter(RefreshToken.token == token, RefreshToken.revoked == False).first()

class PasswordResetTokenRepository(BaseRepository[PasswordResetToken]):
    def __init__(self, db: Session):
        super().__init__(PasswordResetToken, db)

    def get_by_token(self, token: str) -> Optional[PasswordResetToken]:
        return self.db.query(PasswordResetToken).filter(PasswordResetToken.token == token, PasswordResetToken.used == False).first()

class EmailVerificationTokenRepository(BaseRepository[EmailVerificationToken]):
    def __init__(self, db: Session):
        super().__init__(EmailVerificationToken, db)

    def get_by_token(self, token: str) -> Optional[EmailVerificationToken]:
        return self.db.query(EmailVerificationToken).filter(EmailVerificationToken.token == token, EmailVerificationToken.used == False).first()
