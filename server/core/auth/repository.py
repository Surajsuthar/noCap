from datetime import date

from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User


class AuthRepository:
    """All direct database calls for auth live here."""

    async def get_user_by_email(
        self, email: str, session: AsyncSession
    ) -> User | None:
        try:
            result = await session.execute(
                select(User).where(User.email == email)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise exc

    async def get_user_by_id(
        self, user_id: str, session: AsyncSession
    ) -> User | None:
        try:
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise exc

    async def email_exists(
        self, email: str, session: AsyncSession
    ) -> bool:
        try:
            result = await session.execute(
                select(exists().where(User.email == email))
            )
            return bool(result.scalar())
        except SQLAlchemyError as exc:
            raise exc

    async def create_user(
        self,
        *,
        first_name: str,
        last_name: str,
        email: str,
        hashed_password: str,
        date_of_birth: date,
        age: int,
        session: AsyncSession,
    ) -> User:
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=hashed_password,
            date_of_birth=date_of_birth,
            age=age,
        )
        session.add(user)
        try:
            await session.commit()
            await session.refresh(user)
        except IntegrityError as exc:
            await session.rollback()
            raise exc
        except SQLAlchemyError as exc:
            await session.rollback()
            raise exc
        return user
