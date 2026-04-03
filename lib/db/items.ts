import { ContentType } from "../../generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE, DASHBOARD_RECENT_ITEMS_LIMIT } from "@/lib/constants";

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  language: string | null;
  url: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: { id: string; name: string; icon: string; color: string };
  tags: string[];
  collections: { id: string; name: string }[];
}

export async function getItemDetail(
  userId: string,
  itemId: string
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    language: item.language,
    url: item.url,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: {
      id: item.itemType.id,
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  typeIcon: string;
  typeColor: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  updatedAt: Date;
}

export interface FavoriteItem extends DashboardItem {
  typeName: string;
}

function toDashboardItem(
  item: {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    url: string | null;
    isPinned: boolean;
    isFavorite: boolean;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    updatedAt: Date;
    itemType: { icon: string; color: string };
    tags: { tag: { name: string } }[];
  }
): DashboardItem {
  return {
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    updatedAt: item.updatedAt,
  };
}

const itemInclude = {
  itemType: true,
  tags: { include: { tag: true } },
} as const;

export async function getPinnedItems(
  userId: string,
  limit = DASHBOARD_RECENT_ITEMS_LIMIT
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(toDashboardItem);
}

export async function getRecentItems(
  userId: string,
  limit = DASHBOARD_RECENT_ITEMS_LIMIT
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(toDashboardItem);
}

export async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: itemInclude,
  });

  return items.map((item) => ({
    ...toDashboardItem(item),
    typeName: item.itemType.name.toLowerCase(),
  }));
}

export async function countItemsByType(
  userId: string,
  typeName: string
): Promise<number> {
  return prisma.item.count({
    where: {
      userId,
      itemType: { name: { equals: typeName, mode: "insensitive" } },
    },
  });
}

export async function getItemsByType(
  userId: string,
  typeName: string,
  page = 1,
  limit = ITEMS_PER_PAGE
): Promise<DashboardItem[]> {
  const skip = (Math.max(1, page) - 1) * limit;
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: { equals: typeName, mode: "insensitive" } },
    },
    orderBy: { updatedAt: "desc" },
    skip,
    take: limit,
    include: itemInclude,
  });

  return items.map(toDashboardItem);
}

export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
  collectionIds?: string[];
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  // Verify ownership first
  const existing = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: (data.collectionIds ?? []).map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    language: item.language,
    url: item.url,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: {
      id: item.itemType.id,
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export async function toggleItemFavorite(
  userId: string,
  itemId: string
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      isFavorite: !existing.isFavorite,
    },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    language: item.language,
    url: item.url,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: {
      id: item.itemType.id,
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export interface CreateItemData {
  typeName: string;
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  tags: string[];
  collectionIds?: string[];
}

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail | null> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: { equals: data.typeName, mode: "insensitive" }, isSystem: true },
  });

  if (!itemType) return null;

  const typeLower = itemType.name.toLowerCase();
  const contentType =
    typeLower === "link"
      ? ContentType.URL
      : typeLower === "file" || typeLower === "image"
      ? ContentType.FILE
      : ContentType.TEXT;

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      contentType,
      userId,
      itemTypeId: itemType.id,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        create: (data.collectionIds ?? []).map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    language: item.language,
    url: item.url,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: {
      id: item.itemType.id,
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<{ ok: true; fileUrl: string | null } | { ok: false }> {
  const existing = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!existing) return { ok: false };

  await prisma.item.delete({ where: { id: itemId } });
  return { ok: true, fileUrl: existing.fileUrl };
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getItemTypesWithCounts(
  userId: string
): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      _count: {
        select: { items: { where: { userId } } },
      },
    },
  });

  const mapped = types.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: type._count.items,
  }));

  mapped.sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.name.toLowerCase());
    const bi = TYPE_ORDER.indexOf(b.name.toLowerCase());
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return mapped;
}

// ─── Search ───────────────────────────────────────────

export interface SearchItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  contentPreview: string | null;
}

export async function getSearchItems(userId: string): Promise<SearchItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      fileName: true,
      itemType: { select: { name: true, icon: true, color: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    typeName: item.itemType.name,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    contentPreview: item.content?.slice(0, 80) ?? item.url ?? item.fileName ?? null,
  }));
}

