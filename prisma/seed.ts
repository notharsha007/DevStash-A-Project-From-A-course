import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── System Item Types ───────────────────────────────

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

// ─── Seed Items by Collection ────────────────────────

interface SeedItem {
  title: string;
  type: string;
  language?: string;
  content?: string;
  url?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const collections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce Hook",
        type: "snippet",
        language: "typescript",
        isPinned: true,
        isFavorite: true,
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        title: "Compound Component Pattern",
        type: "snippet",
        language: "typescript",
        isFavorite: true,
        content: `import { createContext, useContext, useState, ReactNode } from "react";

interface AccordionContext {
  openIndex: number | null;
  toggle: (index: number) => void;
}

const AccordionCtx = createContext<AccordionContext | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error("Must be used within <Accordion>");
  return ctx;
}

export function Accordion({ children }: { children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <AccordionCtx.Provider value={{ openIndex, toggle }}>
      {children}
    </AccordionCtx.Provider>
  );
}

export function AccordionItem({ index, title, children }: {
  index: number; title: string; children: ReactNode;
}) {
  const { openIndex, toggle } = useAccordion();
  return (
    <div>
      <button onClick={() => toggle(index)}>{title}</button>
      {openIndex === index && <div>{children}</div>}
    </div>
  );
}`,
      },
      {
        title: "clsx Utility",
        type: "snippet",
        language: "typescript",
        content: `type ClassValue = string | number | boolean | undefined | null | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);
      }
      return [];
    })
    .join(" ");
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: true,
    items: [
      {
        title: "Code Review Prompt",
        type: "prompt",
        isPinned: true,
        isFavorite: true,
        content: `Review the following code for:
1. Correctness — are there bugs, edge cases, or logic errors?
2. Performance — any unnecessary re-renders, O(n²) loops, or memory leaks?
3. Readability — naming, structure, and comments.
4. Security — injection, XSS, or data-leak risks.

Return a numbered list of findings with severity (critical / warning / nit) and a suggested fix for each.`,
      },
      {
        title: "Documentation Generator",
        type: "prompt",
        content: `Generate concise documentation for the following code. Include:
- A one-line summary of what it does
- Parameters / props with types and descriptions
- Return value (if applicable)
- A short usage example

Use JSDoc style for JavaScript/TypeScript, or plain Markdown for other languages.`,
      },
      {
        title: "Refactoring Assistant",
        type: "prompt",
        content: `Analyze the following code and suggest refactoring improvements:
- Extract repeated logic into reusable functions or hooks
- Simplify complex conditionals
- Improve naming for clarity
- Reduce coupling between modules
- Apply relevant design patterns

For each suggestion, explain the benefit and show the refactored code.`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Multi-stage Dockerfile",
        type: "snippet",
        language: "dockerfile",
        isPinned: true,
        content: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy with PM2",
        type: "command",
        content: `pm2 start ecosystem.config.js --env production && pm2 save`,
      },
      {
        title: "Docker Documentation",
        type: "link",
        url: "https://docs.docker.com/get-started/",
      },
      {
        title: "GitHub Actions Docs",
        type: "link",
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Interactive Rebase (last N commits)",
        type: "command",
        content: `git rebase -i HEAD~3`,
      },
      {
        title: "Remove Dangling Docker Resources",
        type: "command",
        content: `docker system prune -af --volumes`,
      },
      {
        title: "Kill Process on Port",
        type: "command",
        isPinned: true,
        content: `lsof -ti :3000 | xargs kill -9`,
      },
      {
        title: "Outdated Packages Report",
        type: "command",
        content: `npm outdated --long`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS Documentation",
        type: "link",
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui Components",
        type: "link",
        url: "https://ui.shadcn.com",
      },
      {
        title: "Radix UI Primitives",
        type: "link",
        url: "https://www.radix-ui.com/primitives",
      },
      {
        title: "Lucide Icons",
        type: "link",
        url: "https://lucide.dev/icons",
      },
    ],
  },
];

// ─── Main ────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Remove stale system types not in our list, then upsert
  const validNames = systemItemTypes.map((t) => t.name);
  await prisma.itemType.deleteMany({
    where: { isSystem: true, name: { notIn: validNames } },
  });

  console.log("Creating system item types...");
  const typeMap = new Map<string, string>();

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    });

    const record = existing
      ? await prisma.itemType.update({
          where: { id: existing.id },
          data: { icon: type.icon, color: type.color },
        })
      : await prisma.itemType.create({
          data: {
            name: type.name,
            icon: type.icon,
            color: type.color,
            isSystem: true,
          },
        });

    typeMap.set(type.name, record.id);
    console.log(`  ✓ ${type.name}`);
  }

  // 2. Upsert demo user
  console.log("\nCreating demo user...");
  const hashedPassword = await hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ ${user.email}`);

  // 3. Delete existing demo data (idempotent re-run)
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.collection.deleteMany({ where: { userId: user.id } });

  // 4. Create collections and items
  console.log("\nCreating collections and items...");

  for (const col of collections) {
    const collection = await prisma.collection.create({
      data: {
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite ?? false,
        userId: user.id,
      },
    });
    console.log(`  📁 ${col.name}`);

    for (const item of col.items) {
      const typeId = typeMap.get(item.type);
      if (!typeId) throw new Error(`Unknown type: ${item.type}`);

      const isLink = item.type === "link";

      const created = await prisma.item.create({
        data: {
          title: item.title,
          content: isLink ? null : item.content ?? null,
          contentType: isLink ? "URL" : "TEXT",
          url: isLink ? item.url ?? null : null,
          language: item.language ?? null,
          isPinned: item.isPinned ?? false,
          isFavorite: item.isFavorite ?? false,
          userId: user.id,
          itemTypeId: typeId,
          collections: {
            create: { collectionId: collection.id },
          },
        },
      });
      console.log(`    • ${created.title}`);
    }
  }

  console.log("\n✅ Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
