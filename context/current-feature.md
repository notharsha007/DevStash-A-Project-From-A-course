# Current Feature: Email Verification on Register

## Status

In Progress

## Goals

- Send a verification email via Resend when a user registers with email/password
- Email contains a unique, time-limited verification link
- Clicking the link marks the user's email as verified (`emailVerified` field)
- Unverified users cannot sign in until they verify their email
- Handle expired/invalid tokens gracefully with user-friendly messages
- Add a "resend verification email" option

## Notes

- Using **Resend** as the email provider (RESEND_API_KEY already in .env)
- Leverage the existing `VerificationToken` model in the Prisma schema
- NextAuth v5 already has `emailVerified` on the User model
- Flow: Register → send email → redirect to "check your email" page → click link → verify → can sign in
- Need a new API route or server action to handle token verification
- Need a verification page at something like `/verify-email?token=...`

## History

- **2026-03-29** — Initial Next.js project setup (Create Next App)
- **2026-03-29** — Completed Dashboard UI Phase 1
- **2026-03-29** — Completed Dashboard UI Phase 2 — Collapsible sidebar with types nav, favorite/recent collections, user avatar, mobile drawer
- **2026-03-29** — Completed Dashboard UI Phase 3 — Stats cards, collections grid, pinned items, recent items
- **2026-03-29** — Completed Prisma 7 + Neon PostgreSQL setup — schema, migrations, seed, client singleton
- **2026-03-29** — Completed Seed Data — demo user, 7 system item types, 5 collections with 18 items
- **2026-03-29** — Completed Dashboard Collections — real DB data for collection cards, stats, dominant type colors
- **2026-03-29** — Completed Dashboard Items — real DB data for pinned/recent items, item stats, redesigned item cards, relative dates
- **2026-03-29** — Completed Stats & Sidebar — real DB data for sidebar item types, counts, collections with favorites and colored circles
- **2026-03-30** — Completed Add Pro Badge to Sidebar — PRO badge on File and Image types using ShadCN Badge component
- **2026-03-30** — Completed Codebase Quick Wins — N+1 query fix with Prisma _count, shared iconMap extraction, DATABASE_URL guard
- **2026-03-30** — Completed Auth Setup — NextAuth v5 with GitHub OAuth, Prisma adapter, JWT strategy, proxy route protection
- **2026-03-30** — Completed Auth Credentials — Email/password Credentials provider with split pattern, registration API route
- **2026-03-30** — Completed Auth UI — Custom sign-in/register pages, UserAvatar component, sidebar user dropdown with sign out, session-based dashboard layout, sonner toasts
