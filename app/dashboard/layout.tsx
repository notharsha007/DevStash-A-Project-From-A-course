import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { prisma } from "@/lib/prisma";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: replace with authenticated user once auth is set up
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });

  const userId = user?.id ?? "";

  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  const userData = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
  };

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              itemTypes={itemTypes}
              collections={sidebarCollections}
              user={userData}
            />
            {children}
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
