"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "@/components/items/CreateItemDialog";

type FreeTypeName = "snippet" | "prompt" | "command" | "note" | "link";

interface ItemsPageHeaderProps {
  title: string;
  count: number;
  createType?: FreeTypeName;
}

export function ItemsPageHeader({ title, count, createType }: ItemsPageHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      {createType && (
        <>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New {title.slice(0, -1)}
          </Button>
          <CreateItemDialog open={open} onOpenChange={setOpen} initialType={createType} />
        </>
      )}
    </div>
  );
}
