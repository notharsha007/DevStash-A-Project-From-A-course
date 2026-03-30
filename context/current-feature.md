# Current Feature: Auth Setup — NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up split auth config pattern for edge compatibility
- Add GitHub OAuth provider
- Protect `/dashboard/*` routes using Next.js 16 proxy
- Redirect unauthenticated users to sign-in
- Extend Session type with `user.id`

## Notes

- Use `next-auth@beta` (not `@latest` which installs v4)
- Proxy file must be at `src/proxy.ts` (same level as `app/`)
- Use named export: `export const proxy = auth(...)` not default export
- Use `session: { strategy: 'jwt' }` with split config pattern
- Don't set custom `pages.signIn` — use NextAuth's default page
- Files to create: `src/auth.config.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`, `src/types/next-auth.d.ts`
- Env vars needed: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- Use Context7 to verify newest config and conventions

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
