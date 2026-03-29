# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all your developer knowledge & resources.**

---

## Table of Contents

1. [Problem](#problem)
2. [Target Users](#target-users)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Data Models (Prisma)](#data-models-prisma)
6. [Features](#features)
7. [Monetization](#monetization)
8. [UI / UX](#ui--ux)
9. [Route Map](#route-map)
10. [Environment Variables](#environment-variables)

---

## Problem

Developers keep essential resources scattered across too many tools:

| Resource | Where it ends up |
|---|---|
| Code snippets | VS Code, Notion, GitHub Gists |
| AI prompts | Chat histories |
| Context files | Buried in project dirs |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Terminal commands | `.bash_history`, `.txt` files |
| Project templates | Gists, boilerplate repos |

This causes constant context switching, lost knowledge, and inconsistent workflows. **DevStash** consolidates everything into a single, fast, developer-first interface.

---

## Target Users

| Persona | Primary Need |
|---|---|
| **Everyday Developer** | Quick access to snippets, prompts, commands, and links |
| **AI-first Developer** | Save and organize prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, and course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, and API examples |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              Next.js 16 / React 19 (SSR)                │
│         Tailwind CSS v4  ·  shadcn/ui  ·  MDX           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│            Next.js API Routes / Server Actions           │
│       NextAuth v5  ·  Middleware  ·  Rate Limiting       │
└───────┬──────────────┬───────────────┬──────────────────┘
        │              │               │
        ▼              ▼               ▼
┌──────────────┐ ┌───────────┐ ┌──────────────────┐
│   Neon       │ │ Cloudflare│ │   OpenAI         │
│   PostgreSQL │ │ R2        │ │   gpt-5-nano     │
│   (Prisma 7) │ │ (files)   │ │   (AI features)  │
└──────────────┘ └───────────┘ └──────────────────┘
```

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 16** / React 19 | SSR pages, API routes, single repo |
| Language | **TypeScript** | End-to-end type safety |
| Database | **Neon** (PostgreSQL) | Cloud-hosted Postgres |
| ORM | **Prisma 7** | Migrations only — never `db push` |
| File Storage | **Cloudflare R2** | Images & file uploads (Pro) |
| Auth | **NextAuth v5** | Email/password + GitHub OAuth |
| AI | **OpenAI gpt-5-nano** | Auto-tag, summarize, explain, optimize |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | Dark mode default |
| Caching | **Redis** *(planned)* | Optional performance layer |

### Important Conventions

- **Database changes**: Always create Prisma migrations (`prisma migrate dev`). Never use `db push` or modify the DB directly.
- **Prisma docs**: Always fetch the latest Prisma 7 documentation — do not rely on cached/older versions.

---

## Data Models (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User ────────────────────────────────────────────

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  image                 String?
  hashedPassword        String?

  // Subscription
  isPro                 Boolean   @default(false)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique

  // Relations
  items                 Item[]
  collections           Collection[]
  customTypes           ItemType[]
  accounts              Account[]
  sessions              Session[]

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Item Types ──────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)

  // null for system types, set for custom types
  userId   String?
  user     User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items    Item[]

  @@unique([name, userId])
}

// ─── Items ───────────────────────────────────────────

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType @default(TEXT)
  content     String?     // text content (null if file)
  fileUrl     String?     // R2 URL (null if text)
  fileName    String?     // original filename
  fileSize    Int?        // bytes
  url         String?     // for link types
  description String?
  language    String?     // programming language (optional)
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)

  // Relations
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId  String
  itemType    ItemType    @relation(fields: [itemTypeId], references: [id])
  tags        TagsOnItems[]
  collections ItemCollection[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId, itemTypeId])
  @@index([userId, isFavorite])
  @@index([userId, isPinned])
}

enum ContentType {
  TEXT
  FILE
  URL
}

// ─── Collections ─────────────────────────────────────

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?

  // Relations
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items         ItemCollection[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}

// ─── Join Tables ─────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## Features

### A. Item Types

Items are the core unit. Each item has a type that determines its behavior and appearance.

| Type | Content Mode | Color | Icon | Tier |
|---|---|---|---|---|
| 🔵 Snippet | `TEXT` | `#3b82f6` blue | `Code` | Free |
| 🟣 Prompt | `TEXT` | `#8b5cf6` purple | `Sparkles` | Free |
| 🟠 Command | `TEXT` | `#f97316` orange | `Terminal` | Free |
| 🟡 Note | `TEXT` | `#fde047` yellow | `StickyNote` | Free |
| ⚪ File | `FILE` | `#6b7280` gray | `File` | Pro |
| 🩷 Image | `FILE` | `#ec4899` pink | `Image` | Pro |
| 🟢 Link | `URL` | `#10b981` emerald | `Link` | Free |

- System types are immutable and shared across all users.
- Users can create **custom types** (Pro, future feature).
- Items open in a **slide-out drawer** for quick access and editing.
- Text items use a **Markdown editor**.
- File items use a **file upload** flow (stored on Cloudflare R2).

### B. Collections

Flexible grouping for items. An item can belong to **multiple collections**.

- Examples: "React Patterns", "Interview Prep", "Context Files", "Python Snippets"
- Collections display as **color-coded cards** based on their most common item type.
- Supports favorites.
- `defaultTypeId` pre-selects a type when adding items to a new/empty collection.

### C. Search

Full search across content, titles, tags, and types. Free tier gets basic search; advanced search (fuzzy, filters) is Pro.

### D. Authentication

| Method | Provider |
|---|---|
| Email / Password | NextAuth Credentials |
| GitHub OAuth | NextAuth GitHub Provider |

### E. Core Features

- Favorite items and collections
- Pin items to top
- Recently used items
- Import code from a file
- Markdown editor (text types)
- File upload (file/image types — Pro)
- Export data as JSON/ZIP (Pro)
- Dark mode (default) / light mode toggle
- Add/remove items to/from multiple collections
- View which collections an item belongs to

### F. AI Features (Pro Only)

| Feature | Description |
|---|---|
| Auto-tag suggestions | AI analyzes content and suggests relevant tags |
| Summaries | Generate a short summary of any item |
| Explain This Code | AI explains a snippet in plain English |
| Prompt Optimizer | Rewrites and improves AI prompts |

All AI features use the **OpenAI gpt-5-nano** model via API routes.

---

## Monetization

Freemium model with a single Pro tier.

| | Free | Pro ($8/mo · $72/yr) |
|---|---|---|
| Items | 50 | Unlimited |
| Collections | 3 | Unlimited |
| File/Image uploads | ✗ | ✓ |
| Custom types | ✗ | ✓ (future) |
| AI features | ✗ | ✓ |
| Data export | ✗ | ✓ |
| Search | Basic | Advanced |
| Support | Community | Priority |

Payments handled via **Stripe** (Checkout + Customer Portal). Store `stripeCustomerId` and `stripeSubscriptionId` on the User model. During development, all users have full access regardless of tier.

---

## UI / UX

### Design Principles

- Modern, minimal, developer-focused
- Dark mode by default
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks

### Design References

- [Notion](https://notion.so) — flexible content blocks
- [Linear](https://linear.app) — speed and keyboard-first UX
- [Raycast](https://raycast.com) — quick-access drawer pattern

### Screenshots

Refer to the screenshots below as a base for the backend ui. It does not have to be exact. Use it as a reference :

- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png
### Layout

```
┌──────────────────────────────────────────────────┐
│  ┌────────────┐  ┌─────────────────────────────┐ │
│  │            │  │                             │ │
│  │  Sidebar   │  │       Main Content          │ │
│  │            │  │                             │ │
│  │  • Types   │  │  Collections (grid, color-  │ │
│  │    - Snip  │  │  coded cards by dominant    │ │
│  │    - Prom  │  │  type)                      │ │
│  │    - Cmd   │  │                             │ │
│  │    - Note  │  │  Items (listed under        │ │
│  │    - File  │  │  collections, color-coded   │ │
│  │    - Img   │  │  borders by type)           │ │
│  │    - Link  │  │                             │ │
│  │            │  │                             │ │
│  │  • Recent  │  │         ┌────────────┐      │ │
│  │    Collec. │  │         │  Drawer    │      │ │
│  │            │  │         │  (Item     │      │ │
│  │            │  │         │   detail)  │      │ │
│  └────────────┘  └─────────┴────────────┘      │ │
└──────────────────────────────────────────────────┘
```

- **Sidebar**: Collapsible. Lists item types as nav links (e.g. `/items/snippets`), plus recent collections. Becomes a mobile drawer on small screens.
- **Main content**: Grid of collection cards (background colored by dominant type) and item cards (border colored by type).
- **Item drawer**: Slide-out panel for viewing/editing individual items.

### Micro-interactions

- Smooth transitions on navigation and state changes
- Hover states on cards (elevation, border glow)
- Toast notifications for CRUD actions
- Loading skeletons during data fetches

---

## Route Map

### Pages

| Route | Description |
|---|---|
| `/` | Landing / marketing page |
| `/login` | Sign in |
| `/register` | Sign up |
| `/dashboard` | Home — recent items, pinned, favorites |
| `/items/snippets` | All snippet items |
| `/items/prompts` | All prompt items |
| `/items/commands` | All command items |
| `/items/notes` | All note items |
| `/items/files` | All file items (Pro) |
| `/items/images` | All image items (Pro) |
| `/items/links` | All link items |
| `/collections` | All collections |
| `/collections/[id]` | Single collection view |
| `/search` | Search results |
| `/settings` | Account, theme, billing |

### API Routes

| Method | Route | Purpose |
|---|---|---|
| `GET/POST` | `/api/items` | List / create items |
| `GET/PATCH/DELETE` | `/api/items/[id]` | Read / update / delete item |
| `GET/POST` | `/api/collections` | List / create collections |
| `GET/PATCH/DELETE` | `/api/collections/[id]` | Read / update / delete collection |
| `POST/DELETE` | `/api/collections/[id]/items` | Add / remove items from collection |
| `GET/POST` | `/api/tags` | List / create tags |
| `GET` | `/api/search` | Search items |
| `POST` | `/api/upload` | Upload file to R2 (Pro) |
| `POST` | `/api/ai/auto-tag` | AI tag suggestions (Pro) |
| `POST` | `/api/ai/summarize` | AI summary (Pro) |
| `POST` | `/api/ai/explain` | AI code explanation (Pro) |
| `POST` | `/api/ai/optimize-prompt` | AI prompt optimizer (Pro) |
| `POST` | `/api/stripe/checkout` | Create Stripe checkout session |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler |
| `GET` | `/api/export` | Export data as JSON/ZIP (Pro) |

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="devstash-uploads"
R2_PUBLIC_URL="..."

# OpenAI
OPENAI_API_KEY="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
STRIPE_PRO_PRICE_ID="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
