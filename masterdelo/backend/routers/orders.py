from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date
from core.deps import get_db, get_current_user
from models.user import User
from models.order import Order
from models.client import Client
from models.order_item import OrderItem
from schemas.order import OrderCreate, OrderUpdate, OrderStatusUpdate, OrderOut, OrderDetail

router = APIRouter(prefix="/api/orders", tags=["orders"])

ALLOWED_TRANSITIONS = {
    "new": ["in_progress", "cancelled"],
    "in_progress": ["done", "cancelled"],
    "done": ["paid", "in_progress", "cancelled"],
    "paid": [],
    "cancelled": [],
}


def _compute_order_detail(order: Order) -> OrderDetail:
    total_cost = sum(float(item.cost) * float(item.quantity) for item in order.items)
    price = float(order.price)
    prepayment = float(order.prepayment)
    return OrderDetail(
        **OrderOut.model_validate(order).model_dump(),
        items=order.items,
        photos=order.photos,
        balance_due=price - prepayment,
        total_cost=total_cost,
        margin=price - total_cost,
    )


@router.get("", response_model=List[OrderOut])
async def list_orders(
    status: Optional[str] = Query(None),
    client_id: Optional[str] = Query(None),
    deadline_from: Optional[date] = Query(None),
    deadline_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Order)
        .options(selectinload(Order.client))
        .where(Order.user_id == current_user.id)
    )

    if status:
        query = query.where(Order.status == status)
    if client_id:
        query = query.where(Order.client_id == client_id)
    if deadline_from:
        query = query.where(Order.deadline >= deadline_from)
    if deadline_to:
        query = query.where(Order.deadline <= deadline_to)
    if search:
        query = query.outerjoin(Client, Order.client_id == Client.id).where(
            or_(
                Order.title.ilike(f"%{search}%"),
                Client.name.ilike(f"%{search}%"),
            )
        )

    from sqlalchemy import case, nullslast
    query = query.order_by(
        case(
            (Order.status == "in_progress", 1),
            (Order.status == "new", 2),
            (Order.status == "done", 3),
            (Order.status == "paid", 4),
            (Order.status == "cancelled", 5),
            else_=6,
        ),
        nullslast(Order.deadline.asc()),
        Order.created_at.desc(),
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.client_id:
        client_result = await db.execute(
            select(Client).where(Client.id == data.client_id, Client.user_id == current_user.id)
        )
        if not client_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Клиент не найден")

    order = Order(user_id=current_user.id, **data.model_dump())
    db.add(order)
    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order).options(selectinload(Order.client)).where(Order.id == order.id)
    )
    return result.scalar_one()


@router.get("/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.client),
            selectinload(Order.items),
            selectinload(Order.photos),
        )
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    return _compute_order_detail(order)


@router.put("/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: str,
    data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.client))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if data.client_id is not None and data.client_id != order.client_id:
        client_result = await db.execute(
            select(Client).where(Client.id == data.client_id, Client.user_id == current_user.id)
        )
        if not client_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Клиент не найден")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(order, field, value)

    from datetime import datetime, timezone
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.client)).where(Order.id == order_id)
    )
    return result.scalar_one()


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.client))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    allowed = ALLOWED_TRANSITIONS.get(order.status, [])
    if data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Нельзя сменить статус с '{order.status}' на '{data.status}'",
        )

    order.status = data.status
    from datetime import datetime, timezone
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.client)).where(Order.id == order_id)
    )
    return result.scalar_one()


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    await db.delete(order)
    await db.commit()
