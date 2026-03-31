"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.input<typeof UpdateItemSchema>;

type ActionResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string | z.ZodFormattedError<UpdateItemInput> };

export async function updateItem(
  itemId: string,
  input: UpdateItemInput
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = UpdateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  const item = await dbUpdateItem(session.user.id, itemId, parsed.data);
  if (!item) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, data: item };
}
