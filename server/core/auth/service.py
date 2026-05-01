from urllib.parse import urlencode

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from config import config
from core.auth.jwt import jwt_manager
from core.auth.repository import AuthRepository
from core.auth.schemas import (
    AccessTokenResponse,
    AuthUserResponse,
    CredintialLogin,
    CredintialRegister,
    MagicLinkResponse,
    TokenPairResponse,
)
from core.auth.utils import calculate_age
from lib.email.client import client as email_client
from models.user import User


class AuthService:
    def __init__(self, repository: AuthRepository | None = None):
        self.repository = repository or AuthRepository()

    @staticmethod
    def _build_user_response(user: User) -> AuthUserResponse:
        return AuthUserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            email_verified=user.email_verified,
            age=user.age,
        )

    @classmethod
    def _build_auth_response(cls, user: User) -> TokenPairResponse:
        subject = str(user.id)
        return TokenPairResponse(
            access_token=jwt_manager.create_access_token(subject=subject, extra_claims={"email": user.email}),
            refresh_token=jwt_manager.create_refresh_token(subject=subject),
            user=cls._build_user_response(user),
        )

    @staticmethod
    def _build_magic_link(token: str) -> str:
        separator = "&" if "?" in config.MAGIC_LINK_CALLBACK_URL else "?"
        return f"{config.MAGIC_LINK_CALLBACK_URL}{separator}{urlencode({'token': token})}"

    @staticmethod
    def _magic_link_response(magic_link: str) -> MagicLinkResponse:
        return MagicLinkResponse(
            message="Magic link sent. Check your email to continue.",
            magic_link=magic_link if config.ENVIRONMENT == "dev" else None,
        )

    async def _fetch_user_or_401(self, user_id: str, session: AsyncSession) -> User:
        user = await self.repository.get_user_by_id(user_id, session)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    async def register(
        self,
        payload: CredintialRegister,
        session: AsyncSession,
    ) -> MagicLinkResponse:
        existing_user = await self.repository.get_user_by_email(payload.email, session)

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists.",
            )

        user = await self.repository.create_user(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            date_of_birth=payload.dob,
            age=calculate_age(payload.dob),
            session=session,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user.",
            )

        return await self.generate_verification_email(user.email, session)

    async def _authenticate_credentials(self, payload: CredintialLogin, session: AsyncSession) -> User:
        existing_user = await self.repository.get_user_by_email(payload.email, session)
        if existing_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email does not exist.",
            )

        if existing_user.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is blocked.",
            )

        return existing_user

    async def login(self, payload: CredintialLogin, session: AsyncSession) -> MagicLinkResponse:
        user = await self._authenticate_credentials(payload, session)
        return await self.generate_verification_email(user.email, session)

    async def refresh(
        self, refresh_token: str, session: AsyncSession
    ) -> AccessTokenResponse:
        try:
            payload = jwt_manager.decode_token(
                refresh_token, expected_type="refresh"
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = await self._fetch_user_or_401(user_id, session)

        return AccessTokenResponse(
            access_token=jwt_manager.create_access_token(
                subject=str(user.id),
                extra_claims={"email": user.email},
            ),
        )

    async def callback(self, token: str, session: AsyncSession) -> TokenPairResponse:
        try:
            verify_token = jwt_manager.decode_token(token, expected_type="magic_link")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        user_id: str | None = verify_token.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = await self._fetch_user_or_401(user_id, session)

        token_email: str | None = verify_token.get("email")
        if token_email != user.email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        verified = await self.repository.verify_user_email(user.email, session)

        if not verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified",
            )

        return self._build_auth_response(user)

    async def generate_verification_email(self, email: str, session: AsyncSession) -> MagicLinkResponse:
        user = await self.repository.get_user_by_email(email, session)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if user.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is blocked.",
            )

        token = jwt_manager.create_magic_link_token(subject=str(user.id), email=user.email)
        magic_link = self._build_magic_link(token)

        if config.RESEND_API_KEY:
            email_client.send_magic_link(
                to=user.email,
                name=user.first_name or user.email,
                magic_link=magic_link,
            )

        return self._magic_link_response(magic_link)
