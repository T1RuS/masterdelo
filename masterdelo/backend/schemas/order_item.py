from pydantic import BaseModel
from typing import Optional


class OrderItemCreate(BaseModel):
    name: str
    quantity: float = 1.0
    unit: Optional[str] = None
    cost: float = 0.0


class OrderItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    cost: Optional[float] = None


class OrderItemOut(BaseModel):
    id: str
    order_id: str
    name: str
    quantity: float
    unit: Optional[str] = None
    cost: float

    model_config = {"from_attributes": True}
