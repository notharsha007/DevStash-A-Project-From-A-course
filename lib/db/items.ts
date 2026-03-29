import { prisma } from "@/lib/prisma";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  typeIcon: string;
  typeColor: string;
  updatedAt: Date;
}

function toDashboardItem(
  item: {
    id: string;
    title: string;
    description: string | null;
    isPinned: boolean;
    isFavorite: boolean;
    updatedAt: Date;
    itemType: { icon: string; color: string };
    tags: { tag: { name: string } }[];
  }
): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags.map((t) => t.tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    updatedAt: item.updatedAt,
  };
}

const itemInclude = {
  itemType: true,
  tags: { include: { tag: true } },
} as const;

export async function getPinnedItems(
  userId: string,
  limit = 10
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
  limit = 10
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(toDashboardItem);
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}
