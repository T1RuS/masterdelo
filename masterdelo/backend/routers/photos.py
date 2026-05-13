import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.deps import get_db, get_current_user
from core.config import settings
from models.user import User
from models.order import Order
from models.photo import Photo
from schemas.photo import PhotoOut

router = APIRouter(prefix="/api/orders", tags=["photos"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


async def _get_order_or_404(order_id: str, user_id: str, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.get("/{order_id}/photos", response_model=List[PhotoOut])
async def list_photos(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_order_or_404(order_id, current_user.id, db)
    result = await db.execute(select(Photo).where(Photo.order_id == order_id))
    return result.scalars().all()


@router.post("/{order_id}/photos", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    order_id: str,
    file: UploadFile = File(...),
    stage: str = Form(default="process"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_order_or_404(order_id, current_user.id, db)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только JPEG, PNG и WebP файлы")

    if stage not in ("before", "process", "after"):
        raise HTTPException(status_code=400, detail="Недопустимый этап (before/process/after)")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"Файл слишком большой (макс {settings.MAX_UPLOAD_SIZE_MB}MB)")

    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(contents))
        img = img.convert("RGB")
        max_dim = 1200
        if img.width > max_dim or img.height > max_dim:
            img.thumbnail((max_dim, max_dim), Image.LANCZOS)

        save_dir = os.path.join(settings.UPLOAD_DIR, current_user.id, order_id)
        os.makedirs(save_dir, exist_ok=True)

        filename = f"{uuid.uuid4()}.jpg"
        file_path_rel = os.path.join(save_dir, filename).replace("\\", "/")

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        with open(file_path_rel, "wb") as f:
            f.write(buf.getvalue())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обработки изображения: {str(e)}")

    photo = Photo(order_id=order_id, file_path=f"/{file_path_rel}", stage=stage)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.delete("/{order_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    order_id: str,
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_order_or_404(order_id, current_user.id, db)
    result = await db.execute(
        select(Photo).where(Photo.id == photo_id, Photo.order_id == order_id)
    )
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Фото не найдено")

    try:
        path = photo.file_path.lstrip("/")
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

    await db.delete(photo)
    await db.commit()
