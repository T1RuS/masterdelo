from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.deps import get_db, get_current_user
from core.limiter import limiter
from core.file_security import validate_and_save_image
from core.logging import log_security_event
from core.config import settings
from models.user import User
from models.order import Order
from models.photo import Photo
from schemas.photo import PhotoOut

router = APIRouter(prefix="/api/orders", tags=["photos"])


async def _get_order_or_404(order_id: str, user_id: str, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.get("/{order_id}/photos", response_model=List[PhotoOut])
@limiter.limit("60/minute")
async def list_photos(
    request: Request,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_order_or_404(order_id, current_user.id, db)
    result = await db.execute(select(Photo).where(Photo.order_id == order_id))
    return result.scalars().all()


@router.post("/{order_id}/photos", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
@limiter.limit("100/hour")
async def upload_photo(
    request: Request,
    order_id: str,
    file: UploadFile = File(...),
    stage: str = Form(default="process"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_order_or_404(order_id, current_user.id, db)

    if stage not in ("before", "process", "after"):
        raise HTTPException(status_code=400, detail="Недопустимый этап (before/process/after)")

    try:
        relative_path = await validate_and_save_image(
            file=file,
            user_id=str(current_user.id),
            order_id=str(order_id),
            upload_dir=settings.UPLOAD_DIR,
        )
    except HTTPException:
        log_security_event(
            "INVALID_FILE_UPLOAD",
            ip=request.client.host,
            details={"mime": file.content_type, "order_id": order_id},
        )
        raise

    photo = Photo(order_id=order_id, file_path=f"/static/uploads/{relative_path}", stage=stage)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.delete("/{order_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_photo(
    request: Request,
    order_id: str,
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import os
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
