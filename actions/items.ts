"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as dbCreateItem,
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const FREE_TYPE_NAMES = ["snippet", "prompt", "command", "note", "link"] as const;

const CreateItemSchema = z.object({
  typeName: z.enum(FREE_TYPE_NAMES),
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

  const deleted = await dbDeleteItem(session.user.id, itemId);
  if (!deleted) {
    return { success: false, error: "Item not found" };
  }

  return { success: true };
}
