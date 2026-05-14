from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.deps import get_db
from models.order import Order
from services.pdf_service import generate_invoice

router = APIRouter(prefix="/api/public", tags=["public"])


async def _get_order_by_token(token: str, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.items),
            selectinload(Order.photos),
            selectinload(Order.user),
        )
        .where(Order.share_token == token)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден или ссылка устарела")
    return order


@router.get("/order/{token}")
async def get_public_order(token: str, db: AsyncSession = Depends(get_db)):
    order = await _get_order_by_token(token, db)

    return {
        "id": order.id,
        "title": order.title,
        "status": order.status,
        "price": float(order.price),
        "prepayment": float(order.prepayment),
        "balance_due": float(order.price) - float(order.prepayment),
        "start_date": str(order.start_date) if order.start_date else None,
        "deadline": str(order.deadline) if order.deadline else None,
        "description": order.description,
        "address": order.address,
        "client": {"name": order.client.name} if order.client else None,
        "master": {
            "name": order.user.full_name or order.user.email,
            "phone": order.user.phone,
            "company_name": order.user.company_name,
            "telegram": order.user.telegram,
            "vk": order.user.vk,
            "max_messenger": order.user.max_messenger,
        },
        "photos": [
            {"file_path": p.file_path, "stage": p.stage}
            for p in order.photos
        ],
        "items": [
            {
                "name": i.name,
                "quantity": float(i.quantity),
                "unit": i.unit,
                "cost": float(i.cost),
            }
            for i in order.items
        ],
    }


@router.get("/order/{token}/invoice")
async def download_public_invoice(token: str, db: AsyncSession = Depends(get_db)):
    order = await _get_order_by_token(token, db)
    pdf_bytes = generate_invoice(order, order.user, order.client)
    filename = f"invoice_{order.id[:8].upper()}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
