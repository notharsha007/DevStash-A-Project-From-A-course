"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as dbCreateItem,
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  toggleItemFavorite as dbToggleItemFavorite,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";

const ALL_TYPE_NAMES = ["snippet", "prompt", "command", "note", "link", "file", "image"] as const;

const CreateItemSchema = z.object({
  typeName: z.enum(ALL_TYPE_NAMES),
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
  fileUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string()).optional().default([]),
});

export type CreateItemInput = z.input<typeof CreateItemSchema>;

type CreateResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string | z.ZodFormattedError<CreateItemInput> };

export async function createItem(input: CreateItemInput): Promise<CreateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = CreateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.format() };
  }

  const { typeName } = parsed.data;
  if (
    (typeName === "file" || typeName === "image") &&
    !parsed.data.fileUrl
  ) {
    return { success: false, error: "A file must be uploaded for this type" };
  }

  const item = await dbCreateItem(session.user.id, parsed.data);
  if (!item) {
    return { success: false, error: "Failed to create item" };
  }

  return { success: true, data: item };
}

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
  collectionIds: z.array(z.string()).optional().default([]),
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

type DeleteResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await dbDeleteItem(session.user.id, itemId);
  if (!result.ok) {
    return { success: false, error: "Item not found" };
  }

  if (result.fileUrl) {
    try {
      await deleteFromR2(result.fileUrl);
    } catch {
      // R2 deletion failure is non-fatal — item is already removed from DB
    }
  }

  return { success: true };
}

type ToggleFavoriteResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function toggleItemFavorite(
  itemId: string
): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const item = await dbToggleItemFavorite(session.user.id, itemId);
  if (!item) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, data: item };
}
