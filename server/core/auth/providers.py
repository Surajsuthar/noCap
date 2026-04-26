from dataclasses import dataclass
from datetime import date

import httpx
from fastapi import HTTPException, status

from server.core.auth.schemas import OAuthLoginRequest, ProviderSlug
from server.core.config import config


@dataclass(slots=True)
class OAuthIdentity:
    provider: str
    account_id: str
    email: str
    email_verified: bool
    date_of_birth: date | None = None
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    expires_at: int | None = None
    metadata: dict | None = None


class OAuthProviderVerifier:
    provider: ProviderSlug

    async def verify(self, payload: OAuthLoginRequest) -> OAuthIdentity:
        raise NotImplementedError


class GoogleOAuthVerifier(OAuthProviderVerifier):
    provider = ProviderSlug.GOOGLE

    async def verify(self, payload: OAuthLoginRequest) -> OAuthIdentity:
        if not payload.access_token:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Google login requires an access_token with scopes: "
                    "openid email profile https://www.googleapis.com/auth/user.birthday.read"
                ),
            )

        if payload.id_token:
            tokeninfo = await self._fetch_google_tokeninfo(payload.id_token)
            audience = tokeninfo.get("aud")
            if config.google_client_id and audience != config.google_client_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google token audience does not match the configured client.",
                )

        data = await self._fetch_google_userinfo(payload.access_token)
        date_of_birth = await self._fetch_google_birthday(payload.access_token)

        email = (data.get("email") or "").strip().lower()
        sub = data.get("sub") or data.get("id")
        if not email or not sub:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google did not return the required identity fields.",
            )

        return OAuthIdentity(
            provider=self.provider.value,
            account_id=str(sub),
            email=email,
            email_verified=str(data.get("email_verified", "")).lower() == "true"
            or data.get("email_verified") is True,
            date_of_birth=date_of_birth,
            first_name=data.get("given_name"),
            last_name=data.get("family_name"),
            avatar_url=data.get("picture"),
            access_token=payload.access_token,
            metadata=data,
        )

    async def _fetch_google_tokeninfo(self, id_token: str) -> dict:
        url = "https://oauth2.googleapis.com/tokeninfo"
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params={"id_token": id_token})
        if response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token validation failed.",
            )
        return response.json()

    async def _fetch_google_userinfo(self, access_token: str) -> dict:
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers)
        if response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google access token validation failed.",
            )
        return response.json()

    async def _fetch_google_birthday(self, access_token: str) -> date:
        url = "https://people.googleapis.com/v1/people/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {"personFields": "birthdays"}
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers, params=params)
        if response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Google birthday lookup failed. Ensure the access token includes "
                    "https://www.googleapis.com/auth/user.birthday.read"
                ),
            )

        birthdays = response.json().get("birthdays", [])
        for birthday in birthdays:
            date_payload = birthday.get("date") or {}
            year = date_payload.get("year")
            month = date_payload.get("month")
            day = date_payload.get("day")
            if year and month and day:
                return date(year=year, month=month, day=day)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google did not return a full birth date including year.",
        )


PROVIDER_REGISTRY: dict[ProviderSlug, OAuthProviderVerifier] = {
    ProviderSlug.GOOGLE: GoogleOAuthVerifier(),
}


def get_provider_verifier(provider: ProviderSlug) -> OAuthProviderVerifier:
    verifier = PROVIDER_REGISTRY.get(provider)
    if verifier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"OAuth provider '{provider}' is not configured.",
        )
    return verifier
