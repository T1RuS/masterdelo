from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from core.sanitize import sanitize_text, sanitize_phone


class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = sanitize_text(v, max_length=200)
        if not v:
            raise ValueError("Имя клиента не может быть пустым")
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        return sanitize_phone(str(v))

    @field_validator("notes", mode="before")
    @classmethod
    def validate_notes(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=2000)


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, v):
        if v is None:
            return v
        v = sanitize_text(str(v), max_length=200)
        if not v:
            raise ValueError("Имя клиента не может быть пустым")
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        return sanitize_phone(str(v))

    @field_validator("notes", mode="before")
    @classmethod
    def validate_notes(cls, v):
        if v is None:
            return v
        return sanitize_text(str(v), max_length=2000)


class ClientOut(BaseModel):
    id: str
    user_id: str
    name: str
    phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ClientWithStats(ClientOut):
    orders_count: int = 0
    total_amount: float = 0
