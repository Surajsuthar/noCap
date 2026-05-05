from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import (
    AuthSession,
    AuthSessionMethod,
    OAuthAccount,
    OAuthProvider,
    User,
)

if TYPE_CHECKING:
    from core.auth.schemas import TokenPairResponse


class AuthRepository:
    """All direct database calls for auth live here."""

    @staticmethod
    def _normalize_user_id(user_id: str | int) -> int | None:
        try:
            return int(user_id)
        except (TypeError, ValueError):
            return None

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

    async def verify_user_email(
        self, email: str, session: AsyncSession
    ) -> bool:
        try:
            user = await self.get_user_by_email(email, session)
            if user:
                user.email_verified = True
                await session.commit()
                return True
            return False
        except SQLAlchemyError as exc:
            raise exc

    async def get_oauth_account(
        self,
        *,
        provider: OAuthProvider,
        account_id: str,
        session: AsyncSession,
    ) -> OAuthAccount | None:
        try:
            result = await session.execute(
                select(OAuthAccount).where(
                    OAuthAccount.provider == provider,
                    OAuthAccount.account_id == account_id,
                )
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise exc

    async def create_user(
        self,
        *,
        first_name: str,
        last_name: str,
        email: str,
        date_of_birth: date,
        age: int,
        session: AsyncSession,
    ) -> User:
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
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

    async def create_oauth_user(
        self,
        *,
        email: str,
        first_name: str | None,
        last_name: str | None,
        avatar_url: str | None,
        email_verified: bool,
        session: AsyncSession,
    ) -> User:
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            avatar_url=avatar_url,
            email_verified=email_verified,
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

    async def update_user_from_oauth(
        self,
        user: User,
        *,
        first_name: str | None,
        last_name: str | None,
        avatar_url: str | None,
        email_verified: bool,
        session: AsyncSession,
    ) -> User:
        if first_name and not user.first_name:
            user.first_name = first_name
        if last_name and not user.last_name:
            user.last_name = last_name
        if avatar_url:
            user.avatar_url = avatar_url
        if email_verified:
            user.email_verified = True

        try:
            await session.commit()
            await session.refresh(user)
        except SQLAlchemyError as exc:
            await session.rollback()
            raise exc
        return user

    async def upsert_oauth_account(
        self,
        *,
        user: User,
        provider: OAuthProvider,
        account_id: str,
        access_token: str | None,
        refresh_token: str | None,
        expires_at: datetime | None,
        session: AsyncSession,
    ) -> OAuthAccount:
        oauth_account = await self.get_oauth_account(
            provider=provider,
            account_id=account_id,
            session=session,
        )

        if oauth_account is None:
            oauth_account = OAuthAccount(
                user_id=user.id,
                provider=provider,
                account_id=account_id,
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=expires_at,
            )
            session.add(oauth_account)
        else:
            oauth_account.user_id = user.id
            oauth_account.access_token = access_token
            if refresh_token:
                oauth_account.refresh_token = refresh_token
            oauth_account.expires_at = expires_at

        try:
            await session.commit()
            await session.refresh(oauth_account)
        except IntegrityError as exc:
            await session.rollback()
            raise exc
        except SQLAlchemyError as exc:
            await session.rollback()
            raise exc
        return oauth_account

    async def create_auth_session(
        self,
        *,
        user: User,
        token_pair: "TokenPairResponse",
        method: AuthSessionMethod,
        access_token_expires_at: datetime | None,
        ip_address: str | None,
        device_info: str | None,
        refresh_token_expires_at: datetime | None,
        session: AsyncSession,
        oauth_account: OAuthAccount | None = None,
    ) -> AuthSession:
        auth_session = AuthSession(
            user_id=user.id,
            oauth_account_id=oauth_account.id if oauth_account else None,
            method=method,
            access_token=token_pair.access_token,
            refresh_token=token_pair.refresh_token,
            access_token_expires_at=access_token_expires_at,
            refresh_token_expires_at=refresh_token_expires_at,
            ip_address=ip_address,
            device_info=device_info,
        )
        session.add(auth_session)
        try:
            await session.commit()
            await session.refresh(auth_session)
        except SQLAlchemyError as exc:
            await session.rollback()
            raise exc
        return auth_session
