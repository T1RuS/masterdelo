import time
from collections import defaultdict
from threading import Lock

_failed_attempts: dict[str, list[float]] = defaultdict(list)
_blocked_ips: dict[str, float] = {}
_lock = Lock()

WINDOW_SECONDS = 900
MAX_ATTEMPTS = 10
BLOCK_SECONDS = 3600


def is_blocked(ip: str) -> bool:
    if ip in _blocked_ips:
        if time.time() < _blocked_ips[ip]:
            return True
        del _blocked_ips[ip]
    return False


def record_failed_attempt(ip: str) -> None:
    now = time.time()
    with _lock:
        _failed_attempts[ip] = [
            t for t in _failed_attempts[ip] if now - t < WINDOW_SECONDS
        ]
        _failed_attempts[ip].append(now)
        if len(_failed_attempts[ip]) >= MAX_ATTEMPTS:
            _blocked_ips[ip] = now + BLOCK_SECONDS
            _failed_attempts[ip].clear()


def reset_attempts(ip: str) -> None:
    with _lock:
        _failed_attempts.pop(ip, None)


def get_remaining_attempts(ip: str) -> int:
    now = time.time()
    recent = [t for t in _failed_attempts.get(ip, []) if now - t < WINDOW_SECONDS]
    return max(0, MAX_ATTEMPTS - len(recent))
