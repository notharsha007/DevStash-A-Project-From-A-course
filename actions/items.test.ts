import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  toggleItemFavorite: vi.fn(),
}));

import { auth } from "@/auth";
import {
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  toggleItemFavorite as dbToggleItemFavorite,
} from "@/lib/db/items";
import { updateItem, deleteItem, toggleItemFavorite } from "./items";

const mockItemDetail = {
  id: "item-1",
  title: "useAuth Hook",
  description: "Custom auth hook",
  content: "export function useAuth() {}",
  contentType: "TEXT",
  language: "typescript",
  url: null,
  fileName: null,
  fileUrl: null,
  fileSize: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-01-15"),
  itemType: { id: "type-1", name: "Snippet", icon: "Code", color: "#3b82f6" },
  tags: ["react"],
  collections: [],
};

describe("updateItem server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await updateItem("item-1", { title: "Test", tags: [] });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
    expect(dbUpdateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when title is empty", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateItem("item-1", { title: "  ", tags: [] });

    expect(result.success).toBe(false);
    expect(dbUpdateItem).not.toHaveBeenCalled();
  });

  it("returns validation error when url is invalid", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateItem("item-1", {
      title: "My Link",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).toBe(false);
    expect(dbUpdateItem).not.toHaveBeenCalled();
  });

  it("returns not found error when db query returns null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbUpdateItem).mockResolvedValue(null);

    const result = await updateItem("item-1", { title: "Test", tags: [] });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Item not found");
  });

  it("returns success with updated item on valid input", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);

    const result = await updateItem("item-1", {
      title: "useAuth Hook",
      description: "Custom auth hook",
      tags: ["react"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("useAuth Hook");
      expect(result.data.tags).toEqual(["react"]);
    }
  });

  it("passes userId from session to the db query", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-42" } } as never);
    vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);

    await updateItem("item-1", { title: "Test", tags: [] });

    expect(dbUpdateItem).toHaveBeenCalledWith(
      "user-42",
      "item-1",
      expect.objectContaining({ title: "Test" })
    );
  });

  it("accepts empty string url and converts it to null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);

    await updateItem("item-1", { title: "Test", url: "", tags: [] });

    expect(dbUpdateItem).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      expect.objectContaining({ url: null })
    );
  });
});

describe("deleteItem server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await deleteItem("item-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
    expect(dbDeleteItem).not.toHaveBeenCalled();
  });

  it("returns not found error when db returns false", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbDeleteItem).mockResolvedValue({ ok: false });

    const result = await deleteItem("item-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Item not found");
  });

  it("returns success when item is deleted", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbDeleteItem).mockResolvedValue({ ok: true, fileUrl: null });

    const result = await deleteItem("item-1");

    expect(result.success).toBe(true);
  });

  it("passes userId from session to the db query", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-42" } } as never);
    vi.mocked(dbDeleteItem).mockResolvedValue({ ok: true, fileUrl: null });

    await deleteItem("item-99");

    expect(dbDeleteItem).toHaveBeenCalledWith("user-42", "item-99");
  });
});

describe("toggleItemFavorite server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await toggleItemFavorite("item-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
    expect(dbToggleItemFavorite).not.toHaveBeenCalled();
  });

  it("returns not found error when db returns null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbToggleItemFavorite).mockResolvedValue(null);

    const result = await toggleItemFavorite("item-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Item not found");
  });

  it("passes session user id to the db query", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-42" } } as never);
    vi.mocked(dbToggleItemFavorite).mockResolvedValue({
      ...mockItemDetail,
      isFavorite: true,
    });

    await toggleItemFavorite("item-99");

    expect(dbToggleItemFavorite).toHaveBeenCalledWith("user-42", "item-99");
  });

  it("returns updated item data on success", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbToggleItemFavorite).mockResolvedValue({
      ...mockItemDetail,
      isFavorite: true,
    });

    const result = await toggleItemFavorite("item-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFavorite).toBe(true);
    }
  });
});
