from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DB_TYPE: str = "sqlite"
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "masterdelo"

    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    ENVIRONMENT: str = "development"

    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "static/uploads"

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
