import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    title: "Code Snippets",
    description: "Store reusable code with tags, language context, and quick retrieval.",
    accent: "#3b82f6",
  },
  {
    title: "AI Prompts",
    description: "Save the prompts that actually work instead of rewriting them every sprint.",
    accent: "#f59e0b",
  },
  {
    title: "Instant Search",
    description: "Jump straight to the right snippet, note, file, or link from one place.",
    accent: "#6366f1",
  },
  {
    title: "Commands",
    description: "Keep shell commands, scripts, and release shortcuts where the team can find them.",
    accent: "#06b6d4",
  },
  {
    title: "Files & Docs",
    description: "Attach specs, screenshots, exports, and references to the same workspace.",
    accent: "#64748b",
  },
  {
    title: "Collections",
    description: "Bundle related developer knowledge into focused stacks for projects and audits.",
    accent: "#22c55e",
  },
] as const;

const primaryButtonClass =
  "inline-flex h-8 items-center justify-center rounded-full px-6 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:opacity-90";

const outlineButtonClass =
  "inline-flex h-8 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function HomepageHeroCopy({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/register";

  return (
    <div
      data-reveal
      className="mx-auto max-w-4xl translate-y-8 text-center opacity-0 transition-all duration-700 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
    >
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-blue-200/80">
        Developer Knowledge Hub
      </p>
      <h1 className="font-serif text-5xl leading-none tracking-tight text-foreground sm:text-6xl lg:text-8xl">
        Stop Losing Your
        <span className="mt-2 block bg-linear-to-r from-blue-300 via-violet-300 to-orange-300 bg-clip-text text-transparent">
          Developer Knowledge
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        Snippets in Slack, commands in terminal history, prompts in random docs, and links buried
        across tabs. DevStash turns scattered knowledge into one organized, searchable workspace.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className={primaryButtonClass}
        >
          {isAuthenticated ? "Open Dashboard" : "Start for Free"}
        </Link>
        <Link href="#features" className={outlineButtonClass}>
          See the Workflow
        </Link>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="rounded-3xl border border-border/70 bg-card/60 px-5 py-4 text-left shadow-sm">
          <strong className="block text-sm font-semibold text-foreground">7 item types</strong>
          <span className="mt-1 block text-sm text-muted-foreground">
            Snippets, prompts, notes, files and more
          </span>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/60 px-5 py-4 text-left shadow-sm">
          <strong className="block text-sm font-semibold text-foreground">Instant retrieval</strong>
          <span className="mt-1 block text-sm text-muted-foreground">
            Searchable context instead of memory games
          </span>
        </div>
      </div>
    </div>
  );
}

export function HomepageFeaturesSection() {
  return (
    <section
      id="features"
      data-reveal
      className="mx-auto mt-28 max-w-7xl translate-y-8 px-6 opacity-0 transition-all duration-700 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-blue-200/80">
          Core Features
        </p>
        <h2 className="font-serif text-4xl leading-none tracking-tight text-foreground md:text-6xl">
          Everything you need to keep developer context within reach
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/65 p-6 shadow-sm"
            style={{ borderTop: `4px solid ${feature.accent}` }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-3xl"
              style={{ backgroundColor: `${feature.accent}22` }}
            />
            <h3 className="relative text-xl font-semibold text-foreground">{feature.title}</h3>
            <p className="relative mt-3 text-sm leading-7 text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomepageAiSection() {
  return (
    <section
      data-reveal
      className="mx-auto mt-28 grid max-w-7xl translate-y-8 gap-8 px-6 opacity-0 transition-all duration-700 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 lg:grid-cols-[0.95fr_1.05fr]"
    >
      <div>
        <Badge className="rounded-full border-amber-400/20 bg-amber-400/12 px-3 py-1 text-amber-200 hover:bg-amber-400/12">
          Pro Feature
        </Badge>
        <h2 className="mt-4 font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
          AI assistance that works with your real developer context
        </h2>
        <ul className="mt-8 space-y-4 text-muted-foreground">
          {[
            "Generate tags from your snippets and notes",
            "Summarize large docs into actionable takeaways",
            "Turn rough ideas into reusable prompt templates",
            "Find related items across collections in seconds",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 leading-7">
              <span className="mt-2 size-2 rounded-full bg-green-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
        <div className="flex gap-2 px-5 pt-5">
          <span className="size-3 rounded-full bg-red-400/70" />
          <span className="size-3 rounded-full bg-amber-400/70" />
          <span className="size-3 rounded-full bg-green-400/70" />
        </div>
        <pre className="overflow-x-auto px-5 py-4 text-sm leading-7 text-blue-100">
{`const deploymentChecklist = {
  task: "Ship dashboard search",
  risks: ["rate limiting", "cache misses"],
  aiPrompt: "Generate tags for this release context"
};`}
        </pre>
        <div className="border-t border-border/70 px-5 py-4">
          <p className="text-sm font-medium text-foreground">AI Generated Tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["release", "search", "debugging", "dashboard"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-500/12 px-3 py-1 text-xs font-medium text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomepageCtaSection({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <section
      data-reveal
      className="mx-auto mt-28 max-w-7xl translate-y-8 px-6 opacity-0 transition-all duration-700 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
    >
      <div className="rounded-[2rem] border border-border/70 bg-linear-to-b from-card to-card/80 px-6 py-12 text-center shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-blue-200/80">
          Ready to Organize Your Knowledge?
        </p>
        <h2 className="mx-auto max-w-4xl font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
          Give your snippets, prompts, files, and notes a home that actually works.
        </h2>
        <Link
          href={isAuthenticated ? "/dashboard" : "/register"}
          className={`${primaryButtonClass} mt-8`}
        >
          {isAuthenticated ? "Open Dashboard" : "Get Started with DevStash"}
        </Link>
      </div>
    </section>
  );
}

export function HomepageFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-background/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-blue-500/25">
              D
            </span>
            <span className="text-lg">DevStash</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Developer knowledge, finally organized.
          </p>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Security"] },
          { title: "Resources", links: ["Docs", "Guides", "Changelog"] },
          { title: "Company", links: ["About", "Contact", "Privacy"] },
        ].map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <div key={link}>{link}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-border/70 px-6 py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DevStash. All rights reserved.
      </p>
    </footer>
  );
}
