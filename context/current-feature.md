# Current Feature

None — ready for next feature.

## Status

Idle

## Goals

## Notes

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
- **2026-03-31** — Completed Profile Page — User info card with avatar/joined date, usage stats with per-type breakdown, change password dialog (email users only), delete account confirmation dialog
- **2026-03-31** — Completed Auth Security Fixes — SHA-256 token hashing, centralized proxy.ts route protection, server-side password minimum, hasPassword boolean in ProfileData, email enumeration fix, BCRYPT_ROUNDS constant, email query param validation, non-null assertion guards
- **2026-03-31** — Completed Rate Limiting for Auth — Upstash Redis sliding window limits on all 5 auth endpoints, reusable lib/rate-limit.ts utility, 429 + Retry-After responses, fail-open on Upstash errors, frontend toast/error handling for rate limit responses
- **2026-03-31** — Fixed GitHub OAuth Redirect — Replaced client-side signIn() with signInWithGitHub server action (actions/auth.ts) using redirectTo, fixing double-click issue on first OAuth login
- **2026-03-31** — Completed Items List View — Dynamic `/items/[type]` route with auth-guarded layout, type-filtered Prisma query, responsive 2-column ItemRow grid with type-colored left borders, empty state, and 404 for unknown slugs
- **2026-03-31** — Completed Vitest Setup — unit testing for server actions and utilities; npm test / test:watch / test:coverage scripts
- **2026-03-31** — Completed Item List 3-Column Layout — added `lg:grid-cols-3` to items list view (1 col mobile, 2 col md, 3 col lg+); fixed pre-existing build error by moving `url`/`directUrl` from prisma.config.ts into schema.prisma
- **2026-03-31** — Completed Item Drawer — Right-side Sheet drawer opens on ItemCard click; `GET /api/items/[id]` route with auth; `getItemDetail` Prisma query; `ItemsClientWrapper` client state manager; action bar (Favorite, Pin, Copy, Edit, Delete); line-numbered content block; pill badges; Description, Tags, Collections, Details sections; 6 Vitest unit tests
- **2026-03-31** — Completed Item Drawer Edit Mode — Inline edit mode toggled by Edit button; Save/Cancel action bar; type-specific fields (Content, Language, URL); Zod-validated `updateItem` server action; `updateItem` DB query with tag disconnect-all/connect-or-create; shadcn Textarea component; `router.refresh()` after save; 10 new Vitest tests
- **2026-03-31** — Completed Item Delete — AlertDialog confirmation showing item title; `deleteItem` server action with auth guard and ownership check; `deleteItem` DB query; success toast + drawer close + `router.refresh()`; error toast on failure; 4 new Vitest tests
- **2026-03-31** — Completed Item Create — shadcn Dialog with 5-type selector (snippet/prompt/command/note/link), conditional fields per type (content+language, content, URL), Zod-validated `createItem` server action, `createItem` DB query with tag connect-or-create, toast + modal close + `router.refresh()`
- **2026-04-01** — Completed Code Editor — Monaco Editor (`CodeEditor` component) for snippet/command types in drawer view + edit modes and create dialog; macOS window dots, language label, copy button, fluid height (max 400px); `ItemsPageHeader` with title, item count, and type-specific New button (pre-selects type in dialog); DevStash logo links to /dashboard
- **2026-04-01** — Completed Markdown Editor — `MarkdownEditor` component with Write/Preview tabs, macOS dots, copy button, dark theme matching CodeEditor; react-markdown + remark-gfm for GFM rendering; custom `.markdown-preview` CSS for h1–h6, code blocks, lists, blockquotes, tables, links; readonly mode shows Preview only; integrated in ItemDrawer (view + edit modes) and CreateItemDialog for note and prompt types
- **2026-04-01** — Completed File & Image Upload — Cloudflare R2 storage via `@aws-sdk/client-s3`; `FileUpload` component with drag-and-drop, XHR progress bar, MIME+size validation; `POST /api/upload` and `GET /api/download/[...path]` proxy routes; file/image types added to `CreateItemDialog`; image preview + file info card with download in `ItemDrawer`; R2 object deleted on item delete; Copy button wired to clipboard for text types
- **2026-04-01** — Completed Image Gallery View — `ImageThumbnailCard` component with `aspect-video`, `object-cover`, 5% hover zoom (300ms); `gallery` variant in `ItemsClientWrapper`; `/items/images` uses 3-col responsive grid; `fileUrl` added to `DashboardItem`
- **2026-04-01** — Completed File List View — `FileListRow` component with extension-based file icon, title, filename, size, relative date ("Today"/"Yesterday"/etc.), always-visible download button; `file-list` variant in `ItemsClientWrapper`; `/items/files` uses single-column list; `fileName`/`fileSize` added to `DashboardItem`; `+ New` button enabled for files and images pages
- **2026-04-01** — Completed Collection Create — `createCollection` DB function + server action (Zod, auth-guarded); `CreateCollectionDialog` modal with Name/Description fields, toasts, `router.refresh()`; `CollectionsSectionHeader` client component with New button + View all link; wired into dashboard collections section; ItemRow copy button (hover-reveal, clipboard, check icon)
- **2026-04-01** — Completed Add Item to Collections — `CollectionsSelect` pill-toggle multi-select component; `getUserCollections` DB query + server action; `collectionIds` added to `createItem`/`updateItem` DB functions, Zod schemas, and server actions; Collections field in `CreateItemDialog` (fetches on open) and `ItemDrawer` EditContent (fetches on edit, pre-populates from item); New Collection button in TopBar wired to `CreateCollectionDialog`; fixed pre-existing Zod `.issues` bug and `deleteItem` mock bug in tests
- **2026-04-01** — Completed Collections Pages — `/collections` page with full grid of all user collections (`getAllCollections` DB query, `CollectionsSectionHeader` + `CollectionCard`); `/collections/[id]` page with mixed-type rendering (regular items in default grid, images in gallery section, files in file-list section); `getCollectionById` + `getItemsByCollection` DB queries; shared layout with auth guard + sidebar; `typeName` field added to `getItemsByCollection` for per-item type detection
- **2026-04-01** — Completed Collection Management Actions — Edit/Delete/Favorite (icon only) buttons on `/collections/[id]` header (`CollectionDetailHeader` client component); 3-dots dropdown on collection cards (`/collections` grid + dashboard) with Edit, Delete, Favorite; `EditCollectionDialog` modal; AlertDialog delete confirmation (items not deleted, only join records); `updateCollection` + `deleteCollection` DB functions and server actions (auth-guarded, ownership-checked via updateMany/deleteMany); portal event bubbling fix via stopPropagation on DropdownMenuContent
- **2026-04-01** — Completed Global Search / Command Palette — Cmd+K shortcut, client-side fuzzy search across items and collections, CommandDialog UI with cmdk, ItemDrawerContext for layout-level drawer opening, search data pre-fetched in all standard auth layouts
