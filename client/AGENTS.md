<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Client Guide

## Stack
- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Biome for lint/format
- `next-themes` for theme switching
- `react-hook-form` + `zod` for form validation

## Product Surface
- `app/page.tsx`: main landing page with a polished marketing hero, rotating testimonial, and static call-preview carousel.
- `app/auth/layout.tsx`: split-screen auth shell.
- `app/auth/page.tsx`: sign-in page using `LoginForm`.
- `app/auth/register/page.tsx`: registration page using `RegisterForm`.
- `app/chat/page.tsx`: static in-call UI shell.
- `app/about-us/page.tsx`, `app/price/page.tsx`, `app/terms/page.tsx`, `app/privacy-policy/page.tsx`: supporting marketing/legal routes.

## Shared Building Blocks
- `components/auth-form.tsx`: most important interactive component in the app today. Contains both login and register forms.
- `components/providers/ThemeProvider.tsx`: wraps `next-themes`; dark mode is the default.
- `components/ui/`: reusable primitives. Prefer composing these instead of introducing ad hoc replacements.
- `lib/types.ts`: zod schemas for login/register; register flow derives `age` from `dob`.
- `lib/utils.ts`: `cn()` helper and `getAge()`.

## Styling System
- Global design tokens live in `app/globals.css`.
- Fonts are set in `app/layout.tsx` using `Oxanium` and `Source Code Pro`.
- Theme values are mostly custom CSS variables mapped into Tailwind tokens.
- The visual language is sharp-edged and dark-first, with warm orange primary accents rather than the default shadcn look.

## Working Notes
- This is an App Router project. Keep new pages/layouts consistent with `app/`.
- Auth forms currently stop at validation and `console.log`; there is no API integration yet.
- `components/room.tsx` is effectively empty and is not the real chat UI. The visible chat shell is in `app/chat/page.tsx`.
- `components/app-header.tsx` uses hardcoded sample user data.
- If you touch routing, metadata, layouts, or other framework-sensitive APIs, inspect the local Next.js 16 docs first.

## Commands
- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`

## Practical Advice For Other Agents
- Preserve the current brand voice: direct, energetic, real-conversation messaging.
- Reuse existing theme tokens and UI components before adding new ones.
- Prefer implementing missing product behavior on top of existing forms/pages instead of replacing the current visuals wholesale.
