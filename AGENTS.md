<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NoCap Repo Guide

## Purpose
- This repo is split into a `client/` Next.js app and a `server/` FastAPI app.
- The product direction is a random video chat platform branded as **NoCap**.
- The frontend currently contains most of the real product work. The backend is mostly scaffolded.

## Top-Level Layout
- `client/`: Next.js 16.2.4 app using React 19, TypeScript, Tailwind CSS v4, Biome, `next-themes`, and a set of `components/ui` primitives.
- `server/`: FastAPI skeleton with SQLAlchemy models, auth schemas, JWT helper, and placeholder auth routes.
- `AGENTS.md`: repo-wide guidance.
- `client/AGENTS.md`: frontend-specific guide.
- `server/AGENTS.md`: backend-specific guide.

## Current State
- Frontend is a marketing/auth prototype with styled pages and placeholder interactions.
- Backend is not integrated into the frontend yet.
- Auth forms validate locally but do not call the API.
- The chat room is a static shell, not a working RTC implementation.

## How To Work Here
- Start by identifying whether your task belongs to `client/` or `server/`.
- Prefer editing the frontend unless the task explicitly requires backend work; that is where most implemented behavior lives today.
- Keep branding consistent: `NoCap`, video-chat product language, bold typography, dark-first presentation.
- When changing Next.js app code, check the local Next.js docs under `node_modules/next/dist/docs/` first because this project uses `next@16`.

## Quick Map
- Landing page: `client/app/page.tsx`
- Auth pages: `client/app/auth/page.tsx`, `client/app/auth/register/page.tsx`
- Chat shell: `client/app/chat/page.tsx`
- Global layout/theme/fonts: `client/app/layout.tsx`, `client/app/globals.css`
- Auth form logic: `client/components/auth-form.tsx`
- Shared validation/utilities: `client/lib/types.ts`, `client/lib/utils.ts`
- API entrypoint: `server/server.py`
- API router mount point scaffold: `server/core/route.py`
- Auth router/schemas: `server/core/auth/router.py`, `server/core/auth/schemas.py`
- User model: `server/core/models/user.py`

## Important Reality Checks
- `server/server.py` currently exposes only a root `"/"` route and does not mount `core.route.router`.
- Several backend files appear unfinished or inconsistent. Examples include import-path mistakes and placeholder route handlers.
- `server/core/config.py` imports `pydentic_settings`, which looks misspelled relative to the installed package name.
- `server/core/auth/jwt.py` imports `jose`, but `python-jose` is not listed in `server/requirements.txt`.
- Treat the backend as scaffold code that needs verification before building on top of it.

## Safe Assumptions For Other Agents
- Frontend uses the App Router.
- Styling is driven by Tailwind v4 plus CSS custom properties in `client/app/globals.css`.
- Theme switching exists, with dark mode as the default.
- UI primitives under `client/components/ui/` are reusable building blocks; avoid rewriting them unless necessary.
- There is no confirmed production auth flow, persistence layer wiring, or live video implementation yet.
