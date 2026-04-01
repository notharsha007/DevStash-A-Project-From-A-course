"use client";

import { useRef } from "react";
import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useEditorPreferences } from "@/components/settings/EditorPreferencesContext";

interface CodeEditorProps {
  value: string;
  language?: string | null;
  readonly?: boolean;
  onChange?: (value: string) => void;
}

export function CodeEditor({ value, language, readonly = false, onChange }: CodeEditorProps) {
  const monacoLanguage = normalizeLanguage(language);
  const { preferences } = useEditorPreferences();

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => toast.success("Copied to clipboard"));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* macOS-style header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-3 py-2">
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Language label */}
        {monacoLanguage && (
          <span className="text-xs font-medium text-white/40">{monacoLanguage}</span>
        )}

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

      {/* Monaco Editor */}
      <Editor
        value={value}
        language={monacoLanguage ?? "plaintext"}
        theme={preferences.theme}
        options={{
          readOnly: readonly,
          minimap: { enabled: preferences.minimap },
          scrollBeyondLastLine: false,
          fontSize: preferences.fontSize,
          tabSize: preferences.tabSize,
          lineHeight: 20,
          padding: { top: 12, bottom: 12 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: readonly ? "none" : "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          wordWrap: preferences.wordWrap,
          automaticLayout: true,
          contextmenu: false,
          folding: false,
          lineDecorationsWidth: 4,
          lineNumbersMinChars: 3,
        }}
        onMount={(editor, monaco) => {
          // Fit height to content, capped at 400px
          const updateHeight = () => {
            const contentHeight = Math.min(editor.getContentHeight(), 400);
            const domNode = editor.getDomNode()?.parentElement;
            if (domNode) {
              domNode.style.height = `${contentHeight}px`;
            }
            editor.layout();
          };
          updateHeight();
          editor.onDidContentSizeChange(updateHeight);
        }}
        onChange={(val) => onChange?.(val ?? "")}
        className="min-h-[80px]"
      />
    </div>
  );
}

/** Map common language strings to Monaco language IDs */
function normalizeLanguage(lang: string | null | undefined): string | null {
  if (!lang) return null;
  const normalized = lang.toLowerCase().trim();

  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    yml: "yaml",
    md: "markdown",
    tf: "hcl",
    dockerfile: "dockerfile",
  };

  return aliases[normalized] ?? normalized;
}
