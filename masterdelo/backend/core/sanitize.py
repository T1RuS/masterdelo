import re
import bleach


def sanitize_text(value: str, max_length: int = 5000) -> str:
    if not value:
        return value
    cleaned = bleach.clean(value, tags=[], strip=True)
    return cleaned[:max_length].strip()


def sanitize_phone(value: str) -> str:
    if not value:
        return value
    return re.sub(r"[^\d+\-\(\)\s]", "", value)[:20]


def sanitize_filename(filename: str) -> str:
    name = re.sub(r"[^\w\.\-]", "_", filename)
    name = name.replace("..", "").replace("/", "").replace("\\", "")
    return name[:100] if name else "file"
