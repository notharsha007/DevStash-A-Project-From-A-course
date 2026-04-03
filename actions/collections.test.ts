import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  getUserCollections: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  toggleCollectionFavorite: vi.fn(),
}));

import { auth } from "@/auth";
import { toggleCollectionFavorite as dbToggleCollectionFavorite } from "@/lib/db/collections";
import { toggleCollectionFavorite } from "./collections";

describe("toggleCollectionFavorite server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized error when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await toggleCollectionFavorite("col-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Unauthorized");
    expect(dbToggleCollectionFavorite).not.toHaveBeenCalled();
  });

  it("returns not found error when db returns null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbToggleCollectionFavorite).mockResolvedValue(null);

    const result = await toggleCollectionFavorite("col-1");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Collection not found");
  });

  it("passes session user id to the db query", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-42" } } as never);
    vi.mocked(dbToggleCollectionFavorite).mockResolvedValue({
      id: "col-1",
      isFavorite: true,
    });

    await toggleCollectionFavorite("col-1");

    expect(dbToggleCollectionFavorite).toHaveBeenCalledWith("user-42", "col-1");
  });

  it("returns updated favorite state on success", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(dbToggleCollectionFavorite).mockResolvedValue({
      id: "col-1",
      isFavorite: false,
    });

    const result = await toggleCollectionFavorite("col-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFavorite).toBe(false);
    }
  });
});
