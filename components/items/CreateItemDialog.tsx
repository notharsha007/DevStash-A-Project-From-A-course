"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItem } from "@/actions/items";
import { getUserCollections } from "@/actions/collections";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { FileUpload } from "@/components/items/FileUpload";
import { CollectionsSelect } from "@/components/items/CollectionsSelect";
import type { CreateItemInput } from "@/actions/items";
import type { UploadResult } from "@/components/items/FileUpload";

type AllTypeName = "snippet" | "prompt" | "command" | "note" | "link" | "file" | "image";

const TYPES: { name: AllTypeName; label: string; color: string }[] = [
  { name: "snippet", label: "Snippet", color: "#3b82f6" },
  { name: "prompt", label: "Prompt", color: "#8b5cf6" },
  { name: "command", label: "Command", color: "#f97316" },
  { name: "note", label: "Note", color: "#fde047" },
  { name: "link", label: "Link", color: "#10b981" },
  { name: "file", label: "File", color: "#6b7280" },
  { name: "image", label: "Image", color: "#ec4899" },
];

const TEXT_CONTENT_TYPES: AllTypeName[] = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES: AllTypeName[] = ["snippet", "command"];
const MARKDOWN_TYPES: AllTypeName[] = ["note", "prompt"];
const FILE_TYPES: AllTypeName[] = ["file", "image"];

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: AllTypeName;
}

interface FormState {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  content: "",
  url: "",
  language: "",
  tags: "",
};

export function CreateItemDialog({ open, onOpenChange, initialType }: CreateItemDialogProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AllTypeName>(initialType ?? "snippet");
  const [fields, setFields] = useState<FormState>(EMPTY_FORM);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setCollectionsLoading(true);
    getUserCollections().then((result) => {
      if (result.success) setCollections(result.data);
      setCollectionsLoading(false);
    });
  }, [open]);

  const showContent = TEXT_CONTENT_TYPES.includes(selectedType);
  const showLanguage = LANGUAGE_TYPES.includes(selectedType);
  const showMarkdown = MARKDOWN_TYPES.includes(selectedType);
  const showUrl = selectedType === "link";
  const showFile = FILE_TYPES.includes(selectedType);

  function set(key: keyof FormState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: AllTypeName) {
    setSelectedType(type);
    setFields((prev) => ({ ...prev, content: "", url: "", language: "" }));
    setUploadResult(null);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedType(initialType ?? "snippet");
      setFields(EMPTY_FORM);
      setUploadResult(null);
      setSelectedCollectionIds([]);
    }
    onOpenChange(value);
  }

  async function handleCreate() {
    setSaving(true);

    const input: CreateItemInput = {
      typeName: selectedType,
      title: fields.title,
      description: fields.description || null,
      content: showContent ? fields.content || null : null,
      url: showUrl ? fields.url || null : null,
      language: showLanguage ? fields.language || null : null,
      fileUrl: showFile ? (uploadResult?.fileUrl ?? null) : null,
      fileName: showFile ? (uploadResult?.fileName ?? null) : null,
      fileSize: showFile ? (uploadResult?.fileSize ?? null) : null,
      tags: fields.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      collectionIds: selectedCollectionIds,
    };

    const result = await createItem(input);
    setSaving(false);

    if (!result.success) {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Validation error — check your inputs";
      toast.error(msg);
      return;
    }

    toast.success("Item created");
    handleOpenChange(false);
    router.refresh();
  }

  const isValid =
    fields.title.trim() !== "" &&
    (!showUrl || fields.url.trim() !== "") &&
    (!showFile || uploadResult !== null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Type selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Type
            </Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const isSelected = selectedType === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleTypeChange(t.name)}
                    className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${t.color}22`,
                            color: t.color,
                            borderColor: `${t.color}80`,
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "var(--muted-foreground)",
                            borderColor: "var(--border)",
                          }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="create-title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-title"
              value={fields.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="create-description"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="create-description"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* File upload (file/image types) */}
          {showFile && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedType === "image" ? "Image" : "File"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <FileUpload
                itemType={selectedType as "file" | "image"}
                onUpload={setUploadResult}
              />
            </div>
          )}

          {/* Content (text types only) */}
          {showContent && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  id="create-content"
                  value={fields.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="Item content"
                  rows={6}
                  className="resize-y font-mono"
                />
              )}
            </div>
          )}

          {/* Language (snippet, command only) */}
          {showLanguage && (
            <div className="space-y-1.5">
              <Label
                htmlFor="create-language"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Language
              </Label>
              <Input
                id="create-language"
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
                htmlFor="create-url"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-url"
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
              htmlFor="create-tags"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Tags
            </Label>
            <Input
              id="create-tags"
              value={fields.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          {/* Collections */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections
            </Label>
            <CollectionsSelect
              collections={collections}
              selected={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
              loading={collectionsLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving || !isValid}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
