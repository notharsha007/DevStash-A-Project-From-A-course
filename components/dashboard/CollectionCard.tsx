"use client";

import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  LinkIcon,
  Star,
  MoreHorizontal,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

interface CollectionCardProps {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor: string;
  itemTypeIcons: string[];
}

export function CollectionCard({
  id,
  name,
  description,
  isFavorite,
  itemCount,
  dominantTypeColor,
  itemTypeIcons,
}: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${id}`}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: dominantTypeColor,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{name}</h3>
          {isFavorite && (
            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <button
          className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">{itemCount} items</p>

      {description && (
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground/80">
          {description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        {itemTypeIcons.map((iconName, i) => {
          const Icon = iconMap[iconName] ?? Code;
          return <Icon key={i} className="size-3.5 text-muted-foreground" />;
        })}
      </div>
    </Link>
  );
}
