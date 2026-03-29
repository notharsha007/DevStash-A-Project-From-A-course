import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            {children}
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
