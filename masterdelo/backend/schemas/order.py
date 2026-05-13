from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from schemas.order_item import OrderItemOut
from schemas.photo import PhotoOut


class ClientBrief(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    title: str
    client_id: Optional[str] = None
    price: float = 0.0
    prepayment: float = 0.0
    deadline: Optional[date] = None
    address: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    title: Optional[str] = None
    client_id: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    prepayment: Optional[float] = None
    deadline: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    id: str
    user_id: str
    client_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    price: float
    prepayment: float
    deadline: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientBrief] = None

    model_config = {"from_attributes": True}


class OrderDetail(OrderOut):
    items: List[OrderItemOut] = []
    photos: List[PhotoOut] = []
    balance_due: float = 0.0
    total_cost: float = 0.0
    margin: float = 0.0
