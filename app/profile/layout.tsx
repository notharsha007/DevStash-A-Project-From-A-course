import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/auth";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  if (!userId) {
    redirect("/sign-in");
  }

  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  const userData = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image,
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
