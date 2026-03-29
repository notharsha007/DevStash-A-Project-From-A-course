import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`System Item Types (${itemTypes.length}):\n`);
  for (const type of itemTypes) {
    console.log(`  ${type.name} — icon: ${type.icon}, color: ${type.color}`);
  }

  // Demo user
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: {
      _count: { select: { items: true, collections: true } },
    },
  });

  if (user) {
    console.log(`\nDemo User:`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  isPro: ${user.isPro}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    console.log(`  Items: ${user._count.items}`);
    console.log(`  Collections: ${user._count.collections}`);
  } else {
    console.log("\n⚠ Demo user not found");
  }

  // Collections with item counts
  const collections = await prisma.collection.findMany({
    where: { user: { email: "demo@devstash.io" } },
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nCollections (${collections.length}):\n`);
  for (const col of collections) {
    console.log(`  📁 ${col.name} — ${col.description}`);
    for (const ic of col.items) {
      const item = ic.item;
      const typeLabel = item.itemType.name;
      const detail =
        item.contentType === "URL"
          ? item.url
          : item.language
            ? `${item.language}`
            : "text";
      console.log(`     • [${typeLabel}] ${item.title} (${detail})`);
    }
  }

  // Table counts
  const [users, items, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.tag.count(),
  ]);

  console.log(`\nTable Counts:`);
  console.log(`  Users: ${users}`);
  console.log(`  Items: ${items}`);
  console.log(`  Collections: ${collections.length}`);
  console.log(`  Tags: ${tags}`);

  console.log("\n✅ Database connection successful!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Database connection failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
