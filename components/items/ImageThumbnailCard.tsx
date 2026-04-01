"use client";

import { ImageIcon } from "lucide-react";

function r2KeyFromUrl(fileUrl: string): string | null {
  try {
    return new URL(fileUrl).pathname.slice(1);
  } catch {
    return null;
  }
}

interface ImageThumbnailCardProps {
  title: string;
  fileUrl: string | null;
}

export function ImageThumbnailCard({ title, fileUrl }: ImageThumbnailCardProps) {
  const r2Key = fileUrl ? r2KeyFromUrl(fileUrl) : null;
  const src = r2Key ? `/api/download/${r2Key}` : null;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium">{title}</p>
      </div>
    </div>
  );
}
