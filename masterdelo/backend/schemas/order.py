from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime, date
from schemas.order_item import OrderItemOut
from schemas.photo import PhotoOut
from core.sanitize import sanitize_text


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
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    address: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = sanitize_text(v, max_length=500)
        if not v:
            raise ValueError("Название заказа не может быть пустым")
        return v

    @field_validator("description", "notes", "address", mode="before")
    @classmethod
    def validate_text_fields(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=5000)

    @field_validator("price", "prepayment", mode="before")
    @classmethod
    def validate_money(cls, v):
        val = float(v)
        if val < 0:
            raise ValueError("Сумма не может быть отрицательной")
        if val > 99_999_999:
            raise ValueError("Сумма превышает допустимый максимум")
        return val


class OrderUpdate(BaseModel):
    title: Optional[str] = None
    client_id: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    prepayment: Optional[float] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v):
        if v is None:
            return v
        v = sanitize_text(str(v), max_length=500)
        if not v:
            raise ValueError("Название заказа не может быть пустым")
        return v

    @field_validator("description", "notes", "address", mode="before")
    @classmethod
    def validate_text_fields(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=5000)

    @field_validator("price", "prepayment", mode="before")
    @classmethod
    def validate_money(cls, v):
        if v is None:
            return v
        val = float(v)
        if val < 0:
            raise ValueError("Сумма не может быть отрицательной")
        if val > 99_999_999:
            raise ValueError("Сумма превышает допустимый максимум")
        return val


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
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientBrief] = None
    total_cost: float = 0.0

    model_config = {"from_attributes": True}


class OrderDetail(OrderOut):
    items: List[OrderItemOut] = []
    photos: List[PhotoOut] = []
    balance_due: float = 0.0
    total_cost: float = 0.0
    margin: float = 0.0
