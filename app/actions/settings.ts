"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { EditorPreferences } from "@/components/settings/EditorPreferencesContext";

export async function updateEditorPreferences(preferences: Partial<EditorPreferences>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { editorPreferences: true },
  });

  const currentPreferences = (user?.editorPreferences as Record<string, unknown>) || {};
  const newPreferences = { ...currentPreferences, ...preferences };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      editorPreferences: newPreferences as any, 
    },
  });

  return newPreferences;
}
