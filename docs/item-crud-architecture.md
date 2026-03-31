# Item CRUD Architecture

A unified system for all 7 item types — one action file, one query module, one dynamic route, shared components that adapt by type.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # All item mutations (create, update, delete)
│
├── lib/
│   └── db/
│       └── items.ts              # All item queries (called from server components)
│
├── app/
│   └── items/
│       └── [type]/
│           └── page.tsx          # Dynamic route: /items/snippets, /items/links, etc.
│
└── components/
    └── items/
        ├── ItemCard.tsx          # List card — adapts color/icon/preview by type
        ├── ItemDrawer.tsx        # Slide-out detail panel — routes to correct sub-view
        ├── ItemForm.tsx          # Create/edit form — shows fields based on contentType
        ├── editors/
        │   ├── TextEditor.tsx    # Markdown editor (TEXT types)
        │   ├── FileUpload.tsx    # File picker + upload (FILE types)
        │   └── UrlInput.tsx      # URL input + preview (URL types)
        └── views/
            ├── TextViewer.tsx    # Rendered Markdown (TEXT types)
            ├── FileViewer.tsx    # File preview / download link (FILE types)
            └── UrlViewer.tsx     # Link card with open/copy (URL types)
```

---

## Routing: `/items/[type]`

One dynamic route handles all 7 types.

**URL → type slug mapping:**

| URL | Type name in DB |
|---|---|
| `/items/snippets` | `snippet` |
| `/items/prompts` | `prompt` |
| `/items/commands` | `command` |
| `/items/notes` | `note` |
| `/items/files` | `file` |
| `/items/images` | `image` |
| `/items/links` | `link` |

The slug is the plural form of the type name. The page derives the DB type name by stripping the trailing `s`.

**`src/app/items/[type]/page.tsx`** (server component):
1. Validates `params.type` against the known slug list — 404 if unrecognized
2. Resolves the type name (`snippets` → `snippet`)
3. Calls `getItemsByType(userId, typeName)` from `lib/db/items.ts`
4. Renders the items list + `ItemDrawer` (closed by default)

No API route is needed for page loads — server components query the DB directly via Prisma.

---

## Mutations: `src/actions/items.ts`

One file handles all creates, updates, and deletes. Type-specific branching is minimal and handled via the `ContentType` enum.

```ts
// Zod schemas capture what each ContentType needs
createItem(input: CreateItemInput): Promise<ActionResult<Item>>
updateItem(id: string, input: UpdateItemInput): Promise<ActionResult<Item>>
deleteItem(id: string): Promise<ActionResult<void>>
toggleFavorite(id: string): Promise<ActionResult<Item>>
togglePinned(id: string): Promise<ActionResult<Item>>
```

**`createItem` branching logic:**

```
if contentType === TEXT  → set content, language; null fileUrl, fileName, fileSize, url
if contentType === FILE  → set fileUrl, fileName, fileSize; null content, url
if contentType === URL   → set url; null content, fileUrl, fileName, fileSize
```

All three paths write to the same `Item` model — no separate tables per type. The action receives a `contentType` discriminant and routes field assignment accordingly.

**Validation (Zod):**
- TEXT: `title` required, `content` required, `language` optional
- FILE: `title` required, `fileUrl` + `fileName` + `fileSize` required
- URL: `title` required, `url` required (valid URL format)
- All: `itemTypeId` required, `description` / `isFavorite` / `isPinned` optional

**Auth:** Each action reads the session server-side and scopes all queries to `userId`. No item ID is trusted without confirming ownership.

---

## Queries: `src/lib/db/items.ts`

Pure Prisma query functions — no auth logic, no response formatting. Called directly from server components.

```ts
getItemsByType(userId: string, typeName: string): Promise<Item[]>
getItemById(userId: string, id: string): Promise<Item | null>
getPinnedItems(userId: string): Promise<Item[]>
getRecentItems(userId: string, limit?: number): Promise<Item[]>
getFavoriteItems(userId: string): Promise<Item[]>
getItemCountByType(userId: string): Promise<Record<string, number>>
```

All queries:
- Always filter by `userId` as the first condition
- Include `itemType` relation (for color/icon in UI)
- Include `_count` for tags/collections where needed
- Use the existing DB indexes: `[userId, itemTypeId]`, `[userId, isFavorite]`, `[userId, isPinned]`

---

## Component Responsibilities

### `ItemCard`

- Renders a single item in the list view
- Reads `item.itemType.color` for the left border accent
- Reads `item.itemType.icon` to render the correct Lucide icon
- Preview content varies by `contentType`:
  - `TEXT` → truncated `content` text
  - `FILE` → `fileName` + formatted `fileSize`
  - `URL` → `url` hostname
- Clicking opens `ItemDrawer`

### `ItemDrawer`

- Slide-out panel (shadcn/ui `Sheet`)
- Header: title, type badge (colored), favorite/pin toggles, edit/delete actions
- Body switches on `item.contentType`:
  - `TEXT` → `TextViewer` (rendered Markdown)
  - `FILE` → `FileViewer` (preview or download)
  - `URL` → `UrlViewer` (open link card)
- Edit mode replaces viewer with `ItemForm`

### `ItemForm`

- Used for both create and edit
- Receives optional `item` prop (edit mode) or `defaultType` (create mode)
- Always shows: `title`, `description`, type selector, tag input
- Conditionally shows based on resolved `contentType`:
  - `TEXT` → `TextEditor` + `language` selector
  - `FILE` → `FileUpload`
  - `URL` → `UrlInput`
- On submit: calls `createItem` or `updateItem` server action
- `language` field is shown only when the selected type is `snippet` or `command`

### Type-specific editors/viewers

These components are dumb — they receive values and callbacks, know nothing about item types.

| Component | Input props | Output |
|---|---|---|
| `TextEditor` | `value`, `onChange` | Markdown string |
| `FileUpload` | `onUpload` | `{ fileUrl, fileName, fileSize }` |
| `UrlInput` | `value`, `onChange` | URL string |
| `TextViewer` | `content` | Rendered Markdown |
| `FileViewer` | `fileUrl`, `fileName`, `fileSize` | Preview or download |
| `UrlViewer` | `url`, `title` | Link card |

---

## Where Type-Specific Logic Lives

| Concern | Location |
|---|---|
| Color, icon, name | `ItemType` DB record (seeded) |
| Which fields to show in form | `ItemForm` — switches on `contentType` |
| How to display content | `ItemDrawer` / viewer components — switches on `contentType` |
| Which DB fields to populate | `actions/items.ts` — switches on `contentType` |
| Route → type name resolution | `app/items/[type]/page.tsx` |
| Query filtering by type | `lib/db/items.ts` |

**Actions are type-agnostic at the interface level.** They accept a `contentType` field and branch internally. They do not import type-specific components or rendering logic.

**Components are type-aware only via `contentType`.** They never check type names (e.g. `if type === "snippet"`) — they check the enum value (`if contentType === "TEXT"`). This keeps the system open to custom types without touching component code.

---

## Data Flow Summary

```
User clicks "New Snippet"
  → ItemForm renders with type=snippet (contentType=TEXT)
  → Shows TextEditor + language selector
  → User fills form, submits
  → createItem() server action called
  → Validates input, sets content/language, nulls file/url fields
  → Writes to Item table
  → Revalidates /items/snippets path
  → ItemCard appears in list

User clicks item card
  → ItemDrawer opens with item data
  → Reads item.contentType === TEXT
  → Renders TextViewer with item.content
  → User clicks Edit
  → ItemForm renders in edit mode with existing values
  → User saves → updateItem() called → drawer refreshes
```
