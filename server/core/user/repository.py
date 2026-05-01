from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class UserRepository:
    """All direct database calls for user operations live here."""

    @staticmethod
    def _normalize_user_id(user_id: str | int) -> int | None:
        try:
            return int(user_id)
        except (TypeError, ValueError):
            return None

    async def get_user_by_id(
        self, user_id: str | int, session: AsyncSession
    ) -> User | None:
        normalized_user_id = self._normalize_user_id(user_id)
        if normalized_user_id is None:
            return None

        try:
            result = await session.execute(
                select(User).where(User.id == normalized_user_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise exc
