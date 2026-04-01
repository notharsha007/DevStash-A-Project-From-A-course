import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllCollections, countAllCollections } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { CollectionsSectionHeader } from "@/components/collections/CollectionsSectionHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  const [collections, totalCount] = await Promise.all([
    getAllCollections(session.user.id, page, COLLECTIONS_PER_PAGE),
    countAllCollections(session.user.id),
  ]);

  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col min-h-full">
      <div className="flex-1">
        <CollectionsSectionHeader />

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No collections yet</p>
          <p className="mt-1 text-sm">Create a collection to organise your items.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
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
      )}
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath="/collections"
      />
    </main>
  );
}
