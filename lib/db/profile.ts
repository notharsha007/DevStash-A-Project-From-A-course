import { prisma } from "@/lib/prisma";

export interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hashedPassword: string | null;
  createdAt: Date;
  totalItems: number;
  totalCollections: number;
  itemTypeCounts: { name: string; icon: string; color: string; count: number }[];
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hashedPassword: true,
      createdAt: true,
      _count: {
        select: {
          items: true,
          collections: true,
        },
      },
    },
  });

  if (!user) return null;

  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      _count: {
        select: { items: { where: { userId } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];
  const typeCounts = itemTypes
    .map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.name.toLowerCase());
      const bi = TYPE_ORDER.indexOf(b.name.toLowerCase());
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hashedPassword: user.hashedPassword,
    createdAt: user.createdAt,
    totalItems: user._count.items,
    totalCollections: user._count.collections,
    itemTypeCounts: typeCounts,
  };
}
