import { prisma } from "@/lib/prisma";

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

export async function getRecentCollections(
  userId: string,
  limit = 6
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
