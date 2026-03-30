---
name: Codebase Architecture
description: DevStash Next.js 16 app structure, patterns, and known issues as of 2026-03-30
type: project
---

Tech: Next.js 16, React 19, TypeScript strict, Prisma 7 + Neon PG, Tailwind v4, Base UI (not Radix), shadcn/ui.

**Why:** Audit snapshot taken 2026-03-30 at early project stage (dashboard UI only, no auth, no API routes).

**How to apply:** Use this to understand current state before suggesting changes.

Key files:
- Pages: app/page.tsx (stub), app/layout.tsx, app/dashboard/page.tsx, app/dashboard/layout.tsx
- Components: components/dashboard/ (Sidebar, SidebarContext, TopBar, StatsCards, CollectionCard, ItemRow), components/ui/ (button, card, badge, avatar, input, separator, tooltip)
- Lib: lib/prisma.ts (singleton), lib/utils.ts (cn), lib/mock-data.ts (unused), lib/db/items.ts, lib/db/collections.ts
- Prisma: prisma/schema.prisma, prisma/seed.ts

Known issues found in audit:
1. lib/mock-data.ts is entirely unused — real DB queries are in lib/db/
2. iconMap is duplicated in Sidebar.tsx, CollectionCard.tsx, and ItemRow.tsx (3 copies)
3. dominantTypeColor calculation logic is duplicated in getRecentCollections and getSidebarCollections
4. CollectionCard is 'use client' unnecessarily — only uses Link and static rendering; the MoreHorizontal button does nothing yet
5. dashboard/layout.tsx and dashboard/page.tsx both independently look up the demo user via prisma.user.findUnique — two DB round trips per page load
6. getItemTypesWithCounts uses items.length on fetched records instead of _count — loads all item IDs into memory
7. ItemRow receives a `tags` prop but never renders it — dead prop
8. prisma.ts uses non-null assertion (!) on DATABASE_URL — crashes silently in misconfigured envs
9. typeToSlug in Sidebar.tsx always appends "s" — "image" → "images" works but "link" → "links" works; brittle for future types
10. Seed file has a sequential for-loop with await inside for collections/items — slow; could be parallelized
