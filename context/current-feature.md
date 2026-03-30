# Current Feature: Auth Credentials — Email/Password Provider

## Status

In Progress

## Goals

- Add Credentials provider for email/password authentication
- Add `password` field to User model (migration if needed)
- Update `auth.config.ts` with Credentials provider placeholder (`authorize: () => null`)
- Update `auth.ts` to override Credentials with bcrypt validation
- Create registration API route at `POST /api/auth/register`
- Registration validates passwords match, checks duplicates, hashes with bcryptjs
- GitHub OAuth continues to work alongside credentials

## Notes

- Uses bcryptjs (already installed)
- Split pattern: `auth.config.ts` gets placeholder, `auth.ts` overrides with real logic
- Registration accepts: name, email, password, confirmPassword
- Test with curl + NextAuth default signin page

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
