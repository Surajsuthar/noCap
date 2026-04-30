from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth.jwt import jwt_manager
from core.auth.repository import AuthRepository
from core.auth.schemas import (
    AccessTokenResponse,
    AuthUserResponse,
    CredintialLogin,
    CredintialRegister,
    TokenPairResponse,
)
from core.auth.utils import Hasher, calculate_age
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

    async def _get_user_by_email(self, email: str, session: AsyncSession) -> User | None:
        return await self.repository.get_user_by_email(email, session)

    async def _fetch_user_or_401(self, user_id: str, session: AsyncSession) -> User:
        user = await self.repository.get_user_by_id(user_id, session)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    async def _ensure_email_is_available(self, email: str, session: AsyncSession) -> None:
        existing_user = await self._get_user_by_email(email, session)
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

    async def _create_user_from_registration(
        self,
        payload: CredintialRegister,
        session: AsyncSession,
    ) -> User:

        hashed_password = Hasher.get_password_hash(payload.password)
        return await self.repository.create_user(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            hashed_password=hashed_password,
            date_of_birth=payload.dob,
            age=calculate_age(payload.dob),
            session=session,
        )

    async def register(self, payload: CredintialRegister, session: AsyncSession) -> TokenPairResponse:
        await self._ensure_email_is_available(payload.email, session)
        user = await self._create_user_from_registration(payload, session)
        return self._build_auth_response(user)

    async def _authenticate_credentials(self, payload: CredintialLogin, session: AsyncSession) -> User:
        existing_user = await self.repository.get_user_by_email(payload.email, session)
        if existing_user is None and existing_user.is_email_verified:
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

    async def login(self, payload: CredintialLogin, session: AsyncSession) -> TokenPairResponse:
        user = await self._authenticate_credentials(payload, session)
        return self._build_auth_response(user)

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
