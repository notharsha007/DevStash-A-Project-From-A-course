"use client";

import { ItemDrawer } from "@/components/items/ItemDrawer";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";

/**
 * Renders the global ItemDrawer driven by ItemDrawerContext.
 * Placed at layout level so both ItemsClientWrapper and CommandPalette can open it.
 */
export function ItemDrawerHost() {
  const { selectedItemId, drawerOpen, setDrawerOpen } = useItemDrawer();

  return (
    <ItemDrawer
      itemId={selectedItemId}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    />
  );
}
