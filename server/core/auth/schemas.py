from datetime import date, datetime, timezone
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MINIMUM_AGE = 18


def calculate_age(date_of_birth: date) -> int:
    today = datetime.now(timezone.utc).date()
    years = today.year - date_of_birth.year
    before_birthday = (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    return years - int(before_birthday)


class ProviderSlug(StrEnum):
    GOOGLE = "google"


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    date_of_birth: date

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
            raise ValueError("A valid email address is required.")
        return email

    @field_validator("date_of_birth")
    @classmethod
    def require_adult_age(cls, value: date) -> date:
        if calculate_age(value) < MINIMUM_AGE:
            raise ValueError("User must be at least 18 years old.")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
            raise ValueError("A valid email address is required.")
        return email


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=20)


class OAuthLoginRequest(BaseModel):
    id_token: str | None = Field(default=None, min_length=20)
    access_token: str | None = Field(default=None, min_length=20)

    @field_validator("access_token", "id_token")
    @classmethod
    def empty_string_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @model_validator(mode="after")
    @classmethod
    def require_any_token(cls, values: "OAuthLoginRequest") -> "OAuthLoginRequest":
        if not values.access_token and not values.id_token:
            raise ValueError("Either id_token or access_token is required.")
        return values


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str | None
    first_name: str | None
    last_name: str | None
    avatar_url: str | None
    age: int | None
    date_of_birth: date | None
    email_verified: bool
    auth_providers: list[str] = Field(default_factory=list)


class AuthResponse(BaseModel):
    user: UserOut
    tokens: TokenPair
    is_new_user: bool = False
