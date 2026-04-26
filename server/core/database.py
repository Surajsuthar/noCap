from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from server.core.config import config


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


engine = None
session_factory = None


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncIterator[AsyncSession]:
    factory = get_session_factory()
    async with factory() as db:
        yield db


def get_engine():
    global engine
    if engine is None:
        try:
            engine = create_async_engine(
                _normalize_database_url(config.database_url),
                future=True,
            )
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "Database driver is missing. Install 'asyncpg' to use the configured PostgreSQL URL."
            ) from exc
    return engine


def get_session_factory():
    global session_factory
    if session_factory is None:
        session_factory = async_sessionmaker(
            bind=get_engine(),
            expire_on_commit=False,
            class_=AsyncSession,
        )
    return session_factory
