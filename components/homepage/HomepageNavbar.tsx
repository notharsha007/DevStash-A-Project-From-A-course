"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DevStashLogo } from "@/components/shared/DevStashLogo";
import { cn } from "@/lib/utils";

interface HomepageNavbarProps {
  isAuthenticated: boolean;
}

export function HomepageNavbar({ isAuthenticated }: HomepageNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-background/35 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/">
          <DevStashLogo />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={isAuthenticated ? "/dashboard" : "/sign-in"}
            className={buttonVariants({ variant: "outline", className: "rounded-full px-4" })}
          >
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className={buttonVariants({
              className:
                "rounded-full border-0 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 px-4 text-white shadow-lg shadow-blue-500/25 hover:opacity-90",
            })}
          >
            {isAuthenticated ? "Open App" : "Get Started"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
