from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os

from core.config import settings
from core.limiter import limiter, rate_limit_handler
from core.middleware import SecurityHeadersMiddleware, RequestSizeLimitMiddleware
from routers import auth, clients, orders, order_items, photos, pdf, public, admin
from services.scheduler import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="МастерДело API",
    description="API для управления заказами мастеров-самозанятых",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# CORS must be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware, max_body_size=15 * 1024 * 1024)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(orders.router)
app.include_router(order_items.router)
app.include_router(photos.router)
app.include_router(pdf.router)
app.include_router(public.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
