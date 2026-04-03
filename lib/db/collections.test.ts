import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { toggleCollectionFavorite } from "./collections";

describe("toggleCollectionFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when collection is not found", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(null);

    const result = await toggleCollectionFavorite("user-1", "col-1");

    expect(result).toBeNull();
    expect(prisma.collection.update).not.toHaveBeenCalled();
  });

  it("enforces ownership in the lookup query", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(null);

    await toggleCollectionFavorite("user-42", "col-9");

    expect(prisma.collection.findFirst).toHaveBeenCalledWith({
      where: { id: "col-9", userId: "user-42" },
      select: { id: true, isFavorite: true },
    });
  });

  it("toggles favorite state when the collection exists", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue({
      id: "col-1",
      isFavorite: true,
    } as any);
    vi.mocked(prisma.collection.update).mockResolvedValue({
      id: "col-1",
      isFavorite: false,
    } as any);

    const result = await toggleCollectionFavorite("user-1", "col-1");

    expect(prisma.collection.update).toHaveBeenCalledWith({
      where: { id: "col-1" },
      data: { isFavorite: false },
      select: { id: true, isFavorite: true },
    });
    expect(result).toEqual({ id: "col-1", isFavorite: false });
  });
});
