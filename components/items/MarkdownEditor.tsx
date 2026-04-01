"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface MarkdownEditorProps {
  value: string;
  readonly?: boolean;
  onChange?: (value: string) => void;
}

export function MarkdownEditor({ value, readonly = false, onChange }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readonly ? "preview" : "write");

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => toast.success("Copied to clipboard"));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#2d2d2d] px-3 py-2">
        {/* macOS dots */}
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5">
          {!readonly && (
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                tab === "write"
                  ? "bg-white/10 text-white/80"
                  : "text-white/40 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              Write
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
              tab === "preview"
                ? "bg-white/10 text-white/80"
                : "text-white/40 hover:bg-white/5 hover:text-white/60"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <Copy className="size-3" />
          Copy
        </button>
      </div>

      {/* Body */}
      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown here…"
          className="w-full resize-none bg-transparent p-3 text-sm text-white/85 placeholder:text-white/25 focus:outline-none"
          style={{ minHeight: "240px", maxHeight: "400px" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
          }}
        />
      ) : (
        <div className="min-h-[80px] max-h-[400px] overflow-y-auto p-4">
          {value.trim() ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm italic text-white/25">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
