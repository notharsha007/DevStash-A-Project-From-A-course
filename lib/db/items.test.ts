import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getItemDetail, updateItem, toggleItemFavorite } from "./items";

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
    } as any);

    const result = await getItemDetail("user-1", "item-1");

    expect(result?.tags).toEqual([]);
    expect(result?.collections).toEqual([]);
  });
});

describe("updateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when item is not found (ownership check fails)", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await updateItem("user-1", "nonexistent", {
      title: "Updated",
      tags: [],
    });

    expect(result).toBeNull();
    expect(prisma.item.update).not.toHaveBeenCalled();
  });

  it("enforces ownership by checking userId in findFirst before updating", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    await updateItem("user-123", "item-456", { title: "New title", tags: [] });

    expect(prisma.item.findFirst).toHaveBeenCalledWith({
      where: { id: "item-456", userId: "user-123" },
    });
  });

  it("calls prisma.item.update with tag disconnect-all and connect-or-create", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue({ id: "item-1" } as any);
    vi.mocked(prisma.item.update).mockResolvedValue({
      ...mockPrismaItem,
      title: "Updated Title",
      tags: [],
      collections: [],
    } as any);

    await updateItem("user-1", "item-1", {
      title: "Updated Title",
      tags: ["react", "hooks"],
    });

    expect(prisma.item.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({
          title: "Updated Title",
          tags: {
            deleteMany: {},
            create: [
              { tag: { connectOrCreate: { where: { name: "react" }, create: { name: "react" } } } },
              { tag: { connectOrCreate: { where: { name: "hooks" }, create: { name: "hooks" } } } },
            ],
          },
        }),
      })
    );
  });

  it("returns updated ItemDetail with flattened tags and collections", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue({ id: "item-1" } as any);
    vi.mocked(prisma.item.update).mockResolvedValue({
      ...mockPrismaItem,
      title: "New Title",
      description: "New desc",
      tags: [{ itemId: "item-1", tagId: "tag-3", tag: { id: "tag-3", name: "typescript" } }],
      collections: [],
    } as any);

    const result = await updateItem("user-1", "item-1", {
      title: "New Title",
      description: "New desc",
      tags: ["typescript"],
    });

    expect(result?.title).toBe("New Title");
    expect(result?.description).toBe("New desc");
    expect(result?.tags).toEqual(["typescript"]);
    expect(result?.collections).toEqual([]);
  });
});

describe("toggleItemFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when ownership check fails", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await toggleItemFavorite("user-1", "item-1");

    expect(result).toBeNull();
    expect(prisma.item.update).not.toHaveBeenCalled();
  });

  it("toggles isFavorite based on the existing item state", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue({
      id: "item-1",
      isFavorite: false,
    } as any);
    vi.mocked(prisma.item.update).mockResolvedValue({
      ...mockPrismaItem,
      isFavorite: true,
      tags: [],
      collections: [],
    } as any);

    await toggleItemFavorite("user-1", "item-1");

    expect(prisma.item.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: { isFavorite: true },
      })
    );
  });
});
