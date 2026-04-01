"use client";

import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { FileListRow } from "@/components/items/FileListRow";

// updatedAt is serialized to string when passed from server → client component
export interface ClientItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  typeIcon: string;
  typeColor: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  updatedAt: string;
}

interface ItemsClientWrapperProps {
  items: ClientItem[];
  containerClassName?: string;
  variant?: "default" | "gallery" | "file-list";
}

export function ItemsClientWrapper({
  items,
  containerClassName = "space-y-2",
  variant = "default",
}: ItemsClientWrapperProps) {
  const { openItem } = useItemDrawer();

  return (
    <div className={containerClassName}>
      {items.map((item) =>
        variant === "gallery" ? (
          <div key={item.id} onClick={() => openItem(item.id)}>
            <ImageThumbnailCard title={item.title} fileUrl={item.fileUrl} />
          </div>
        ) : variant === "file-list" ? (
          <FileListRow
            key={item.id}
            title={item.title}
            fileName={item.fileName}
            fileSize={item.fileSize}
            fileUrl={item.fileUrl}
            updatedAt={new Date(item.updatedAt)}
            onClick={() => openItem(item.id)}
          />
        ) : (
          <div
            key={item.id}
            onClick={() => openItem(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openItem(item.id)}
            className="w-full cursor-pointer"
          >
            <ItemRow
              title={item.title}
              description={item.description}
              content={item.content}
              url={item.url}
              tags={item.tags}
              isPinned={item.isPinned}
              isFavorite={item.isFavorite}
              typeIcon={item.typeIcon}
              typeColor={item.typeColor}
              updatedAt={new Date(item.updatedAt)}
            />
          </div>
        )
      )}
    </div>
  );
}
