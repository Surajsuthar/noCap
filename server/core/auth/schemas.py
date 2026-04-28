from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator

from core.auth.utils import calculate_age


class CredintialRegister(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    first_name: str = Field(min_length=1, max_length=200)
    last_name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)
    dob: date
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, email: str) -> str:
        normalized_email = email.strip().lower()
        if "@" not in normalized_email:
            raise ValueError("A valid email address is required.")
        return normalized_email

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, confirm_password: str, info) -> str:
        password = info.data.get("password")
        if password and password != confirm_password:
            raise ValueError("Passwords do not match.")
        return confirm_password

    @field_validator("dob")
    @classmethod
    def validate_age(cls, dob: date) -> date:
        if calculate_age(dob) < 18:
            raise ValueError("User must be at least 18 years old.")
        return dob


class CredintialLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str
    password: str = Field(min_length=8)

    @field_validator("email")
    @classmethod
    def validate_email(cls, email: str) -> str:
        normalized_email = email.strip().lower()
        if "@" not in normalized_email:
            raise ValueError("A valid email address is required.")
        return normalized_email


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    first_name: str | None
    last_name: str | None
    email: str
    email_verified: bool
    age: int | None


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LogoutResponse(BaseModel):
    message: str
