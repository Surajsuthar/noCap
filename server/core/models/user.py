from datetime import datetime
from enum import Enum
from uuid import uuid7

from database import Base
from sqlalchemy import (
    UUID,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)


class OAuthProvider(Enum):
    Google = "google"

class OAuthAccount(Base, TimestampMixin):
    __tablename__ = "oauth_accounts"

    platform: Mapped[OAuthProvider] = mapped_column(String(32), nullable=False)
    access_token: Mapped[str] = mapped_column(String(1024), nullable=False)
    expires_at: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    refresh_token: Mapped[str | None] = mapped_column(
        String(1024), nullable=True, default=None
    )
    refresh_token_expires_at: Mapped[int | None] = mapped_column(
        Integer, nullable=True, default=None
    )
    account_id: Mapped[str] = mapped_column(String(320), nullable=False)
    account_email: Mapped[str] = mapped_column(String(320), nullable=False)
    account_username: Mapped[str | None] = mapped_column(String(320), nullable=True)

    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="cascade"),
        nullable=False,
    )
    user: Mapped["User"] = relationship("User", back_populates="oauth_accounts")

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)

    username: Mapped[str | None] = mapped_column(String(100), unique=True)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    avatar_url: Mapped[str | None] = mapped_column(String)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    hashed_password: Mapped[str | None] = mapped_column(String)
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(
        back_populates="user"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name or ''} {self.last_name or ''}".strip()

    @property
    def is_blocked(self) -> bool:
        return self.blocked_at is not None

    @property
    def display_name(self) -> str:
        return self.full_name or self.username or self.email

    def __repr__(self):
        return f"<User(id={self.id}, name={self.full_name}, email={self.email})>"
