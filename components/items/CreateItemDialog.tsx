"use client";

import { useState } from "react";
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
import { CodeEditor } from "@/components/items/CodeEditor";
import type { CreateItemInput } from "@/actions/items";

type FreeTypeName = "snippet" | "prompt" | "command" | "note" | "link";

const TYPES: { name: FreeTypeName; label: string; color: string }[] = [
  { name: "snippet", label: "Snippet", color: "#3b82f6" },
  { name: "prompt", label: "Prompt", color: "#8b5cf6" },
  { name: "command", label: "Command", color: "#f97316" },
  { name: "note", label: "Note", color: "#fde047" },
  { name: "link", label: "Link", color: "#10b981" },
];

const TEXT_CONTENT_TYPES: FreeTypeName[] = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES: FreeTypeName[] = ["snippet", "command"];

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: FreeTypeName;
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
  const [selectedType, setSelectedType] = useState<FreeTypeName>(initialType ?? "snippet");
  const [fields, setFields] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const showContent = TEXT_CONTENT_TYPES.includes(selectedType);
  const showLanguage = LANGUAGE_TYPES.includes(selectedType);
  const showUrl = selectedType === "link";

  function set(key: keyof FormState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: FreeTypeName) {
    setSelectedType(type);
    setFields((prev) => ({ ...prev, content: "", url: "", language: "" }));
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedType(initialType ?? "snippet");
      setFields(EMPTY_FORM);
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
      tags: fields.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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

  const isValid = fields.title.trim() !== "" && (!showUrl || fields.url.trim() !== "");

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
