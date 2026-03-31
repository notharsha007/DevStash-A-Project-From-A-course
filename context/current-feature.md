# Current Feature: Profile Page

## Status

In Progress

## Goals

- Create profile page at `/profile` route (protected, requires authentication)
- Display user info: email, name, avatar (GitHub image or initials fallback), account creation date
- Show usage stats: total items, total collections, per-type item breakdown (snippets, prompts, notes, commands, links, files, images)
- Add change password action — email/password users only (hide for GitHub OAuth users)
- Add delete account action with confirmation dialog to prevent accidental deletion

## Notes

- Avatar: use `user.image` if present (GitHub OAuth), otherwise generate initials from name or email
- Change password only shown when `user.hashedPassword` is set (i.e. not a pure OAuth account)
- Delete account confirmation dialog — use shadcn/ui AlertDialog
- Item type breakdown queries via Prisma `_count` or grouped query on `ItemType`
- Follow existing data-fetching pattern: server component fetches directly with Prisma, client components for interactive actions (change password form, delete confirmation)

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
- **2026-03-30** — Completed Email Verification — Resend-powered verification on register, check-email/verify-email pages, unverified sign-in block, resend option, clean-users script
- **2026-03-30** — Completed Email Verification Toggle — REQUIRE_EMAIL_VERIFICATION env var to disable verification during development
- **2026-03-31** — Completed Forgot Password — Email-based reset flow using VerificationToken model with `reset:` prefix, 1hr expiry, forgot-password + reset-password pages, API routes, Resend email
