# Server Guide

## Stack
- FastAPI
- Pydantic / pydantic-settings
- SQLAlchemy async ORM (asyncpg driver)
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- upstash-redis (async Redis client)
- Uvicorn

## Intent
Backend API for the NoCap application. Handles user registration, credential-based authentication, JWT token lifecycle, and authenticated user lookups.

## Layout

```
server/
├── server.py               # FastAPI app factory, CORS middleware, router wiring
├── routes.py               # Top-level /v1 router; includes auth + user sub-routers
├── config.py               # pydantic-settings Settings object (reads .env)
├── dependencies.py         # Shared FastAPI dependencies (CurrentUser)
├── redis.py                # Upstash Redis client singleton
├── rate_limit.py           # Rate-limit helper (currently empty — stub for future use)
├── requirements.txt        # Pinned Python dependencies
├── .env                    # Local environment variables (never commit)
├── database/
│   └── db.py               # Async SQLAlchemy engine, session factory, Base, get_db()
├── models/
│   └── user.py             # User ORM model + TimestampMixin
└── core/
    ├── auth/
    │   ├── endpoint.py     # POST /v1/auth/signup, /login, /refresh, /logout
    │   ├── schemas.py      # CredintialRegister, CredintialLogin, TokenPairResponse, …
    │   ├── service.py      # AuthService — register, login, refresh logic
    │   ├── repository.py   # AuthRepository — DB queries for auth flows
    │   ├── jwt.py          # JWTManager (create/decode access + refresh tokens)
    │   └── utils.py        # Hasher (bcrypt), calculate_age()
    ├── user/
    │   ├── endpoint.py     # GET /v1/users/me
    │   ├── schemas.py      # UserResponse
    │   ├── service.py      # UserService — get_me()
    │   └── repository.py   # UserRepository — get_user_by_id()
    └── health/
        └── endpoint.py     # GET /health (excluded from OpenAPI schema)
```

## API Surface

| Method | Path                | Auth required | Description                          |
|--------|---------------------|---------------|--------------------------------------|
| GET    | /health             | No            | DB connectivity probe                |
| POST   | /v1/auth/signup     | No            | Register; returns token pair + user  |
| POST   | /v1/auth/login      | No            | Credential login; returns token pair |
| POST   | /v1/auth/refresh    | No            | Exchange refresh token for new access token |
| POST   | /v1/auth/logout     | No            | Stateless logout (client discards tokens) |
| GET    | /v1/users/me        | Yes (Bearer)  | Return the authenticated user        |

## Data Model

### User (`users` table)
| Column         | Type          | Notes                        |
|----------------|---------------|------------------------------|
| id             | UUID          | Primary key, auto-generated  |
| first_name     | String(200)   | Nullable                     |
| last_name      | String(200)   | Nullable                     |
| email          | String(200)   | Unique, indexed, required    |
| email_verified | Boolean       | Default false                |
| password       | String(255)   | bcrypt hash, nullable (OAuth future) |
| date_of_birth  | Date          | Nullable                     |
| age            | Integer       | Nullable, computed on signup |
| created_at     | DateTime (tz) | Auto-set                     |
| updated_at     | DateTime (tz) | Auto-updated                 |

## Auth Flow

1. **Signup** (`POST /v1/auth/signup`): validates `CredintialRegister`, hashes password, persists user, returns `TokenPairResponse`.
2. **Login** (`POST /v1/auth/login`): looks up user by email, verifies bcrypt hash, returns `TokenPairResponse`.
3. **Refresh** (`POST /v1/auth/refresh`): decodes a `refresh` JWT, fetches user, returns a new `AccessTokenResponse`.
4. **Protected routes** use the `CurrentUser` dependency in `dependencies.py`, which reads the `Authorization: Bearer <access_token>` header, decodes it, and resolves the `User` ORM object.

## Environment Variables

Defined in `config.py` via `pydantic-settings`. All read from `.env`:

| Key                       | Required | Description                         |
|---------------------------|----------|-------------------------------------|
| DATABASE_URL              | Yes      | PostgreSQL connection string        |
| REDIS_URL                 | No       | Standard Redis URL (legacy)         |
| SECRET                    | Yes      | JWT signing secret                  |
| CORS_ORIGINS              | No       | JSON array of allowed origins       |
| GOOGLE_CLIENT_ID          | No       | Google OAuth client ID              |
| GOOGLE_CLIENT_SECRET      | No       | Google OAuth client secret          |
| GOOGLE_REDIRECT_URI       | No       | Google OAuth redirect URI           |
| POLAR_ACCESS_TOKEN        | No       | Polar.sh access token               |
| POLAR_SUCCESS_URL         | No       | Polar.sh success redirect URL       |
| UPSTASH_REDIS_REST_URL    | No       | Upstash REST URL (used by redis.py) |
| UPSTASH_REDIS_REST_TOKEN  | No       | Upstash REST token                  |

`DATABASE_URL` may use the `postgres://` or `postgresql://` scheme — `db.py` normalises it to `postgresql+asyncpg://` automatically.

## Known Gaps / Future Work

- **No database migrations** — there is no Alembic setup. Tables must be created manually or via `Base.metadata.create_all`.
- **Google OAuth** — config keys exist but no endpoint is wired up yet.
- **Rate limiting** — `rate_limit.py` is a stub; the login endpoint has its decorator commented out.
- **Email verification** — the `email_verified` column exists but nothing sets it to `true`.
- **Server-side token revocation** — logout is currently stateless; a Redis deny-list can be added via `redis.py`.

## Practical Advice For Other Agents

- All imports use project-root-relative paths (e.g. `from models.user import User`, `from database.db import get_db`). Do **not** use relative imports.
- Keep new endpoints versioned under `/v1` and register them in `routes.py`.
- Build on `AuthRepository` / `UserRepository` patterns — one repository per domain, injected into the service layer.
- Reuse `CurrentUser` from `dependencies.py` for any route that requires authentication.
- The `CredintialRegister` / `CredintialLogin` schema names are intentionally kept as-is (typo in `Credintial`) to stay consistent with existing frontend expectations.