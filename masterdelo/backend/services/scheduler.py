import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import date

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone="Europe/Moscow")


@scheduler.scheduled_job("cron", hour=8, minute=0)
async def morning_digest():
    """Ежедневный утренний дайджест: просроченные и неоплаченные заказы"""
    try:
        from core.database import AsyncSessionLocal
        from models.order import Order
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            today = date.today()
            result = await db.execute(
                select(Order).where(
                    Order.deadline <= today,
                    Order.status.in_(["new", "in_progress"]),
                )
            )
            overdue = result.scalars().all()
            if overdue:
                logger.info(f"[digest] Просроченных заказов: {len(overdue)}")

            result2 = await db.execute(
                select(Order).where(
                    Order.status == "done",
                    Order.price > Order.prepayment,
                )
            )
            unpaid = result2.scalars().all()
            if unpaid:
                logger.info(f"[digest] Заказов с долгом: {len(unpaid)}")
    except Exception as e:
        logger.error(f"[digest] Ошибка: {e}")


@scheduler.scheduled_job("interval", hours=1)
async def check_overdue():
    """Помечает просроченные заказы флагом is_overdue"""
    try:
        from core.database import AsyncSessionLocal
        from models.order import Order
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            today = date.today()
            result = await db.execute(
                select(Order).where(
                    Order.deadline < today,
                    Order.status.in_(["new", "in_progress"]),
                    Order.is_overdue == False,
                )
            )
            orders = result.scalars().all()
            for order in orders:
                order.is_overdue = True
            if orders:
                await db.commit()
                logger.info(f"[overdue] Помечено просроченных: {len(orders)}")
    except Exception as e:
        logger.error(f"[overdue] Ошибка: {e}")
