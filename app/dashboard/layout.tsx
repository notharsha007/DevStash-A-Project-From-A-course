import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/auth";
import { getItemTypesWithCounts, getSearchItems } from "@/lib/db/items";
import { getSidebarCollections, getSearchCollections } from "@/lib/db/collections";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerContext";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { ItemDrawerHost } from "@/components/items/ItemDrawerHost";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  if (!userId) {
    redirect("/sign-in");
  }

  const [itemTypes, sidebarCollections, searchItems, searchCollections] =
    await Promise.all([
      getItemTypesWithCounts(userId),
      getSidebarCollections(userId),
      getSearchItems(userId),
      getSearchCollections(userId),
    ]);

  const userData = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <ItemDrawerProvider>
      <SidebarProvider>
        <TooltipProvider>
          <div className="flex h-screen flex-col">
            <TopBar searchItems={searchItems} searchCollections={searchCollections} />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar
                itemTypes={itemTypes}
                collections={sidebarCollections}
                user={userData}
              />
              {children}
            </div>
          </div>
          <ItemDrawerHost />
        </TooltipProvider>
      </SidebarProvider>
    </ItemDrawerProvider>
  );
}
