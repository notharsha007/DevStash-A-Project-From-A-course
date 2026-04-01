"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { updateEditorPreferences } from "@/app/actions/settings";
import { toast } from "sonner";

export interface EditorPreferences {
  theme: string;
  fontSize: number;
  tabSize: number;
  wordWrap: "on" | "off" | "wordWrapColumn" | "bounded";
  minimap: boolean;
}

interface EditorPreferencesContextType {
  preferences: EditorPreferences;
  setPreference: <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextType | null>(null);

export function EditorPreferencesProvider({ 
  children, 
  initialPreferences 
}: { 
  children: React.ReactNode; 
  initialPreferences: EditorPreferences; 
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initialPreferences);
  const [, startTransition] = useTransition();

  const setPreference = <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
    // Optimistic UI update
    setPreferences((prev) => ({ ...prev, [key]: value }));

    startTransition(async () => {
      try {
        await updateEditorPreferences({ [key]: value });
        toast.success("Setting saved automatically");
      } catch {
        toast.error("Failed to save setting automatically");
      }
    });
  };

  return (
    <EditorPreferencesContext.Provider value={{ preferences, setPreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error("useEditorPreferences must be used within EditorPreferencesProvider");
  }
  return context;
}
