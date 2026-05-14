from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    inn: Optional[str] = None
    telegram: Optional[str] = None
    vk: Optional[str] = None
    max_messenger: Optional[str] = None
    tax_rate: Optional[float] = None


class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    inn: Optional[str] = None
    telegram: Optional[str] = None
    vk: Optional[str] = None
    max_messenger: Optional[str] = None
    is_admin: bool = False
    tax_rate: float = 4.0
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
