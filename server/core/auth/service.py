from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
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
from models.user import AuthSessionMethod, OAuthAccount, OAuthProvider, User

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPES = ("openid", "email", "profile")


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
    def _provider_token_expires_at(expires_in: int | None) -> datetime | None:
        if expires_in is None:
            return None
        return datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    @staticmethod
    def _require_google_config() -> None:
        missing = [
            key
            for key, value in {
                "GOOGLE_CLIENT_ID": config.GOOGLE_CLIENT_ID,
                "GOOGLE_CLIENT_SECRET": config.GOOGLE_CLIENT_SECRET,
                "GOOGLE_REDIRECT_URI": config.GOOGLE_REDIRECT_URI,
            }.items()
            if not value
        ]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Missing Google OAuth config: {', '.join(missing)}.",
            )

    @staticmethod
    def build_google_authorization_url(state: str) -> str:
        AuthService._require_google_config()
        params = {
            "client_id": config.GOOGLE_CLIENT_ID,
            "redirect_uri": config.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(GOOGLE_SCOPES),
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

    @staticmethod
    def create_oauth_state() -> str:
        return jwt_manager.create_oauth_state_token()

    @staticmethod
    def validate_oauth_state(state: str, expected_state: str | None) -> None:
        if not expected_state or state != expected_state:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OAuth state.",
            )

        try:
            jwt_manager.decode_token(state, expected_type="oauth_state")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(exc),
            ) from exc

    async def _persist_auth_session(
        self,
        *,
        user: User,
        token_pair: TokenPairResponse,
        method: AuthSessionMethod,
        session: AsyncSession,
        oauth_account: OAuthAccount | None = None,
    ) -> None:
        await self.repository.create_auth_session(
            user=user,
            token_pair=token_pair,
            method=method,
            oauth_account=oauth_account,
            access_token_expires_at=jwt_manager.get_expiration(token_pair.access_token),
            refresh_token_expires_at=jwt_manager.get_expiration(token_pair.refresh_token),
            session=session,
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

    async def login(self, payload: CredintialLogin, session: AsyncSession) -> TokenPairResponse:
        user = await self.repository.get_user_by_email(payload.email, session)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email does not exist.",
            )

        if user.is_blocked or not user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is blocked.",
            )

        token_pair = self._build_auth_response(user)
        await self._persist_auth_session(
            user=user,
            token_pair=token_pair,
            method=AuthSessionMethod.google_oauth,
            oauth_account=oauth_account,
            session=session,
        )

        return token_pair

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

        token_pair = self._build_auth_response(user)
        await self._persist_auth_session(
            user=user,
            token_pair=token_pair,
            method=AuthSessionMethod.magic_link,
            session=session,
        )
        return token_pair

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

    async def exchange_google_code(
        self,
        *,
        code: str,
        session: AsyncSession,
    ) -> TokenPairResponse:
        AuthService._require_google_config()

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                token_response = await client.post(
                    GOOGLE_TOKEN_URL,
                    data={
                        "code": code,
                        "client_id": config.GOOGLE_CLIENT_ID,
                        "client_secret": config.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": config.GOOGLE_REDIRECT_URI,
                        "grant_type": "authorization_code",
                    },
                    headers={"Accept": "application/json"},
                )
                token_response.raise_for_status()
                google_tokens = token_response.json()

                userinfo_response = await client.get(
                    GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {google_tokens['access_token']}"},
                )
                userinfo_response.raise_for_status()
                userinfo = userinfo_response.json()
        except (httpx.HTTPError, KeyError) as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google OAuth authentication failed.",
            ) from exc

        google_account_id = userinfo.get("sub")
        email = userinfo.get("email")
        if not google_account_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account did not return an email identity.",
            )

        existing_oauth_account = await self.repository.get_oauth_account(
            provider=OAuthProvider.google,
            account_id=google_account_id,
            session=session,
        )

        user = (
            await self.repository.get_user_by_id(existing_oauth_account.user_id, session)
            if existing_oauth_account
            else None
        )
        if user is None:
            user = await self.repository.get_user_by_email(email, session)

        first_name = userinfo.get("given_name")
        last_name = userinfo.get("family_name")
        avatar_url = userinfo.get("picture")
        email_verified = bool(userinfo.get("email_verified"))

        if user is None:
            user = await self.repository.create_oauth_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url,
                email_verified=email_verified,
                session=session,
            )
        else:
            if user.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is blocked.",
                )
            user = await self.repository.update_user_from_oauth(
                user,
                first_name=first_name,
                last_name=last_name,
                avatar_url=avatar_url,
                email_verified=email_verified,
                session=session,
            )

        oauth_account = await self.repository.upsert_oauth_account(
            user=user,
            provider=OAuthProvider.google,
            account_id=google_account_id,
            access_token=google_tokens.get("access_token"),
            refresh_token=google_tokens.get("refresh_token"),
            expires_at=self._provider_token_expires_at(google_tokens.get("expires_in")),
            session=session,
        )

        token_pair = self._build_auth_response(user)
        await self._persist_auth_session(
            user=user,
            token_pair=token_pair,
            method=AuthSessionMethod.google_oauth,
            oauth_account=oauth_account,
            session=session,
        )
        return token_pair
