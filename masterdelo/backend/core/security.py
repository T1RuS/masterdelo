import secrets
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

# In-memory revoked token store. In production replace with Redis SET + TTL.
_revoked_tokens: set[str] = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(user_id: str) -> str:
    jti = secrets.token_urlsafe(16)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise ValueError("Недействительный токен")

    if payload.get("type") != "access":
        raise ValueError("Неверный тип токена")

    jti = payload.get("jti")
    if jti and jti in _revoked_tokens:
        raise ValueError("Токен был отозван")

    return payload


def revoke_token(token: str) -> None:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False},
        )
        jti = payload.get("jti")
        if jti:
            _revoked_tokens.add(jti)
    except JWTError:
        pass
