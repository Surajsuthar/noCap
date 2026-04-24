# Server Guide

## Stack
- FastAPI
- Pydantic / pydantic-settings
- SQLAlchemy async ORM
- Uvicorn

## Intent
- This directory appears to be the backend scaffold for NoCap authentication and user persistence.
- The implemented surface is small and not fully wired into the frontend yet.

## Layout
- `server.py`: FastAPI app instance, CORS config, and a simple root health-style route.
- `core/route.py`: versioned API router scaffold intended to expose auth endpoints under `/v1`.
- `core/config.py`: environment-backed settings object.
- `core/database.py`: async SQLAlchemy engine/session setup plus `Base`.
- `core/models/user.py`: `User` and `OAuthAccount` models.
- `core/auth/router.py`: placeholder auth endpoints for register/login/logout/google login.
- `core/auth/schemas.py`: request/response schemas.
- `core/auth/jwt.py`: JWT helper class.
- `core/auth/reposrties.py`: minimal repository placeholder with a misspelled filename.

## Data Model
- `User` stores email, optional username/name/avatar, optional hashed password, age, and blocked state.
- `OAuthAccount` links a user to a provider account and stores provider tokens/metadata.
- `OAuthProvider` currently includes only Google.

## Important Gaps
- `server.py` does not include the router from `core/route.py`, so `/v1/auth/*` is not reachable yet.
- Auth route handlers are all `pass`.
- Some imports look inconsistent with the directory layout:
  - `core/config.py` uses `from pydentic_settings import BaseSettings`
  - `core/database.py` uses `from config import config`
  - `core/models/user.py` uses `from database import Base`
- `core/auth/jwt.py` depends on `jose`, but the matching package is not listed in `requirements.txt`.
- There are no migrations, tests, or startup scripts in this directory.

## Environment Expectations
- `core/config.py` expects:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `SECRET`
  - optional Google OAuth values
- `server/.env` exists, so check it before introducing new config keys.

## Practical Advice For Other Agents
- Verify imports and app wiring before extending features; assume the backend does not currently run cleanly without fixes.
- Keep API paths versioned under `/v1` if you wire `core/route.py` into the app.
- Build on the existing user/auth model rather than inventing a parallel structure.
- If you implement auth, align the frontend forms with `RegisterRequest` and `LoginRequest` in `core/auth/schemas.py`.
