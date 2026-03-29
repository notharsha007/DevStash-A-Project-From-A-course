import Link from "next/link";
import { Pin } from "lucide-react";
import { mockItems, mockCollections, mockItemTypes } from "@/lib/mock-data";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";

const typeMap = Object.fromEntries(mockItemTypes.map((t) => [t.id, t]));

const recentCollections = [...mockCollections]
  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  .slice(0, 6);

const pinnedItems = mockItems.filter((item) => item.isPinned);

const recentItems = [...mockItems]
  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  .slice(0, 10);

const totalItems = mockItems.length;
const totalCollections = mockCollections.length;
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Your developer knowledge hub
      </p>

      {/* Stats */}
      <div className="mt-6">
        <StatsCards
          totalItems={totalItems}
          totalCollections={totalCollections}
          favoriteItems={favoriteItems}
          favoriteCollections={favoriteCollections}
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
            {pinnedItems.map((item) => {
              const type = typeMap[item.itemTypeId];
              return (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  isFavorite={item.isFavorite}
                  typeIcon={type?.icon ?? "Code"}
                  typeColor={type?.color ?? "#3b82f6"}
                  updatedAt={item.updatedAt}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent</h2>
        <div className="mt-4 space-y-2">
          {recentItems.map((item) => {
            const type = typeMap[item.itemTypeId];
            return (
              <ItemRow
                key={item.id}
                title={item.title}
                description={item.description}
                tags={item.tags}
                isPinned={item.isPinned}
                isFavorite={item.isFavorite}
                typeIcon={type?.icon ?? "Code"}
                typeColor={type?.color ?? "#3b82f6"}
                updatedAt={item.updatedAt}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
