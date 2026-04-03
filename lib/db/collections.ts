import { prisma } from "@/lib/prisma";
import { 
  COLLECTIONS_PER_PAGE, 
  ITEMS_PER_PAGE, 
  DASHBOARD_COLLECTIONS_LIMIT 
} from "@/lib/constants";

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor: string;
  itemTypeIcons: string[];
  updatedAt: Date;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  updatedAt: Date;
}

export async function getRecentCollections(
  userId: string,
  limit = DASHBOARD_COLLECTIONS_LIMIT
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string; icon: string }>();

    for (const ic of col.items) {
      const { id, color, icon } = ic.item.itemType;
      const entry = typeCounts.get(id);
      if (entry) {
        entry.count++;
      } else {
        typeCounts.set(id, { count: 1, color, icon });
      }
    }

    let dominantTypeColor = "#3b82f6";
    let maxCount = 0;
    const itemTypeIcons: string[] = [];

    for (const { count, color, icon } of typeCounts.values()) {
      itemTypeIcons.push(icon);
      if (count > maxCount) {
        maxCount = count;
        dominantTypeColor = color;
      }
    }

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantTypeColor,
      itemTypeIcons,
      updatedAt: col.updatedAt,
    };
  });
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor: string;
  updatedAt: Date;
}

export async function getSidebarCollections(
  userId: string,
  limit = 5
): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string }>();

    for (const ic of col.items) {
      const { id, color } = ic.item.itemType;
      const entry = typeCounts.get(id);
      if (entry) {
        entry.count++;
      } else {
        typeCounts.set(id, { count: 1, color });
      }
    }

    let dominantTypeColor = "#3b82f6";
    let maxCount = 0;

    for (const { count, color } of typeCounts.values()) {
      if (count > maxCount) {
        maxCount = count;
        dominantTypeColor = color;
      }
    }

    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantTypeColor,
      updatedAt: col.updatedAt,
    };
  });
}

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalCollections, favoriteCollections };
}

export async function getFavoriteCollections(
  userId: string
): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    updatedAt: collection.updatedAt,
  }));
}

export async function getUserCollections(
  userId: string
): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function countAllCollections(userId: string): Promise<number> {
  return prisma.collection.count({ where: { userId } });
}

export async function getAllCollections(
  userId: string,
  page = 1,
  limit = COLLECTIONS_PER_PAGE
): Promise<DashboardCollection[]> {
  const skip = (Math.max(1, page) - 1) * limit;
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    skip,
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string; icon: string }>();

    for (const ic of col.items) {
      const { id, color, icon } = ic.item.itemType;
      const entry = typeCounts.get(id);
      if (entry) {
        entry.count++;
      } else {
        typeCounts.set(id, { count: 1, color, icon });
      }
    }

    let dominantTypeColor = "#3b82f6";
    let maxCount = 0;
    const itemTypeIcons: string[] = [];

    for (const { count, color, icon } of typeCounts.values()) {
      itemTypeIcons.push(icon);
      if (count > maxCount) {
        maxCount = count;
        dominantTypeColor = color;
      }
    }

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantTypeColor,
      itemTypeIcons,
      updatedAt: col.updatedAt,
    };
  });
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  dominantTypeColor: string;
}

export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionDetail | null> {
  const col = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!col) return null;

  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    dominantTypeColor: "#3b82f6",
  };
}

export async function countItemsByCollection(
  userId: string,
  collectionId: string
): Promise<number> {
  return prisma.item.count({
    where: {
      userId,
      collections: { some: { collectionId } },
    },
  });
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
  page = 1,
  limit = ITEMS_PER_PAGE
) {
  const skip = (Math.max(1, page) - 1) * limit;
  const items = await prisma.item.findMany({
    where: {
      userId,
      collections: { some: { collectionId } },
    },
    orderBy: { updatedAt: "desc" },
    skip,
    take: limit,
    include: {
      itemType: true,
      tags: { include: { tag: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    tags: item.tags.map((t) => t.tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    typeName: item.itemType.name.toLowerCase(),
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    updatedAt: item.updatedAt,
  }));
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null }
): Promise<{ id: string; name: string }> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
    select: { id: true, name: true },
  });

  return collection;
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description?: string | null }
): Promise<{ id: string; name: string }> {
  const collection = await prisma.collection.updateMany({
    where: { id: collectionId, userId },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });

  if (collection.count === 0) {
    throw new Error("Collection not found or unauthorized");
  }

  return { id: collectionId, name: data.name };
}

export async function toggleCollectionFavorite(
  userId: string,
  collectionId: string
): Promise<{ id: string; isFavorite: boolean } | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true, isFavorite: true },
  });

  if (!existing) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: {
      isFavorite: !existing.isFavorite,
    },
    select: {
      id: true,
      isFavorite: true,
    },
  });

  return updated;
}

export async function deleteCollection(
  userId: string,
  collectionId: string
): Promise<void> {
  const result = await prisma.collection.deleteMany({
    where: { id: collectionId, userId },
  });

  if (result.count === 0) {
    throw new Error("Collection not found or unauthorized");
  }
}

// ─── Search ───────────────────────────────────────────

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export async function getSearchCollections(
  userId: string
): Promise<SearchCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
    },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    itemCount: c._count.items,
  }));
}

