import {
  Layers,
  FolderOpen,
  Star,
  FolderHeart,
} from "lucide-react";

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

const stats = [
  { key: "items", label: "Total Items", icon: Layers },
  { key: "collections", label: "Collections", icon: FolderOpen },
  { key: "favoriteItems", label: "Favorite Items", icon: Star },
  { key: "favoriteCollections", label: "Favorite Collections", icon: FolderHeart },
] as const;

const valueMap = {
  items: "totalItems",
  collections: "totalCollections",
  favoriteItems: "favoriteItems",
  favoriteCollections: "favoriteCollections",
} as const;

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = props[valueMap[stat.key]];
        return (
          <div
            key={stat.key}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
