import { Pin, Star } from "lucide-react";
import { iconMap } from "@/lib/icon-map";

interface ItemRowProps {
  title: string;
  description: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  typeIcon: string;
  typeColor: string;
  updatedAt: Date;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

export function ItemRow({
  title,
  description,
  isPinned,
  isFavorite,
  typeIcon,
  typeColor,
  updatedAt,
}: ItemRowProps) {
  const Icon = iconMap[typeIcon] ?? iconMap.Code;

  return (
    <div
      className="flex items-center gap-4 rounded-xl border-l-[3px] bg-card px-4 py-4 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20"
      style={{ borderLeftColor: typeColor }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${typeColor}20` }}
      >
        <Icon className="size-5" style={{ color: typeColor }} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          {isPinned && <Pin className="size-3.5 text-muted-foreground" />}
          {isFavorite && (
            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        {description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <span className="shrink-0 text-sm text-muted-foreground">
        {formatDate(updatedAt)}
      </span>
    </div>
  );
}
