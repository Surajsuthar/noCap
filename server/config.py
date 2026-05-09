import json
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    REDIS_URL: str = ""
    SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    POLAR_ACCESS_TOKEN: str = ""
    POLAR_SUCCESS_URL: str = ""
    CORS_ORIGINS: list[str] = []
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""
    ENVIRONMENT: Literal["dev", "prod"] = "dev"
    POOL_SIZE: int = 10
    RESEND_API_KEY: str = ""
    RESEND_EMAIL: str = "onboarding@resend.dev"
    MAGIC_LINK_CALLBACK_URL: str = "http://localhost:8000/api/auth/callback"
    MAGIC_LINK_CLIENT_REDIRECT_URL: str = "http://localhost:3000/chat"
    UPSTASH_REDIS_HOST: str = ""
    UPSTASH_REDIS_PORT: int = 6379
    UPSTASH_REDIS_PASSWORD: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    def _get_redis(self) -> str:
        return f"rediss://default:{self.UPSTASH_REDIS_PASSWORD}@{self.UPSTASH_REDIS_HOST}:{self.UPSTASH_REDIS_PORT}"

    model_config = SettingsConfigDict(env_file=".env")

config = Settings()
