from datetime import date, datetime, timezone
from uuid import UUID

from uuid_extensions import uuid7
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from server.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class OAuthAccount(Base, TimestampMixin):
    __tablename__ = "oauth_accounts"
    __table_args__ = (UniqueConstraint("provider", "account_id", name="uq_oauth_provider_account"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    access_token: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    expires_at: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    refresh_token: Mapped[str | None] = mapped_column(String(2048), nullable=True, default=None)
    refresh_token_expires_at: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=None,
    )
    account_id: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    account_email: Mapped[str] = mapped_column(String(320), nullable=False)
    account_username: Mapped[str | None] = mapped_column(String(320), nullable=True)

    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="cascade"),
        nullable=False,
    )
    user: Mapped["User"] = relationship("User", back_populates="oauth_accounts")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    username: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
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

    @property
    def computed_age(self) -> int | None:
        if self.date_of_birth is None:
            return self.age

        today = datetime.now(timezone.utc).date()
        years = today.year - self.date_of_birth.year
        before_birthday = (today.month, today.day) < (
            self.date_of_birth.month,
            self.date_of_birth.day,
        )
        return years - int(before_birthday)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name={self.display_name}, email={self.email})>"
