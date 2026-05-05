import hashlib
import random
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING

from fastapi import Response
from fastapi.requests import Request
from passlib.context import CryptContext

from config import config
from redis_client import get_redis_client

if TYPE_CHECKING:
    from core.auth.schemas import TokenPairResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_COOKIE = "nocap_access_token"
REFRESH_TOKEN_COOKIE = "nocap_refresh_token"
OAUTH_STATE_COOKIE = "nocap_oauth_state"
ACCESS_TOKEN_MAX_AGE = 15 * 60
REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60
OAUTH_STATE_MAX_AGE = 60 * 10
OTP_EXPIRY = 300  # 5 minutes
MAX_ATTEMPTS = 5

def calculate_age(date_of_birth: date) -> int:
    today = datetime.now(timezone.utc).date()
    years = today.year - date_of_birth.year
    before_birthday = (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    return years - int(before_birthday)

class Hasher:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)


def get_client_ip(request: Request) -> str | None:
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()

    if request.client:
            return request.client.host

    return None

def get_user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")

def set_session_cookies(response: Response, token_pair: "TokenPairResponse") -> None:
    secure = config.ENVIRONMENT == "prod"
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token_pair.access_token,
        max_age=ACCESS_TOKEN_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=token_pair.refresh_token,
        max_age=REFRESH_TOKEN_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/api/auth/refresh",
    )


def otp() -> str:
    otp = str(random.randint(100000, 999999))
    return otp


class OtpManager:
    def __init__(self):
        self.redis_client = get_redis_client()

    async def store_otp(self, identifier: int, otp: str) -> None:
        key = f"otp:{identifier}"
        data = {
            "hash": otp,
            "attempts": 0
        }
        await self.redis_client.hmset(key, data)
        await self.redis_client.expire(key, OTP_EXPIRY)

    async def verify_otp(self, identifier: str, otp: str) -> bool:
        key = f"otp:{identifier}"
        data = await self.redis_client.hgetall(key)

        if not data:
            return False

        if int(data["attempts"]) >= MAX_ATTEMPTS:
            return False

        if otp != data["hash"]:
            await self.redis_client.hincrby(key, "attempts", 1)
            return False

        await self.redis_client.delete(key)
        return True
