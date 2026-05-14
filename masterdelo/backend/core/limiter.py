from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from fastapi.responses import JSONResponse

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    storage_uri="memory://",
)


async def rate_limit_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Слишком много запросов. Попробуйте через минуту.",
            "code": "RATE_LIMIT_EXCEEDED",
        },
        headers={"Retry-After": "60"},
    )
