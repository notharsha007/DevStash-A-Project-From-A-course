"use client";

import { Download, File, FileText, FileImage, FileArchive, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileListRowProps {
  title: string;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  updatedAt: Date;
  onClick: () => void;
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(ext)) return FileImage;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive;
  if (["txt", "md", "pdf", "doc", "docx", "csv"].includes(ext)) return FileText;
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "json", "yaml", "toml"].includes(ext)) return FileCode;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FileListRow({ title, fileName, fileSize, fileUrl, updatedAt, onClick }: FileListRowProps) {
  const Icon = getFileIcon(fileName);
  const displayName = fileName ?? title;

  function r2KeyFromUrl(url: string): string | null {
    try {
      return new URL(url).pathname.slice(1);
    } catch {
      return null;
    }
  }

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!fileUrl) return;
    const key = r2KeyFromUrl(fileUrl);
    if (!key) return;
    const a = document.createElement("a");
    a.href = `/api/download/${key}`;
    a.download = displayName;
    a.click();
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
    >
      {/* File icon */}
      <div className="shrink-0 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>

      {/* Title + filename + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {fileName && fileName !== title && (
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        )}
        {/* Mobile: size + date stacked */}
        <div className="flex items-center gap-3 mt-0.5 sm:hidden">
          <span className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</span>
          <span className="text-xs text-muted-foreground">{relativeDate(updatedAt)}</span>
        </div>
      </div>

      {/* Size — hidden on mobile */}
      <span className="hidden sm:block shrink-0 text-xs text-muted-foreground w-20 text-right">
        {formatFileSize(fileSize)}
      </span>

      {/* Date — hidden on mobile */}
      <span className="hidden sm:block shrink-0 text-xs text-muted-foreground w-24 text-right">
        {relativeDate(updatedAt)}
      </span>

      {/* Download — always visible */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8"
        onClick={handleDownload}
        disabled={!fileUrl}
        title="Download"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
