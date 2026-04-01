"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { iconMap } from "@/lib/icon-map";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import type { SearchItem } from "@/lib/db/items";
import type { SearchCollection } from "@/lib/db/collections";

interface CommandPaletteProps {
  items: SearchItem[];
  collections: SearchCollection[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({
  items,
  collections,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { openItem } = useItemDrawer();
  const [query, setQuery] = useState("");

  // Reset query when palette closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function handleSelectItem(id: string) {
    onOpenChange(false);
    openItem(id);
  }

  function handleSelectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  // Simple fuzzy: check if all chars of query appear in order within the string
  function fuzzyMatch(text: string, q: string): boolean {
    if (!q) return true;
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    let qi = 0;
    for (let i = 0; i < lower.length && qi < qLower.length; i++) {
      if (lower[i] === qLower[qi]) qi++;
    }
    return qi === qLower.length;
  }

  const filteredItems = items.filter(
    (item) =>
      fuzzyMatch(item.title, query) ||
      (item.contentPreview ? fuzzyMatch(item.contentPreview, query) : false) ||
      fuzzyMatch(item.typeName, query)
  );

  const filteredCollections = collections.filter((col) =>
    fuzzyMatch(col.name, query)
  );

  const hasResults = filteredItems.length > 0 || filteredCollections.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search DevStash"
      description="Fuzzy search across your items and collections"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search items and collections..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!hasResults && <CommandEmpty>No results found.</CommandEmpty>}

          {filteredItems.length > 0 && (
            <CommandGroup heading="Items">
              {filteredItems.slice(0, 8).map((item) => {
                const Icon = iconMap[item.typeIcon] ?? iconMap.Code;
                return (
                  <CommandItem
                    key={item.id}
                    value={`item-${item.id}-${item.title}`}
                    onSelect={() => handleSelectItem(item.id)}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: item.typeColor }}
                    />
                    <div className="flex flex-1 min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.title}
                      </span>
                      {item.contentPreview && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.contentPreview}
                        </span>
                      )}
                    </div>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground capitalize">
                      {item.typeName}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {filteredItems.length > 0 && filteredCollections.length > 0 && (
            <CommandSeparator />
          )}

          {filteredCollections.length > 0 && (
            <CommandGroup heading="Collections">
              {filteredCollections.slice(0, 5).map((col) => (
                <CommandItem
                  key={col.id}
                  value={`collection-${col.id}-${col.name}`}
                  onSelect={() => handleSelectCollection(col.id)}
                >
                  <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm font-medium">{col.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
