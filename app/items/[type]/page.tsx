import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType, countItemsByType } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ItemsClientWrapper } from "@/components/items/ItemsClientWrapper";
import { ItemsPageHeader } from "@/components/items/ItemsPageHeader";
import { PaginationControls } from "@/components/shared/PaginationControls";

type AllTypeName = "snippet" | "prompt" | "command" | "note" | "link" | "file" | "image";

const VALID_SLUGS = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

const SLUG_TO_TYPE: Record<string, AllTypeName> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  files: "file",
  images: "image",
  links: "link",
};

interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ItemsTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  if (!VALID_SLUGS.includes(type)) notFound();

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  const session = await auth();
  const userId = session?.user?.id ?? "";

  const typeName = type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1);
  const [items, totalCount] = await Promise.all([
    getItemsByType(userId, typeName, page, ITEMS_PER_PAGE),
    countItemsByType(userId, typeName),
  ]);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const displayName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col flex-nowrap min-h-full">
      <div className="space-y-6 flex-1">
        <ItemsPageHeader
          title={displayName}
          count={totalCount}
          createType={SLUG_TO_TYPE[type]}
        />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <p className="text-lg font-medium">No {displayName.toLowerCase()} yet</p>
          <p className="mt-1 text-sm">Items you add will appear here.</p>
        </div>
      ) : type === "images" ? (
        <ItemsClientWrapper
          items={items.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }))}
          containerClassName="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          variant="gallery"
        />
      ) : type === "files" ? (
        <ItemsClientWrapper
          items={items.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }))}
          containerClassName="flex flex-col gap-1"
          variant="file-list"
        />
      ) : (
        <ItemsClientWrapper
          items={items.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }))}
          containerClassName="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        />
      )}
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath={`/items/${type}`}
      />
    </main>
  );
}
