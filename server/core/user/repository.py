import uuid

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class UserRepository:
    """All direct database calls for user operations live here."""

    async def get_user_by_id(
        self, user_id: str | uuid.UUID, session: AsyncSession
    ) -> User | None:
        try:
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise exc
