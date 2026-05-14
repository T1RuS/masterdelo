import uuid
import os
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

DB_TYPE = os.getenv("DB_TYPE", "sqlite")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    company_name: Mapped[str | None] = mapped_column(String(255))
    inn: Mapped[str | None] = mapped_column(String(12))
    telegram: Mapped[str | None] = mapped_column(String(100))
    vk: Mapped[str | None] = mapped_column(String(100))
    max_messenger: Mapped[str | None] = mapped_column(String(100))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    tax_rate: Mapped[float] = mapped_column(Float, default=4.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
