import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import { ItemsClientWrapper } from "@/components/items/ItemsClientWrapper";
import { ItemsPageHeader } from "@/components/items/ItemsPageHeader";

type FreeTypeName = "snippet" | "prompt" | "command" | "note" | "link";

const VALID_SLUGS = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

const FREE_TYPES: Record<string, FreeTypeName> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  links: "link",
};

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ItemsTypePage({ params }: Props) {
  const { type } = await params;
  if (!VALID_SLUGS.includes(type)) notFound();

  const session = await auth();
  const userId = session?.user?.id ?? "";

  const typeName = type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1);
  const items = await getItemsByType(userId, typeName);
  const displayName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <ItemsPageHeader
        title={displayName}
        count={items.length}
        createType={FREE_TYPES[type]}
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
      ) : (
        <ItemsClientWrapper
          items={items.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }))}
          containerClassName="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        />
      )}
    </main>
  );
}
