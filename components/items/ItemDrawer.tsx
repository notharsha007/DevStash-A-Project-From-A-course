"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Pin, Copy, Pencil, Trash2, FolderOpen, Clock } from "lucide-react";

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

function DrawerContent({ item }: { item: ItemDetailResponse }) {
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
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-destructive hover:text-destructive"
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

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId || !open) return;
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[580px] flex-col p-0 sm:max-w-[580px]"
      >
        {loading || !item ? <DrawerSkeleton /> : <DrawerContent item={item} />}
      </SheetContent>
    </Sheet>
  );
}
