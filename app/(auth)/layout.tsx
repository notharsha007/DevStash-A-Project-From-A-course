import { HomepageNavbar } from "@/components/homepage/HomepageNavbar";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <HomepageNavbar isAuthenticated={false} />
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
