# Item Types

DevStash has 7 built-in system item types. All are immutable, shared across users, and stored in the `ItemType` table with `isSystem: true`.

---

## Type Reference

### Snippet

| Field | Value |
|---|---|
| **Icon** | `Code` (Lucide) |
| **Color** | `#3b82f6` (blue) |
| **ContentType** | `TEXT` |
| **Tier** | Free |

**Purpose**: Store reusable code fragments — hooks, utilities, patterns, boilerplate.

**Key fields used**: `title`, `content` (the code), `language` (e.g. `typescript`, `dockerfile`), `description`, `tags`, `isFavorite`, `isPinned`

---

### Prompt

| Field | Value |
|---|---|
| **Icon** | `Sparkles` (Lucide) |
| **Color** | `#8b5cf6` (purple) |
| **ContentType** | `TEXT` |
| **Tier** | Free |

**Purpose**: Save AI prompts — system messages, chain-of-thought templates, task-specific instructions.

**Key fields used**: `title`, `content` (the prompt text), `description`, `tags`, `isFavorite`, `isPinned`

---

### Command

| Field | Value |
|---|---|
| **Icon** | `Terminal` (Lucide) |
| **Color** | `#f97316` (orange) |
| **ContentType** | `TEXT` |
| **Tier** | Free |

**Purpose**: Store shell/CLI commands — one-liners, scripts, deployment commands, git workflows.

**Key fields used**: `title`, `content` (the command string), `description`, `tags`, `isFavorite`, `isPinned`

---

### Note

| Field | Value |
|---|---|
| **Icon** | `StickyNote` (Lucide) |
| **Color** | `#fde047` (yellow) |
| **ContentType** | `TEXT` |
| **Tier** | Free |

**Purpose**: Free-form Markdown notes — documentation, explanations, meeting notes, ideas.

**Key fields used**: `title`, `content` (Markdown body), `description`, `tags`, `isFavorite`, `isPinned`

---

### File

| Field | Value |
|---|---|
| **Icon** | `File` (Lucide) |
| **Color** | `#6b7280` (gray) |
| **ContentType** | `FILE` |
| **Tier** | Pro |

**Purpose**: Upload and store arbitrary files — PDFs, context files, configs, templates.

**Key fields used**: `title`, `fileUrl` (Cloudflare R2 URL), `fileName` (original filename), `fileSize` (bytes), `description`, `tags`, `isFavorite`, `isPinned`

---

### Image

| Field | Value |
|---|---|
| **Icon** | `Image` (Lucide) |
| **Color** | `#ec4899` (pink) |
| **ContentType** | `FILE` |
| **Tier** | Pro |

**Purpose**: Upload and store images — screenshots, diagrams, UI references, assets.

**Key fields used**: `title`, `fileUrl` (Cloudflare R2 URL), `fileName`, `fileSize` (bytes), `description`, `tags`, `isFavorite`, `isPinned`

---

### Link

| Field | Value |
|---|---|
| **Icon** | `Link` (Lucide) |
| **Color** | `#10b981` (emerald) |
| **ContentType** | `URL` |
| **Tier** | Free |

**Purpose**: Bookmark external URLs — documentation, tools, references, articles.

**Key fields used**: `title`, `url` (the external URL), `description`, `tags`, `isFavorite`, `isPinned`

---

## Classification Summary

### By ContentType

| ContentType | Types | Storage |
|---|---|---|
| `TEXT` | snippet, prompt, command, note | `content` field (string) |
| `FILE` | file, image | `fileUrl`, `fileName`, `fileSize` (Cloudflare R2) |
| `URL` | link | `url` field (string) |

- `TEXT` types render in the Markdown editor
- `FILE` types use the file upload flow; `content` is null
- `URL` types store an external link; `content` is null

### Shared Properties (all types)

All items share these fields regardless of type:

| Field | Type | Notes |
|---|---|---|
| `id` | `String` | cuid |
| `title` | `String` | Required |
| `description` | `String?` | Optional summary |
| `isFavorite` | `Boolean` | Default false |
| `isPinned` | `Boolean` | Default false |
| `userId` | `String` | Owner |
| `itemTypeId` | `String` | FK to ItemType |
| `tags` | `TagsOnItems[]` | Many-to-many |
| `collections` | `ItemCollection[]` | Many-to-many |
| `createdAt` / `updatedAt` | `DateTime` | Auto-managed |

### Display Differences

| Type | Item card border | Drawer UI |
|---|---|---|
| TEXT types | Colored left border (type color) | Markdown editor |
| FILE types | Colored left border (type color) | File upload / preview |
| URL types | Colored left border (type color) | Clickable URL, no editor |

- Cards are color-coded by `ItemType.color`
- Collections display a dominant color based on the most common item type they contain
- `language` field is used only by TEXT types (primarily snippets) to enable syntax highlighting
