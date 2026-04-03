"use client";

import { useEffect, useRef } from "react";
import { Bookmark, FileText, Globe, MessageSquare, Terminal, WandSparkles } from "lucide-react";

const CHAOS_ITEMS = [
  { label: "Notion", short: "N", accent: "#ffffff" },
  { label: "GitHub", short: "GH", accent: "#94a3b8" },
  { label: "Slack", icon: MessageSquare, accent: "#ec4899" },
  { label: "VS Code", short: "VS", accent: "#3b82f6" },
  { label: "Browser Tabs", icon: Globe, accent: "#6366f1" },
  { label: "Terminal", icon: Terminal, accent: "#06b6d4" },
  { label: "Text File", icon: FileText, accent: "#22c55e" },
  { label: "Bookmark", icon: Bookmark, accent: "#f59e0b" },
] as const;

function PreviewCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <article
      className="min-w-0 rounded-2xl border border-border/70 bg-background/55 p-3 shadow-sm"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <h3 className="font-semibold leading-tight text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
    </article>
  );
}

export function HomepageHeroVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!container || items.length === 0) return;

    const state = items.map((node, index) => ({
      node,
      x: 20 + (index % 4) * 34,
      y: 26 + Math.floor(index / 4) * 110,
      vx: (Math.random() * 0.9 + 0.35) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.9 + 0.35) * (Math.random() > 0.5 ? 1 : -1),
      angle: Math.random() * 360,
      spin: (Math.random() * 0.45 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    function animate() {
      const liveContainer = containerRef.current;
      if (!liveContainer) return;

      const bounds = liveContainer.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const now = performance.now();

      for (const item of state) {
        const itemWidth = item.node.offsetWidth;
        const itemHeight = item.node.offsetHeight;

        item.x += item.vx;
        item.y += item.vy;
        item.angle += item.spin;

        if (item.x <= 0 || item.x + itemWidth >= width) {
          item.vx *= -1;
          item.x = Math.max(0, Math.min(item.x, width - itemWidth));
        }

        if (item.y <= 0 || item.y + itemHeight >= height) {
          item.vy *= -1;
          item.y = Math.max(0, Math.min(item.y, height - itemHeight));
        }

        if (mouse.active) {
          const cx = item.x + itemWidth / 2;
          const cy = item.y + itemHeight / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 120) {
            const force = (120 - distance) / 120;
            item.vx += (dx / Math.max(distance, 1)) * force * 0.24;
            item.vy += (dy / Math.max(distance, 1)) * force * 0.24;
          }
        }

        item.vx *= 0.995;
        item.vy *= 0.995;

        const scale = 1 + Math.sin(now / 450 + item.pulseOffset) * 0.04;
        item.node.style.transform = `translate(${item.x}px, ${item.y}px) rotate(${item.angle}deg) scale(${scale})`;
      }

      frame = window.requestAnimationFrame(animate);
    }

    function handleMove(event: MouseEvent) {
      const liveContainer = containerRef.current;
      if (!liveContainer) return;

      const rect = liveContainer.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    }

    function handleLeave() {
      mouse.active = false;
    }

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    frame = window.requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col items-center gap-6 lg:mt-8">
      <div className="flex w-full flex-col items-stretch justify-center gap-6 xl:flex-row xl:items-center">
        <section className="flex-1">
          <p className="mb-3 text-center text-sm text-muted-foreground xl:text-left">
            Your knowledge today...
          </p>
          <div
            ref={containerRef}
            className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-b from-slate-900/95 to-[#08101f] shadow-[0_28px_80px_rgba(2,8,23,0.45)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.12),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(245,158,11,0.12),transparent_25%),radial-gradient(circle_at_50%_85%,rgba(59,130,246,0.12),transparent_28%)]" />
            {CHAOS_ITEMS.map((item, index) => {
              return (
                <div
                  key={item.label}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className="absolute flex h-16 min-w-16 items-center justify-center rounded-3xl border border-white/12 bg-white/7 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-transform"
                  style={{ boxShadow: `0 0 32px ${item.accent}25` }}
                  title={item.label}
                >
                  {"icon" in item ? <item.icon className="size-5" /> : item.short}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex h-16 items-center justify-center xl:h-auto xl:w-24">
          <div className="relative animate-pulse">
            <span className="block h-1 w-14 rounded-full bg-linear-to-r from-blue-500 to-amber-400 xl:w-16" />
            <span className="absolute right-0 top-1/2 size-5 -translate-y-1/2 rotate-45 border-r-4 border-t-4 border-amber-400 xl:size-6" />
          </div>
        </div>

        <section className="flex-1">
          <p className="mb-3 text-center text-sm text-muted-foreground xl:text-left">
            ...with DevStash
          </p>
          <div className="grid min-h-[24rem] grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_80px_rgba(2,8,23,0.45)]">
            <aside className="border-r border-border/70 bg-card px-4 py-5">
              <div className="mb-5 text-lg font-semibold">DevStash</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>Dashboard</div>
                <div>Favorites</div>
                <div>Collections</div>
                <div>Prompts</div>
                <div>Settings</div>
              </div>
            </aside>
            <div className="min-w-0 p-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {["Pinned", "AI Ready", "Search"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <PreviewCard title="Auth Hook" description="Token refresh flow" accent="#3b82f6" />
                <PreviewCard title="Refactor Prompt" description="LLM constraints" accent="#f59e0b" />
                <PreviewCard title="Deploy Script" description="Release command" accent="#06b6d4" />
                <PreviewCard title="Debug Notes" description="Bug takeaway" accent="#22c55e" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-sm">
        <WandSparkles className="size-4 text-indigo-300" />
        From scattered dev context to one fast, searchable hub
      </div>
    </div>
  );
}
