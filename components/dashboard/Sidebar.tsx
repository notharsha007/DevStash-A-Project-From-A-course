"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Star,
  PanelLeft,
  Plus,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { iconMap } from "@/lib/icon-map";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

function typeToSlug(name: string) {
  return name.toLowerCase() + "s";
}

interface SidebarProps {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null };
}

export function Sidebar({ itemTypes, collections, user }: SidebarProps) {
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar();
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header with collapse toggle */}
      <div className={`flex h-14 items-center px-3 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <span className="text-xs font-semibold  tracking-wider text-muted-foreground">
            Navigation
          </span>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                className="hidden lg:flex"
              />
            }
          >
            <PanelLeft className={`size-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </TooltipTrigger>
          <TooltipContent side="right">{isCollapsed ? "Expand" : "Collapse"}</TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={closeMobile}
          className="lg:hidden"
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>
      <Separator />

      {/* Types nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon] ?? iconMap.Code;
            const link = (
              <Link
                href={`/items/${typeToSlug(type.name)}`}
                onClick={closeMobile}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{type.name + "s"}</span>
                    {(type.name === "file" || type.name === "image") && (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold tracking-wide">
                        PRO
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{type.count}</span>
                  </>
                )}
              </Link>
            );
            return (
              <li key={type.id}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger render={link} />
                    <TooltipContent side="right">{type.name + "s"}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>

        {/* Collections */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-2.5 pb-2">
              <button
                onClick={() => setCollectionsOpen((prev) => !prev)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown
                  className={`size-3.5 transition-transform ${collectionsOpen ? "" : "-rotate-90"
                    }`}
                />
                Collections
              </button>
              <Button variant="ghost" size="icon-xs">
                <Plus className="size-3.5" />
              </Button>
            </div>

            {collectionsOpen && (
              <>
                {/* Favorites */}
                {favoriteCollections.length > 0 && (
                  <div className="mb-3">
                    <span className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Favorites
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {favoriteCollections.map((col) => (
                        <li key={col.id}>
                          <Link
                            href={`/collections/${col.id}`}
                            onClick={closeMobile}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                            <span className="flex-1 truncate">{col.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent Collections */}
                {recentCollections.length > 0 && (
                  <div>
                    <span className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Recent Collections
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {recentCollections.map((col) => (
                        <li key={col.id}>
                          <Link
                            href={`/collections/${col.id}`}
                            onClick={closeMobile}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: col.dominantTypeColor }}
                            />
                            <span className="flex-1 truncate">{col.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {col.itemCount}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* View all collections link */}
                <Link
                  href="/collections"
                  onClick={closeMobile}
                  className="mt-2 block px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all collections
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* User area */}
      <Separator />
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className={`flex cursor-pointer items-center outline-none transition-colors hover:opacity-80 ${isCollapsed ? "justify-center" : "w-full gap-3 rounded-lg text-left"}`} />
            }
          >
            <UserAvatar name={user.name} image={user.image} />
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.location.href = "/profile"}
              >
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex ${isCollapsed ? "w-14" : "w-60"
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
