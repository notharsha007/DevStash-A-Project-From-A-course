"use client";

import { useState } from "react";
import { Search, Plus, FolderPlus, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { CreateItemDialog } from "@/components/items/CreateItemDialog";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";

export function TopBar() {
  const { toggleMobile } = useSidebar();
  const [createOpen, setCreateOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="lg:hidden"
      >
        <PanelLeft className="size-5" />
      </Button>

      <a href="/dashboard" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">D</span>
        </div>
        <span className="text-lg font-semibold">DevStash</span>
      </a>

      <div className="relative mx-auto w-full max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="pl-9"
          readOnly
        />
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" size="sm" onClick={() => setCollectionOpen(true)} />
            }
          >
            <FolderPlus className="size-4" />
            <span className="hidden sm:inline">New Collection</span>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">New Collection</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="sm" onClick={() => setCreateOpen(true)} />
            }
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Item</span>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">New Item</TooltipContent>
        </Tooltip>
      </div>

      <CreateItemDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CreateCollectionDialog open={collectionOpen} onOpenChange={setCollectionOpen} />
    </header>
  );
}
