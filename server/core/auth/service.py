from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from server.core.auth.hashing import Hasher
from server.core.auth.jwt import ACCESS_EXPIRE_MINUTES, JWTManager
from server.core.auth.providers import get_provider_verifier
from server.core.auth.repositories import UserRepository
from server.core.auth.schemas import (
    AuthResponse,
    LoginRequest,
    MINIMUM_AGE,
    OAuthLoginRequest,
    ProviderSlug,
    RegisterRequest,
    TokenPair,
    UserOut,
    calculate_age,
)
from server.core.config import config
from server.core.models.user import OAuthAccount, User


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.jwt = JWTManager(config.secret)

    async def register(self, payload: RegisterRequest) -> AuthResponse:
        existing_user = await self.users.get_by_email(payload.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        user = User(
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            date_of_birth=payload.date_of_birth,
            age=calculate_age(payload.date_of_birth),
            hashed_password=Hasher.get_password_hash(payload.password),
        )

        try:
            await self.users.create_user(user)
            await self.users.commit()
        except Exception:
            await self.users.rollback()
            raise

        return self._build_auth_response(user=user, is_new_user=True)

    async def login(self, payload: LoginRequest) -> AuthResponse:
        user = await self.users.get_by_email(payload.email)
        if user is None or user.hashed_password is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        if user.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is blocked.",
            )
        if not Hasher.verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        return self._build_auth_response(user=user)

    async def refresh(self, refresh_token: str) -> AuthResponse:
        try:
            payload = self.jwt.decode_token(refresh_token, expected_type="refresh")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc

        user = await self.users.get_by_id(payload["sub"])
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found for refresh token.",
            )
        if user.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is blocked.",
            )
        return self._build_auth_response(user=user)

    async def oauth_login(self, provider: ProviderSlug, payload: OAuthLoginRequest) -> AuthResponse:
        verifier = get_provider_verifier(provider)
        identity = await verifier.verify(payload)
        if identity.date_of_birth is None or calculate_age(identity.date_of_birth) < MINIMUM_AGE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be at least 18 years old.",
            )

        oauth_account = await self.users.get_oauth_account(
            provider=identity.provider,
            account_id=identity.account_id,
        )

        is_new_user = False
        if oauth_account:
            user = oauth_account.user
            self._update_oauth_account(oauth_account, identity)
        else:
            user = await self.users.get_by_email(identity.email)
            if user is None:
                user = User(
                    email=identity.email,
                    first_name=identity.first_name,
                    last_name=identity.last_name,
                    avatar_url=identity.avatar_url,
                    date_of_birth=identity.date_of_birth,
                    age=calculate_age(identity.date_of_birth),
                    email_verified=identity.email_verified,
                )
                await self.users.create_user(user)
                is_new_user = True
            else:
                user.avatar_url = user.avatar_url or identity.avatar_url
                user.first_name = user.first_name or identity.first_name
                user.last_name = user.last_name or identity.last_name
                user.date_of_birth = user.date_of_birth or identity.date_of_birth
                user.age = calculate_age(user.date_of_birth) if user.date_of_birth else user.age
                user.email_verified = user.email_verified or identity.email_verified

        if not oauth_account:
            oauth_account = OAuthAccount(
                provider=identity.provider,
                account_id=identity.account_id,
                account_email=identity.email,
                account_username=identity.email.split("@", 1)[0],
                access_token=identity.access_token,
                refresh_token=identity.refresh_token,
                expires_at=identity.expires_at,
                user=user,
            )
            await self.users.create_oauth_account(oauth_account)

        if user.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is blocked.",
            )

        try:
            await self.users.commit()
        except Exception:
            await self.users.rollback()
            raise

        return self._build_auth_response(user=user, is_new_user=is_new_user)

    async def get_current_user(self, authorization: str) -> UserOut:
        token = self._extract_bearer_token(authorization)
        try:
            payload = self.jwt.decode_token(token, expected_type="access")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc

        user = await self.users.get_by_id(payload["sub"])
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
            )
        return self._serialize_user(user)

    def _build_auth_response(self, user: User, is_new_user: bool = False) -> AuthResponse:
        access_token = self.jwt.create_access_token(
            subject=str(user.id),
            extra_claims={"email": user.email},
        )
        refresh_token = self.jwt.create_refresh_token(subject=str(user.id))
        return AuthResponse(
            user=self._serialize_user(user),
            tokens=TokenPair(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=ACCESS_EXPIRE_MINUTES * 60,
            ),
            is_new_user=is_new_user,
        )

    def _serialize_user(self, user: User) -> UserOut:
        return UserOut(
            id=str(user.id),
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar_url=user.avatar_url,
            age=user.computed_age,
            date_of_birth=user.date_of_birth,
            email_verified=user.email_verified,
            auth_providers=sorted({account.provider for account in user.oauth_accounts}),
        )

    def _update_oauth_account(self, oauth_account: OAuthAccount, identity) -> None:
        oauth_account.account_email = identity.email
        oauth_account.account_username = identity.email.split("@", 1)[0]
        oauth_account.access_token = identity.access_token
        oauth_account.refresh_token = identity.refresh_token
        oauth_account.expires_at = identity.expires_at

        user = oauth_account.user
        user.avatar_url = user.avatar_url or identity.avatar_url
        user.first_name = user.first_name or identity.first_name
        user.last_name = user.last_name or identity.last_name
        user.date_of_birth = user.date_of_birth or identity.date_of_birth
        user.age = calculate_age(user.date_of_birth) if user.date_of_birth else user.age
        user.email_verified = user.email_verified or identity.email_verified

    def _extract_bearer_token(self, authorization: str) -> str:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header must use Bearer <token>.",
            )
        return token
