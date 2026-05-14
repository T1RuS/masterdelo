from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.deps import get_db, get_current_user
from core.security import get_password_hash, verify_password, create_access_token, revoke_token
from core.limiter import limiter
from core.brute_force import is_blocked, record_failed_attempt, reset_attempts, get_remaining_attempts
from core.logging import log_security_event
from models.user import User
from schemas.user import UserCreate, UserLogin, UserOut, UserUpdate, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
@limiter.limit("10/hour")
async def register(request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        full_name=data.full_name,
        consent_offer=data.consent_offer,
        consent_offer_date=now if data.consent_offer else None,
        consent_pd=data.consent_pd,
        consent_pd_date=now if data.consent_pd else None,
        consent_ip=request.client.host if request.client else None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    log_security_event("REGISTER_SUCCESS", request.client.host, {"email": data.email}, level="info")
    return Token(access_token=token)


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
@limiter.limit("20/hour")
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    ip = request.client.host

    if is_blocked(ip):
        log_security_event("LOGIN_BLOCKED", ip, {"email": data.email})
        raise HTTPException(
            status_code=429,
            detail="IP заблокирован на 1 час из-за многократных неудачных попыток входа.",
            headers={"Retry-After": "3600"},
        )

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        record_failed_attempt(ip)
        remaining = get_remaining_attempts(ip)
        log_security_event("LOGIN_FAILED", ip, {"email": data.email, "remaining": remaining})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Неверный email или пароль. Осталось попыток: {remaining}",
        )

    reset_attempts(ip)
    log_security_event("LOGIN_SUCCESS", ip, {"user_id": str(user.id)}, level="info")
    token = create_access_token(user.id)
    return Token(access_token=token)


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    revoke_token(token)
    log_security_event("LOGOUT", request.client.host, {"user_id": str(current_user.id)}, level="info")
    return {"detail": "Выход выполнен успешно"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user
