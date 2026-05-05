from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from config import config

ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 15
REFRESH_EXPIRE_DAYS = 7
MAGIC_LINK_EXPIRE_MINUTES = 15
OAUTH_STATE_EXPIRE_MINUTES = 10


class JWTManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    def create_access_token(self, subject: str, extra_claims: dict[str, Any] | None = None) -> str:
        return self._create_token(
            subject=subject,
            token_type="access",
            expires_delta=timedelta(minutes=ACCESS_EXPIRE_MINUTES),
            extra_claims=extra_claims,
        )

    def create_refresh_token(self, subject: str) -> str:
        return self._create_token(
            subject=subject,
            token_type="refresh",
            expires_delta=timedelta(days=REFRESH_EXPIRE_DAYS),
        )

    def create_magic_link_token(self, subject: str, email: str) -> str:
        return self._create_token(
            subject=subject,
            token_type="magic_link",
            expires_delta=timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES),
            extra_claims={"email": email},
        )

    def create_oauth_state_token(self) -> str:
        return self._create_token(
            subject="google_oauth",
            token_type="oauth_state",
            expires_delta=timedelta(minutes=OAUTH_STATE_EXPIRE_MINUTES),
        )

    def get_expiration(self, token: str) -> datetime | None:
        payload = self.decode_token(token)
        expires_at = payload.get("exp")
        if expires_at is None:
            return None
        return datetime.fromtimestamp(int(expires_at), tz=timezone.utc)

    def _create_token(
        self,
        subject: str,
        token_type: str,
        expires_delta: timedelta,
        extra_claims: dict[str, Any] | None = None,
    ) -> str:
        now = datetime.now(timezone.utc)
        payload: dict[str, Any] = {
            "sub": subject,
            "type": token_type,
            "iat": now,
            "exp": now + expires_delta,
        }
        if extra_claims:
            payload.update(extra_claims)
        return jwt.encode(payload, self.secret_key, algorithm=ALGORITHM)

    def decode_token(self, token: str, expected_type: str | None = None) -> dict[str, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[ALGORITHM])
        except JWTError as exc:
            raise ValueError("Invalid or expired token.") from exc

        token_type = payload.get("type")
        if expected_type and token_type != expected_type:
            raise ValueError(f"Expected a {expected_type} token.")
        return payload


jwt_manager = JWTManager(secret_key=config.SECRET)
