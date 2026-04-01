"use client";

import { createContext, useContext, useState } from "react";

interface ItemDrawerContextValue {
  selectedItemId: string | null;
  drawerOpen: boolean;
  openItem: (id: string) => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openItem(id: string) {
    setSelectedItemId(id);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <ItemDrawerContext.Provider
      value={{ selectedItemId, drawerOpen, openItem, closeDrawer, setDrawerOpen }}
    >
      {children}
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return ctx;
}
