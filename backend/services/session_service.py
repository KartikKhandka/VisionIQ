from fastapi import Request
from typing import Dict, Any

class SessionService:
    """
    Service responsible for extracting and managing session metadata from HTTP requests.
    """

    @staticmethod
    def extract_session_metadata(request: Request) -> Dict[str, Any]:
        """
        Extracts IP address and User-Agent metadata from a FastAPI request.
        """
        ip_address = request.client.host if request.client else None
        
        # Check proxies if running behind a load balancer
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()

        user_agent = request.headers.get("user-agent", "")
        
        # Extremely basic parsing for MVP. 
        # A more robust library like 'user-agents' can be added in V2.
        browser = "Unknown Browser"
        if "Firefox" in user_agent:
            browser = "Firefox"
        elif "Chrome" in user_agent:
            browser = "Chrome"
        elif "Safari" in user_agent and "Chrome" not in user_agent:
            browser = "Safari"
        elif "Edge" in user_agent:
            browser = "Edge"
            
        operating_system = "Unknown OS"
        if "Windows" in user_agent:
            operating_system = "Windows"
        elif "Mac OS" in user_agent:
            operating_system = "macOS"
        elif "Linux" in user_agent:
            operating_system = "Linux"
        elif "Android" in user_agent:
            operating_system = "Android"
        elif "iOS" in user_agent or "iPhone" in user_agent or "iPad" in user_agent:
            operating_system = "iOS"

        # Construct generic device name for display
        device_name = f"{browser} on {operating_system}" if browser != "Unknown Browser" else "Unknown Device"

        return {
            "ip_address": ip_address,
            "user_agent": user_agent,
            "browser": browser,
            "operating_system": operating_system,
            "device_name": device_name,
            "device_info": device_name # Alias for ActivityLog
        }
