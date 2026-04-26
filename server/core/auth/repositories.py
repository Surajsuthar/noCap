from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.core.models.user import OAuthAccount, User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        return await self._one_or_none(
            select(User)
            .options(selectinload(User.oauth_accounts))
            .where(User.email == email)
        )

    async def get_by_id(self, user_id: UUID) -> User | None:
        return await self._one_or_none(
            select(User)
            .options(selectinload(User.oauth_accounts))
            .where(User.id == user_id)
        )

    async def get_oauth_account(self, provider: str, account_id: str) -> OAuthAccount | None:
        return await self._one_or_none(
            select(OAuthAccount)
            .options(selectinload(OAuthAccount.user).selectinload(User.oauth_accounts))
            .where(
                OAuthAccount.provider == provider,
                OAuthAccount.account_id == account_id,
            )
        )

    async def create_user(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user, attribute_names=["oauth_accounts"])
        return user

    async def create_oauth_account(self, oauth_account: OAuthAccount) -> OAuthAccount:
        self.db.add(oauth_account)
        await self.db.flush()
        return oauth_account

    async def commit(self) -> None:
        await self.db.commit()

    async def rollback(self) -> None:
        await self.db.rollback()

    async def _one_or_none(self, statement: Select[tuple[User | OAuthAccount]]) -> User | OAuthAccount | None:
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()
