import logging
import json
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
security_logger = logging.getLogger("security")


def log_security_event(
    event: str,
    ip: str,
    details: dict = None,
    level: str = "warning",
) -> None:
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "ip": ip,
        "details": details or {},
    }
    msg = json.dumps(entry, ensure_ascii=False)
    getattr(security_logger, level)(msg)
