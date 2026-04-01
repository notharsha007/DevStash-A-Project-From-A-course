"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IMAGE_EXTENSIONS,
  FILE_EXTENSIONS,
  IMAGE_MAX_BYTES,
  FILE_MAX_BYTES,
} from "@/lib/upload-validation";

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  itemType: "file" | "image";
  onUpload: (result: UploadResult | null) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ itemType, onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);

  const extensions = itemType === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const maxBytes = itemType === "image" ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
  const accept = extensions.join(",");

  function reset() {
    setUploaded(null);
    setProgress(null);
    setError(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const uploadFile = useCallback(
    (file: File) => {
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemType", itemType);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result: UploadResult = JSON.parse(xhr.responseText);
            setUploaded(result);
            setProgress(null);
            onUpload(result);
          } catch {
            setError("Upload failed — invalid server response");
            setProgress(null);
          }
        } else {
          let message = "Upload failed";
          try {
            const body = JSON.parse(xhr.responseText);
            message = body.error ?? message;
          } catch {
            // non-JSON error body — use status text
            if (xhr.statusText) message = xhr.statusText;
          }
          setError(message);
          setProgress(null);
        }
      };

      xhr.onerror = () => {
        setError("Network error — upload failed");
        setProgress(null);
      };

      xhr.send(formData);
    },
    [itemType, onUpload]
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        {itemType === "image" ? (
          <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
        ) : (
          <FileIcon className="size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{uploaded.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(uploaded.fileSize)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={reset}
          type="button"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-colors cursor-pointer
          ${dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/20"
          }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <Upload className="size-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drop {itemType === "image" ? "an image" : "a file"} or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {extensions.join(", ")} · max {formatBytes(maxBytes)}
          </p>
        </div>
        {progress !== null && (
          <div className="w-full max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
