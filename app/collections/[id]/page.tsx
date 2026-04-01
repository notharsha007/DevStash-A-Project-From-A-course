import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCollectionById, getItemsByCollection, countItemsByCollection } from "@/lib/db/collections";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ItemsClientWrapper } from "@/components/items/ItemsClientWrapper";
import { CollectionDetailHeader } from "@/components/collections/CollectionDetailHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [collection, totalCount, items] = await Promise.all([
    getCollectionById(userId, id),
    countItemsByCollection(userId, id),
    getItemsByCollection(userId, id, page, ITEMS_PER_PAGE),
  ]);

  if (!collection) notFound();

  const serialized = items.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  const imageItems = serialized.filter((i) => i.typeName === "image");
  const fileItems = serialized.filter((i) => i.typeName === "file");
  const otherItems = serialized.filter(
    (i) => i.typeName !== "image" && i.typeName !== "file"
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col min-h-full">
      <div className="space-y-6 flex-1">
        <CollectionDetailHeader collection={collection} itemCount={totalCount} />

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No items in this collection</p>
          <p className="mt-1 text-sm">Add items to this collection when creating or editing them.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {otherItems.length > 0 && (
            <ItemsClientWrapper
              items={otherItems}
              containerClassName="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            />
          )}

          {imageItems.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Images
              </h2>
              <ItemsClientWrapper
                items={imageItems}
                containerClassName="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                variant="gallery"
              />
            </section>
          )}

          {fileItems.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Files
              </h2>
              <ItemsClientWrapper
                items={fileItems}
                containerClassName="flex flex-col gap-1"
                variant="file-list"
              />
            </section>
          )}
        </div>
      )}
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath={`/collections/${id}`}
      />
    </main>
  );
}
