from datetime import date, datetime, timezone
from typing import TYPE_CHECKING

from fastapi import Response
from passlib.context import CryptContext

from config import config

if TYPE_CHECKING:
    from core.auth.schemas import TokenPairResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


ACCESS_TOKEN_COOKIE = "nocap_access_token"
REFRESH_TOKEN_COOKIE = "nocap_refresh_token"
OAUTH_STATE_COOKIE = "nocap_oauth_state"
ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24
REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30
OAUTH_STATE_MAX_AGE = 60 * 10

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
        path="/",
    )
