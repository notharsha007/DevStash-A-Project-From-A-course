import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType } from "@/lib/db/items";
import { ItemRow } from "@/components/dashboard/ItemRow";

// Converts a URL slug to the ItemType name stored in the DB
// e.g. "snippets" → "Snippet", "links" → "Link"
function slugToTypeName(slug: string): string {
  const base = slug.endsWith("s") ? slug.slice(0, -1) : slug;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const VALID_SLUGS = new Set([
  "snippets",
  "prompts",
  "commands",
  "notes",
  "files",
  "images",
  "links",
]);

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ItemsTypePage({ params }: Props) {
  const { type } = await params;

  if (!VALID_SLUGS.has(type)) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id ?? "";

  const typeName = slugToTypeName(type);
  const items = await getItemsByType(userId, typeName);

  const displayName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold">{displayName}</h1>
      <p className="mt-1 text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-lg font-medium">No {displayName.toLowerCase()} yet</p>
          <p className="mt-1 text-sm">Items you add will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
      )}
    </main>
  );
}
