import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  LinkIcon,
  Pin,
  Star,
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
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

export function ItemRow({
  title,
  description,
  tags,
  isPinned,
  isFavorite,
  typeIcon,
  typeColor,
  updatedAt,
}: ItemRowProps) {
  const Icon = iconMap[typeIcon] ?? Code;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20">
      <Icon className="size-4 shrink-0" style={{ color: typeColor }} />

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          {isPinned && <Pin className="size-3 text-muted-foreground" />}
          {isFavorite && (
            <Star className="size-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        {description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">
        {formatDate(updatedAt)}
      </span>
    </div>
  );
}
