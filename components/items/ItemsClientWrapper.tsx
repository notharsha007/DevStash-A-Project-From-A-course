"use client";

import { useState } from "react";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";

// updatedAt is serialized to string when passed from server → client component
export interface ClientItem {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  typeIcon: string;
  typeColor: string;
  fileUrl: string | null;
  updatedAt: string;
}

interface ItemsClientWrapperProps {
  items: ClientItem[];
  containerClassName?: string;
  variant?: "default" | "gallery";
}

export function ItemsClientWrapper({
  items,
  containerClassName = "space-y-2",
  variant = "default",
}: ItemsClientWrapperProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleItemClick(id: string) {
    setSelectedItemId(id);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className={containerClassName}>
        {items.map((item) =>
          variant === "gallery" ? (
            <div key={item.id} onClick={() => handleItemClick(item.id)}>
              <ImageThumbnailCard title={item.title} fileUrl={item.fileUrl} />
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="w-full text-left"
            >
              <ItemRow
                title={item.title}
                description={item.description}
                tags={item.tags}
                isPinned={item.isPinned}
                isFavorite={item.isFavorite}
                typeIcon={item.typeIcon}
                typeColor={item.typeColor}
                updatedAt={new Date(item.updatedAt)}
              />
            </button>
          )
        )}
      </div>

      <ItemDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
