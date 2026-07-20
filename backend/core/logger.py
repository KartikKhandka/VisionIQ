import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_obj["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = JSONFormatter() 
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

app_logger = setup_logger("visioniq.app")
request_logger = setup_logger("visioniq.request")
error_logger = setup_logger("visioniq.error")
auth_logger = setup_logger("visioniq.auth")
db_logger = setup_logger("visioniq.db")
