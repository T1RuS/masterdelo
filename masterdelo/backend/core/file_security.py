import uuid
import io
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_IMAGE_DIMENSION = 1200

# PIL format names that map to our allowed types
_ALLOWED_PIL_FORMATS = {"JPEG", "PNG", "WEBP"}


async def validate_and_save_image(
    file: UploadFile,
    user_id: str,
    order_id: str,
    upload_dir: str = "static/uploads",
) -> str:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Недопустимый тип файла. Разрешены: JPEG, PNG, WebP",
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Файл слишком большой. Максимум 10MB.")

    # Verify and re-open through PIL — strips any embedded payloads
    try:
        probe = Image.open(io.BytesIO(contents))
        if probe.format not in _ALLOWED_PIL_FORMATS:
            raise ValueError("unsupported format")
        probe.verify()
        image = Image.open(io.BytesIO(contents))
        image = image.convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Файл повреждён или не является изображением.",
        )

    if max(image.width, image.height) > MAX_IMAGE_DIMENSION:
        image.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.LANCZOS)

    safe_filename = f"{uuid.uuid4().hex}.jpg"
    save_dir = Path(upload_dir) / user_id / order_id
    save_dir.mkdir(parents=True, exist_ok=True)
    save_path = save_dir / safe_filename

    image.save(save_path, format="JPEG", quality=85, optimize=True)

    return str(Path(user_id) / order_id / safe_filename).replace("\\", "/")
