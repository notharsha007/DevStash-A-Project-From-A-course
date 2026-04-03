import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevStashLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  compact?: boolean;
}

export function DevStashLogo({
  className,
  iconClassName,
  textClassName,
  compact = false,
}: DevStashLogoProps) {
  return (
    <span className={cn("flex items-center gap-3 font-semibold tracking-tight", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25",
          iconClassName
        )}
      >
        <FolderKanban className="size-4.5" />
      </span>
      {!compact && <span className={cn("text-lg", textClassName)}>DevStash</span>}
    </span>
  );
}
