import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const KEEP_EMAIL = "demo@devstash.io";

async function main() {
  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No users to delete — only the demo user exists.");
    return;
  }

  console.log(`Found ${usersToDelete.length} user(s) to delete:\n`);
  for (const user of usersToDelete) {
    console.log(`  ${user.email} (${user.id})`);
  }

  const userIds = usersToDelete.map((u) => u.id);

  // Cascading deletes handle most relations, but clean up
  // orphaned tags and verification tokens explicitly.
  const [items, collections, accounts, sessions, users] = await prisma.$transaction([
    prisma.item.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.collection.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.account.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.session.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);

  // Remove orphaned tags (tags with no items)
  const orphanedTags = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  });

  // Remove any leftover verification tokens for deleted users
  const deletedEmails = usersToDelete.map((u) => u.email);
  const tokens = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: deletedEmails } },
  });

  console.log("\nDeleted:");
  console.log(`  Users:        ${users.count}`);
  console.log(`  Items:        ${items.count}`);
  console.log(`  Collections:  ${collections.count}`);
  console.log(`  Accounts:     ${accounts.count}`);
  console.log(`  Sessions:     ${sessions.count}`);
  console.log(`  Orphan tags:  ${orphanedTags.count}`);
  console.log(`  Tokens:       ${tokens.count}`);
  console.log("\nDone — demo@devstash.io preserved.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Clean-users failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
