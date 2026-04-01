"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Pin, Copy, Pencil, Trash2, FolderOpen, Clock, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateItem, deleteItem } from "@/actions/items";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ItemDetailResponse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  language: string | null;
  url: string | null;
  fileName: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  itemType: { id: string; name: string; icon: string; color: string };
  tags: string[];
  collections: { id: string; name: string }[];
}

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEXT_CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const MARKDOWN_TYPES = ["note", "prompt"];
const URL_TYPES = ["link"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-14" />
      </div>
      <Skeleton className="mt-4 h-4 w-1/4" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="mt-2 h-4 w-1/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="mt-2 h-4 w-1/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

// ─── View Mode ───────────────────────────────────────────────────────────────

function ViewContent({
  item,
  onEdit,
  onDeleteRequest,
}: {
  item: ItemDetailResponse;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  return (
    <>
      {/* Header */}
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg leading-tight">{item.title}</SheetTitle>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${item.itemType.color}22`,
                  color: item.itemType.color,
                  border: `1px solid ${item.itemType.color}40`,
                }}
              >
                {item.itemType.name}
              </Badge>
              {item.language && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {item.language}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Action Bar */}
      <div className="flex items-center gap-1 border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-sm ${item.isFavorite ? "text-yellow-500" : ""}`}
        >
          <Star
            className={`size-4 ${item.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
          />
          Favorite
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <Pin className="size-4" />
          Pin
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <Copy className="size-4" />
          Copy
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-destructive hover:text-destructive"
          onClick={onDeleteRequest}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Description */}
        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </h3>
          {item.description ? (
            <p className="text-sm leading-relaxed">{item.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/50">No description</p>
          )}
        </section>

        {/* Content */}
        {item.content && (
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </h3>
            {LANGUAGE_TYPES.includes(item.itemType.name.toLowerCase()) ? (
              <CodeEditor value={item.content} language={item.language} readonly />
            ) : MARKDOWN_TYPES.includes(item.itemType.name.toLowerCase()) ? (
              <MarkdownEditor value={item.content} readonly />
            ) : (
              <pre className="overflow-x-auto rounded-lg bg-muted text-sm leading-relaxed">
                <code>
                  {item.content.split("\n").map((line, i) => (
                    <div key={i} className="flex px-2 py-[1px] hover:bg-foreground/5">
                      <span className="w-8 shrink-0 select-none pr-3 text-right text-muted-foreground/40">
                        {i + 1}
                      </span>
                      <span className="flex-1 whitespace-pre">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            )}
          </section>
        )}

        {/* URL */}
        {item.url && (
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              URL
            </h3>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-blue-500 hover:underline"
            >
              {item.url}
            </a>
          </section>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Collections */}
        {item.collections.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FolderOpen className="size-3.5" />
              Collections
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map((col) => (
                <Badge
                  key={col.id}
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {col.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Details */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" />
            Details
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Edit Mode ───────────────────────────────────────────────────────────────

interface EditState {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
}

function EditContent({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetailResponse;
  onCancel: () => void;
  onSaved: (updated: ItemDetailResponse) => void;
}) {
  const typeName = item.itemType.name.toLowerCase();
  const showContent = TEXT_CONTENT_TYPES.includes(typeName);
  const showLanguage = LANGUAGE_TYPES.includes(typeName);
  const showMarkdown = MARKDOWN_TYPES.includes(typeName);
  const showUrl = URL_TYPES.includes(typeName);

  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<EditState>({
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.join(", "),
  });

  function set(key: keyof EditState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateItem(item.id, {
      title: fields.title,
      description: fields.description || null,
      content: fields.content || null,
      url: fields.url || null,
      language: fields.language || null,
      tags: fields.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setSaving(false);

    if (!result.success) {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Validation error — check your inputs";
      toast.error(msg);
      return;
    }

    const updated: ItemDetailResponse = {
      ...result.data,
      createdAt:
        result.data.createdAt instanceof Date
          ? result.data.createdAt.toISOString()
          : String(result.data.createdAt),
      updatedAt:
        result.data.updatedAt instanceof Date
          ? result.data.updatedAt.toISOString()
          : String(result.data.updatedAt),
    };

    toast.success("Item saved");
    onSaved(updated);
  }

  return (
    <>
      {/* Header */}
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg leading-tight">Edit Item</SheetTitle>
            <div className="mt-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${item.itemType.color}22`,
                  color: item.itemType.color,
                  border: `1px solid ${item.itemType.color}40`,
                }}
              >
                {item.itemType.name}
              </Badge>
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* Save / Cancel bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button
          size="sm"
          className="gap-1.5"
          onClick={handleSave}
          disabled={saving || fields.title.trim() === ""}
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onCancel}>
          <X className="size-4" />
          Cancel
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label
            htmlFor="edit-title"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-title"
            value={fields.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Item title"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label
            htmlFor="edit-description"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Description
          </Label>
          <Textarea
            id="edit-description"
            value={fields.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        {/* Content (text types only) */}
        {showContent && (
          <div className="space-y-1.5">
            <Label
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Content
            </Label>
            {showLanguage ? (
              <CodeEditor
                value={fields.content}
                language={fields.language}
                onChange={(val) => set("content", val)}
              />
            ) : showMarkdown ? (
              <MarkdownEditor
                value={fields.content}
                onChange={(val) => set("content", val)}
              />
            ) : (
              <Textarea
                id="edit-content"
                value={fields.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Item content"
                rows={10}
                className="resize-y font-mono"
              />
            )}
          </div>
        )}

        {/* Language (snippet, command only) */}
        {showLanguage && (
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-language"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Language
            </Label>
            <Input
              id="edit-language"
              value={fields.language}
              onChange={(e) => set("language", e.target.value)}
              placeholder="e.g. typescript"
            />
          </div>
        )}

        {/* URL (link only) */}
        {showUrl && (
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-url"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              URL
            </Label>
            <Input
              id="edit-url"
              type="url"
              value={fields.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-1.5">
          <Label
            htmlFor="edit-tags"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Tags
          </Label>
          <Input
            id="edit-tags"
            value={fields.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="react, hooks, typescript"
          />
          <p className="text-xs text-muted-foreground">Comma-separated</p>
        </div>

        {/* Non-editable: Collections */}
        {item.collections.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map((col) => (
                <Badge
                  key={col.id}
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium opacity-60"
                >
                  {col.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Non-editable: Dates */}
        <div className="space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Created</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Updated</span>
            <span>{formatDate(item.updatedAt)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!itemId || !open) return;
    setLoading(true);
    setItem(null);
    setIsEditing(false);
    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  function handleOpenChange(value: boolean) {
    if (!value) setIsEditing(false);
    onOpenChange(value);
  }

  function handleSaved(updated: ItemDetailResponse) {
    setItem(updated);
    setIsEditing(false);
    router.refresh();
  }

  async function handleDeleteConfirm() {
    if (!itemId) return;
    setDeleting(true);
    const result = await deleteItem(itemId);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete item");
      return;
    }
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    toast.success("Item deleted");
    router.refresh();
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[580px] flex-col p-0 sm:max-w-[580px]"
        >
          {loading || !item ? (
            <DrawerSkeleton />
          ) : isEditing ? (
            <EditContent
              item={item}
              onCancel={() => setIsEditing(false)}
              onSaved={handleSaved}
            />
          ) : (
            <ViewContent
              item={item}
              onEdit={() => setIsEditing(true)}
              onDeleteRequest={() => setDeleteConfirmOpen(true)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{item?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
