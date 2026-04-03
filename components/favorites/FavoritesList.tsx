"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Folder, Star } from "lucide-react";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { iconMap } from "@/lib/icon-map";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

type SortOption = "date" | "name" | "type";

interface FavoritesListProps {
  items: Array<Omit<FavoriteItem, "updatedAt"> & { updatedAt: string }>;
  collections: Array<Omit<FavoriteCollection, "updatedAt"> & { updatedAt: string }>;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 pb-2">
      <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <span className="font-mono text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

function compareByName(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function FavoriteItemRow({
  item,
  onOpen,
}: {
  item: Omit<FavoriteItem, "updatedAt"> & { updatedAt: string };
  onOpen: (id: string) => void;
}) {
  const Icon = iconMap[item.typeIcon] ?? iconMap.Code;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="flex w-full items-center gap-3 border-b border-border/50 px-3 py-2 text-left transition-colors hover:bg-accent/35"
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${item.typeColor}18` }}
      >
        <Icon className="size-4" style={{ color: item.typeColor }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.title}</span>
          <Star className="size-3 fill-yellow-500 text-yellow-500" />
        </div>
        {item.description && (
          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>

      <Badge
        variant="secondary"
        className="hidden rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide sm:inline-flex"
        style={{
          backgroundColor: `${item.typeColor}18`,
          color: item.typeColor,
          border: `1px solid ${item.typeColor}36`,
        }}
      >
        {item.typeName}
      </Badge>

      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {formatRelativeDate(new Date(item.updatedAt))}
      </span>
    </button>
  );
}

function FavoriteCollectionRow({
  collection,
}: {
  collection: Omit<FavoriteCollection, "updatedAt"> & { updatedAt: string };
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex items-center gap-3 border-b border-border/50 px-3 py-2 transition-colors hover:bg-accent/35"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Folder className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{collection.name}</span>
          <Star className="size-3 fill-yellow-500 text-yellow-500" />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          {collection.description ? ` • ${collection.description}` : ""}
        </p>
      </div>

      <Badge
        variant="secondary"
        className="hidden rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide sm:inline-flex"
      >
        collection
      </Badge>

      <span className="shrink-0 font-mono text-xs text-muted-foreground">
        {formatRelativeDate(new Date(collection.updatedAt))}
      </span>
    </Link>
  );
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const { openItem } = useItemDrawer();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const isEmpty = items.length === 0 && collections.length === 0;

  const sortedItems = useMemo(() => {
    const copy = [...items];

    copy.sort((a, b) => {
      if (sortBy === "name") {
        return compareByName(a.title, b.title);
      }

      if (sortBy === "type") {
        const typeCompare = compareByName(a.typeName, b.typeName);
        return typeCompare !== 0 ? typeCompare : compareByName(a.title, b.title);
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return copy;
  }, [items, sortBy]);

  const sortedCollections = useMemo(() => {
    const copy = [...collections];

    copy.sort((a, b) => {
      if (sortBy === "name") {
        return compareByName(a.name, b.name);
      }

      if (sortBy === "type") {
        return compareByName(a.name, b.name);
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return copy;
  }, [collections, sortBy]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Star className="size-8 text-muted-foreground/60" />
        <p className="mt-4 text-lg font-medium">No favorites yet</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Star your most useful items and collections, and they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/40 px-3 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Sort
          </p>
          <p className="text-xs text-muted-foreground">
            Reorder favorites client-side without leaving the page.
          </p>
        </div>

        <Select
          items={[
            { value: "date", label: "Date" },
            { value: "name", label: "Name" },
            { value: "type", label: "Item Type" },
          ]}
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-36 font-mono" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="type">Item Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <section className="space-y-3">
        <SectionHeader title="Items" count={sortedItems.length} />
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
          {sortedItems.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              No favorite items yet.
            </div>
          ) : (
            sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} onOpen={openItem} />
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Collections" count={sortedCollections.length} />
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
          {sortedCollections.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              No favorite collections yet.
            </div>
          ) : (
            sortedCollections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
