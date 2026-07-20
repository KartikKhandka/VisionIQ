import secrets
import hashlib

class TokenService:
    """
    Service responsible for generating and hashing cryptographically secure tokens.
    """
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """
        Generates a URL-safe cryptographically secure random string.
        """
        return secrets.token_urlsafe(length)

    @staticmethod
    def hash_token(token: str) -> str:
        """
        Generates a SHA-256 hash of the provided token.
        This hash should be stored in the database, while the plain token is sent to the user.
        """
        return hashlib.sha256(token.encode('utf-8')).hexdigest()
