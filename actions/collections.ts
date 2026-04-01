"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";

const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().nullable().optional(),
});

export type CreateCollectionInput = z.input<typeof CreateCollectionSchema>;

type CreateCollectionResult =
  | { success: true; data: { id: string; name: string } }
  | { success: false; error: string };

export async function createCollection(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = CreateCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  const collection = await dbCreateCollection(session.user.id, parsed.data);
  return { success: true, data: collection };
}
