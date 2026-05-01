from datetime import date, datetime, timezone

from sqlalchemy import TIMESTAMP, BigInteger, Boolean, Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base


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


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )
    first_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    country: Mapped[str | None] = mapped_column(String(2), nullable=True, default=None)
    blocked_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
        default=None,
    )

    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.last_name]
        return " ".join(p for p in parts if p)

    @property
    def is_blocked(self) -> bool:
        return self.blocked_at is not None

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified


    def __repr__(self) -> str:
        return f"<User(id={self.id}, name={self.full_name}, email={self.email})>"
