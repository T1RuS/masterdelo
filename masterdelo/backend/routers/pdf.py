from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.deps import get_db, get_current_user
from models.user import User
from models.order import Order
from models.client import Client
from services.pdf_service import generate_invoice, generate_act

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


async def _get_order_with_items(order_id: str, user_id: str, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.client))
        .where(Order.id == order_id, Order.user_id == user_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.get("/invoice/{order_id}")
async def download_invoice(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await _get_order_with_items(order_id, current_user.id, db)
    client = order.client

    pdf_bytes = generate_invoice(order, current_user, client)
    filename = f"invoice_{order.id[:8].upper()}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/act/{order_id}")
async def download_act(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await _get_order_with_items(order_id, current_user.id, db)
    client = order.client

    pdf_bytes = generate_act(order, current_user, client)
    filename = f"act_{order.id[:8].upper()}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
