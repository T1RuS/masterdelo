from pydantic import BaseModel, field_validator
from typing import Optional
from core.sanitize import sanitize_text


class OrderItemCreate(BaseModel):
    name: str
    quantity: float = 1.0
    unit: Optional[str] = None
    cost: float = 0.0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = sanitize_text(v, max_length=300)
        if not v:
            raise ValueError("Название материала не может быть пустым")
        return v

    @field_validator("unit", mode="before")
    @classmethod
    def validate_unit(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=20)

    @field_validator("cost", "quantity", mode="before")
    @classmethod
    def validate_positive(cls, v):
        val = float(v)
        if val < 0:
            raise ValueError("Значение не может быть отрицательным")
        return val


class OrderItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    cost: Optional[float] = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v):
        if v is None:
            return v
        v = sanitize_text(str(v), max_length=300)
        if not v:
            raise ValueError("Название материала не может быть пустым")
        return v

    @field_validator("unit", mode="before")
    @classmethod
    def validate_unit(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=20)


class OrderItemOut(BaseModel):
    id: str
    order_id: str
    name: str
    quantity: float
    unit: Optional[str] = None
    cost: float

    model_config = {"from_attributes": True}
