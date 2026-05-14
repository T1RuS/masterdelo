from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    consent_offer: bool = False
    consent_pd: bool = False

    @field_validator('consent_offer', 'consent_pd')
    @classmethod
    def must_be_true(cls, v: bool) -> bool:
        if not v:
            raise ValueError('согласие обязательно')
        return v


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
    tax_regime: Optional[Literal['npd', 'usn6', 'usn15', 'psn', 'osno']] = None


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
    tax_regime: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
