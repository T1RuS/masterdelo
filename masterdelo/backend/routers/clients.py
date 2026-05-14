from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.deps import get_db, get_current_user
from core.limiter import limiter
from models.user import User
from models.client import Client
from models.order import Order
from schemas.client import ClientCreate, ClientUpdate, ClientOut, ClientWithStats

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=List[ClientWithStats])
@limiter.limit("60/minute")
async def list_clients(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.user_id == current_user.id).order_by(Client.name)
    )
    clients = result.scalars().all()

    out = []
    for client in clients:
        orders_result = await db.execute(select(Order).where(Order.client_id == client.id))
        orders = orders_result.scalars().all()
        total = sum(float(o.price) for o in orders)
        out.append(
            ClientWithStats(
                **ClientOut.model_validate(client).model_dump(),
                orders_count=len(orders),
                total_amount=total,
            )
        )
    return out


@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_client(
    request: Request,
    data: ClientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    client = Client(user_id=current_user.id, **data.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientWithStats)
@limiter.limit("60/minute")
async def get_client(
    request: Request,
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == current_user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    orders_result = await db.execute(select(Order).where(Order.client_id == client.id))
    orders = orders_result.scalars().all()
    total = sum(float(o.price) for o in orders)

    return ClientWithStats(
        **ClientOut.model_validate(client).model_dump(),
        orders_count=len(orders),
        total_amount=total,
    )


@router.put("/{client_id}", response_model=ClientOut)
@limiter.limit("30/minute")
async def update_client(
    request: Request,
    client_id: str,
    data: ClientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == current_user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(client, field, value)

    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_client(
    request: Request,
    client_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == current_user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    active_result = await db.execute(
        select(Order).where(
            Order.client_id == client_id,
            Order.status.in_(["new", "in_progress"]),
        )
    )
    if active_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Нельзя удалить клиента с активными заказами")

    await db.delete(client)
    await db.commit()
