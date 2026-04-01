import { prisma } from "@/lib/prisma";
import type { EditorPreferences } from "@/components/settings/EditorPreferencesContext";

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  theme: "vs-dark",
  fontSize: 13,
  tabSize: 2,
  wordWrap: "off",
  minimap: false,
};

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  if (!user?.editorPreferences) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const stored = user.editorPreferences as Partial<EditorPreferences>;
  
  return {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...stored,
  };
}
