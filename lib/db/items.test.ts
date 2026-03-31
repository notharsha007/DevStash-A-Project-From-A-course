import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getItemDetail } from "./items";

const mockPrismaItem = {
  id: "item-1",
  title: "useAuth Hook",
  description: "Custom auth hook",
  content: "export function useAuth() {}",
  contentType: "TEXT" as const,
  language: "typescript",
  url: null,
  fileName: null,
  fileUrl: null,
  fileSize: null,
  isFavorite: true,
  isPinned: false,
  userId: "user-1",
  itemTypeId: "type-1",
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-01-15"),
  itemType: { id: "type-1", name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true, userId: null },
  tags: [
    { itemId: "item-1", tagId: "tag-1", tag: { id: "tag-1", name: "react" } },
    { itemId: "item-1", tagId: "tag-2", tag: { id: "tag-2", name: "hooks" } },
  ],
  collections: [
    {
      itemId: "item-1",
      collectionId: "col-1",
      addedAt: new Date("2026-01-15"),
      collection: {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        defaultTypeId: null,
        userId: "user-1",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-15"),
      },
    },
  ],
};

describe("getItemDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when item is not found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await getItemDetail("user-1", "nonexistent");

    expect(result).toBeNull();
  });

  it("enforces ownership by including userId in the query", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    await getItemDetail("user-123", "item-456");

    expect(prisma.item.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-456", userId: "user-123" },
      })
    );
  });

  it("flattens nested tags to an array of strings", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockPrismaItem);

    const result = await getItemDetail("user-1", "item-1");

    expect(result?.tags).toEqual(["react", "hooks"]);
  });

  it("maps collections to id/name pairs", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockPrismaItem);

    const result = await getItemDetail("user-1", "item-1");

    expect(result?.collections).toEqual([{ id: "col-1", name: "React Patterns" }]);
  });

  it("returns correct ItemDetail shape for a found item", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockPrismaItem);

    const result = await getItemDetail("user-1", "item-1");

    expect(result).toMatchObject({
      id: "item-1",
      title: "useAuth Hook",
      description: "Custom auth hook",
      content: "export function useAuth() {}",
      language: "typescript",
      isFavorite: true,
      isPinned: false,
      itemType: { id: "type-1", name: "Snippet", icon: "Code", color: "#3b82f6" },
    });
  });

  it("handles items with no tags or collections", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue({
      ...mockPrismaItem,
      tags: [],
      collections: [],
    });

    const result = await getItemDetail("user-1", "item-1");

    expect(result?.tags).toEqual([]);
    expect(result?.collections).toEqual([]);
  });
});
