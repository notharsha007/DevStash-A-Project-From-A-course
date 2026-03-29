import Link from "next/link";
import { Clock, Pin } from "lucide-react";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";

export default async function DashboardPage() {
  // TODO: replace with authenticated user once auth is set up
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });

  const userId = user?.id ?? "";

  const [recentCollections, collectionStats, pinnedItems, recentItems, itemStats] =
    await Promise.all([
      getRecentCollections(userId),
      getCollectionStats(userId),
      getPinnedItems(userId),
      getRecentItems(userId),
      getItemStats(userId),
    ]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Your developer knowledge hub
      </p>

      {/* Stats */}
      <div className="mt-6">
        <StatsCards
          totalItems={itemStats.totalItems}
          totalCollections={collectionStats.totalCollections}
          favoriteItems={itemStats.favoriteItems}
          favoriteCollections={collectionStats.favoriteCollections}
        />
      </div>

      {/* Collections */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              isFavorite={col.isFavorite}
              itemCount={col.itemCount}
              dominantTypeColor={col.dominantTypeColor}
              itemTypeIcons={col.itemTypeIcons}
            />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="mt-4 space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                description={item.description}
                tags={item.tags}
                isPinned={item.isPinned}
                isFavorite={item.isFavorite}
                typeIcon={item.typeIcon}
                typeColor={item.typeColor}
                updatedAt={item.updatedAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Items</h2>
        </div>
        <div className="mt-4 space-y-2">
          {recentItems.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              description={item.description}
              tags={item.tags}
              isPinned={item.isPinned}
              isFavorite={item.isFavorite}
              typeIcon={item.typeIcon}
              typeColor={item.typeColor}
              updatedAt={item.updatedAt}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
