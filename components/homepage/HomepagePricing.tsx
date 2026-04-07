"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomepagePricingProps {
  primaryHref: string;
}

export function HomepagePricing({ primaryHref }: HomepagePricingProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const isYearly = billing === "yearly";

  return (
    <section
      id="pricing"
      data-reveal
      className="mx-auto mt-28 max-w-7xl translate-y-8 px-6 opacity-0 transition-all duration-700 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="text-4xl font-bold leading-none tracking-tight text-foreground md:text-6xl">
          Start free, upgrade when your knowledge hub becomes mission critical
        </h2>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["monthly", "yearly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBilling(option)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
                billing === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">Free</h3>
          <p className="mt-4 flex items-end gap-2">
            <span className="font-serif text-5xl font-semibold">$0</span>
            <span className="pb-1 text-sm text-muted-foreground">/forever</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>Up to 50 items</li>
            <li>3 collections</li>
            <li>Core search and organization</li>
          </ul>
          <Link
            href={primaryHref}
            className={buttonVariants({ variant: "outline", className: "mt-8 w-full" })}
          >
            Start Free
          </Link>
        </article>

        <article className="relative rounded-xl border border-indigo-400/30 bg-card p-6 shadow-sm">
          <div className="absolute right-5 top-5 rounded-full border border-indigo-400/25 bg-indigo-500/12 px-3 py-1 text-xs font-semibold text-indigo-100">
            Most Popular
          </div>
          <h3 className="text-2xl font-semibold">Pro</h3>
          <p className="mt-4 flex items-end gap-2">
            <span className="font-serif text-5xl font-semibold">{isYearly ? "$72" : "$8"}</span>
            <span className="pb-1 text-sm text-muted-foreground">{isYearly ? "/year" : "/mo"}</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>Unlimited items and collections</li>
            <li>AI features and generated tags</li>
            <li>Advanced organization for power users</li>
          </ul>
          <Link
            href={primaryHref}
            className={buttonVariants({ className: "mt-8 w-full" })}
          >
            Go Pro
          </Link>
        </article>
      </div>
    </section>
  );
}
