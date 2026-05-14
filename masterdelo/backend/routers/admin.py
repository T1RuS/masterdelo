from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from core.deps import get_db, get_current_user
from models.user import User
from models.order import Order


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    inn: Optional[str] = None


class AdminOrderUpdate(BaseModel):
    status: Optional[str] = None
    price: Optional[float] = None
    prepayment: Optional[float] = None

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ запрещён")
    return current_user


@router.get("/stats")
async def get_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = await db.scalar(select(func.count(User.id)))
    total_orders = await db.scalar(select(func.count(Order.id)))
    total_revenue = await db.scalar(
        select(func.sum(Order.price)).where(Order.status == "paid")
    ) or 0
    active_orders = await db.scalar(
        select(func.count(Order.id)).where(Order.status.in_(["new", "in_progress", "done"]))
    ) or 0
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "active_orders": active_orders,
    }


@router.get("/users")
async def get_all_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    order_stats_result = await db.execute(
        select(
            Order.user_id,
            func.count(Order.id).label("count"),
            func.sum(Order.price).label("revenue"),
        ).group_by(Order.user_id)
    )
    order_stats: dict[str, dict] = {}
    for row in order_stats_result.all():
        order_stats[row.user_id] = {
            "count": row.count,
            "revenue": float(row.revenue or 0),
        }

    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "company_name": u.company_name,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
            "orders_count": order_stats.get(u.id, {}).get("count", 0),
            "total_revenue": order_stats.get(u.id, {}).get("revenue", 0.0),
        }
        for u in users
    ]


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "company_name": user.company_name,
        "is_admin": user.is_admin,
    }


@router.get("/users/{user_id}/orders")
async def get_user_orders(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.client))
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "title": o.title,
            "status": o.status,
            "price": float(o.price),
            "prepayment": float(o.prepayment),
            "created_at": o.created_at.isoformat(),
            "client_name": o.client.name if o.client else None,
        }
        for o in orders
    ]


@router.patch("/orders/{order_id}")
async def update_order(
    order_id: str,
    data: AdminOrderUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(order, field, value)
    await db.commit()
    return {"id": order.id, "status": order.status, "price": float(order.price)}


@router.patch("/users/{user_id}/toggle-admin")
async def toggle_admin(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить свои права")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_admin = not user.is_admin
    await db.commit()
    return {"is_admin": user.is_admin}
