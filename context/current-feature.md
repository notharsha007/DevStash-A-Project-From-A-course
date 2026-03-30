# Current Feature: Auth UI - Sign In, Register & Sign Out

## Status

In Progress

## Goals

- Custom Sign In page at `/sign-in` with email/password fields + GitHub OAuth button + link to register
- Custom Register page at `/register` with name, email, password, confirm password fields + validation
- Sidebar bottom: user avatar (GitHub image or initials fallback), user name, dropdown with Sign Out
- Clicking avatar navigates to `/profile`
- Reusable avatar component handling both GitHub image and initials cases

## Notes

- Avatar logic: if user has `image` (from GitHub), use it; otherwise generate initials from name (e.g., "Brad Traversy" -> "BT")
- Register form submits to existing `/api/auth/register` endpoint
- Register redirects to sign-in on success
- Form validation: passwords must match, email format check
- Replace NextAuth default pages with custom UI

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
