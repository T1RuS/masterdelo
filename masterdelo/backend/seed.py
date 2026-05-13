"""Seed script — создаёт тестовые данные"""
import asyncio
import uuid
from datetime import datetime, date, timedelta, timezone

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from core.database import AsyncSessionLocal
from core.security import get_password_hash
from models.user import User
from models.client import Client
from models.order import Order
from models.order_item import OrderItem


async def seed():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select as sa_select
        existing = await db.execute(sa_select(User).where(User.email == "test@test.ru"))
        if existing.scalar_one_or_none():
            print("Seed data already exists, skipping.")
            return

        user = User(
            id=str(uuid.uuid4()),
            email="test@test.ru",
            password_hash=get_password_hash("test12345"),
            full_name="Иван Мастеров",
            phone="+79001234567",
            company_name="ИП Мастеров И.А.",
            inn="123456789012",
        )
        db.add(user)
        await db.flush()

        clients_data = [
            {"name": "Сергей Петров", "phone": "+79111111111"},
            {"name": "Михаил Иванов", "phone": "+79222222222"},
            {"name": "Анна Козлова", "phone": "+79333333333"},
        ]
        clients = []
        for cd in clients_data:
            c = Client(id=str(uuid.uuid4()), user_id=user.id, **cd)
            db.add(c)
            clients.append(c)
        await db.flush()

        today = date.today()
        orders_data = [
            {
                "title": "Навес из профтрубы 6×4м",
                "status": "in_progress",
                "price": 45000,
                "prepayment": 15000,
                "deadline": today + timedelta(days=7),
                "address": "ул. Ленина 12, Краснодар",
                "client": clients[0],
                "items": [
                    {"name": "Труба профильная 60×60", "quantity": 24, "unit": "м", "cost": 320},
                    {"name": "Поликарбонат 6мм", "quantity": 24, "unit": "м²", "cost": 450},
                    {"name": "Крепёж и метизы", "quantity": 1, "unit": "компл", "cost": 1500},
                ],
            },
            {
                "title": "Сварка калитки",
                "status": "new",
                "price": 12000,
                "prepayment": 0,
                "deadline": today + timedelta(days=14),
                "client": clients[1],
                "items": [
                    {"name": "Уголок 40×40", "quantity": 8, "unit": "м", "cost": 180},
                    {"name": "Профлист", "quantity": 2, "unit": "лист", "cost": 850},
                ],
            },
            {
                "title": "Ремонт ворот гаража",
                "status": "done",
                "price": 8500,
                "prepayment": 8500,
                "deadline": today - timedelta(days=3),
                "client": clients[2],
                "items": [
                    {"name": "Петли усиленные", "quantity": 4, "unit": "шт", "cost": 350},
                    {"name": "Профиль", "quantity": 6, "unit": "м", "cost": 200},
                ],
            },
            {
                "title": "Стеллаж в мастерскую",
                "status": "paid",
                "price": 25000,
                "prepayment": 25000,
                "deadline": today - timedelta(days=10),
                "client": clients[0],
                "items": [
                    {"name": "Уголок 50×50", "quantity": 40, "unit": "м", "cost": 220},
                    {"name": "Полки ДСП 16мм", "quantity": 8, "unit": "шт", "cost": 600},
                    {"name": "Грунт-эмаль", "quantity": 3, "unit": "кг", "cost": 350},
                ],
            },
            {
                "title": "Козырёк над крыльцом",
                "status": "new",
                "price": 18000,
                "prepayment": 5000,
                "deadline": today + timedelta(days=21),
                "address": "пос. Солнечный, д.15",
                "client": clients[1],
                "items": [
                    {"name": "Труба 40×20", "quantity": 12, "unit": "м", "cost": 180},
                    {"name": "Поликарбонат 4мм", "quantity": 6, "unit": "м²", "cost": 380},
                ],
            },
        ]

        for od in orders_data:
            items = od.pop("items", [])
            client = od.pop("client")
            order = Order(
                id=str(uuid.uuid4()),
                user_id=user.id,
                client_id=client.id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                **od,
            )
            db.add(order)
            await db.flush()

            for item_data in items:
                item = OrderItem(id=str(uuid.uuid4()), order_id=order.id, **item_data)
                db.add(item)

        await db.commit()
        print("OK: Test data created")
        print("  Login: test@test.ru")
        print("  Password: test12345")


if __name__ == "__main__":
    asyncio.run(seed())
