"use client";

interface Collection {
  id: string;
  name: string;
}

interface CollectionsSelectProps {
  collections: Collection[];
  selected: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export function CollectionsSelect({
  collections,
  selected,
  onChange,
  loading = false,
}: CollectionsSelectProps) {
  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading collections…</p>;
  }

  if (collections.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground/50">No collections yet</p>
    );
  }

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
      {collections.map((col) => {
        const isSelected = selected.includes(col.id);
        return (
          <button
            key={col.id}
            type="button"
            onClick={() => toggle(col.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {col.name}
          </button>
        );
      })}
    </div>
  );
}
