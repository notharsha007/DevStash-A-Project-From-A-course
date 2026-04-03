import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { FavoritesList } from "@/components/favorites/FavoritesList";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [items, collections] = await Promise.all([
    getFavoriteItems(session.user.id),
    getFavoriteCollections(session.user.id),
  ]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-yellow-500 text-yellow-500" />
            <h1 className="font-mono text-2xl font-semibold tracking-tight">Favorites</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quick access to the items and collections you starred most recently.
          </p>
        </div>

        <FavoritesList
          items={items.map((item) => ({
            ...item,
            updatedAt: item.updatedAt.toISOString(),
          }))}
          collections={collections.map((collection) => ({
            ...collection,
            updatedAt: collection.updatedAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
