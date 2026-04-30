import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Livio Land...");

  // Demo users
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const adminPasswordHash = await bcrypt.hash("GoLivio2026$", 10);

  // Admin account — granted admin on every seed (idempotent)
  await prisma.user.upsert({
    where: { email: "ethan@golivio.com" },
    update: { isAdmin: true },
    create: {
      email: "ethan@golivio.com",
      passwordHash: adminPasswordHash,
      name: "Ethan Sargent",
      company: "Livio",
      role: "both",
      isAdmin: true,
    },
  });


  const supplier1 = await prisma.user.upsert({
    where: { email: "ops@northstar-dc.com" },
    update: {},
    create: {
      email: "ops@northstar-dc.com",
      passwordHash,
      name: "Sarah Chen",
      company: "NorthStar Data Centers",
      role: "supplier",
    },
  });

  const supplier2 = await prisma.user.upsert({
    where: { email: "land@texasgrid.com" },
    update: {},
    create: {
      email: "land@texasgrid.com",
      passwordHash,
      name: "Marcus Reeves",
      company: "TexasGrid Holdings",
      role: "supplier",
    },
  });

  const supplier3 = await prisma.user.upsert({
    where: { email: "deals@cascadepower.com" },
    update: {},
    create: {
      email: "deals@cascadepower.com",
      passwordHash,
      name: "Priya Patel",
      company: "Cascade Power Partners",
      role: "supplier",
    },
  });

  const offtaker = await prisma.user.upsert({
    where: { email: "demo@offtaker.com" },
    update: {},
    create: {
      email: "demo@offtaker.com",
      passwordHash,
      name: "Demo Off-taker",
      company: "Acme AI",
      role: "offtaker",
    },
  });

  // Wipe any existing demo listings — we go to market with an empty catalog.
  // The `demo` supplier accounts above stay so QA flows still work, but they
  // own no listings. Real users sign up via /auth/signup and create real listings.
  await prisma.dataCenterListing.deleteMany({
    where: { ownerId: { in: [supplier1.id, supplier2.id, supplier3.id] } },
  });
  await prisma.poweredLandListing.deleteMany({
    where: { ownerId: { in: [supplier1.id, supplier2.id, supplier3.id] } },
  });
  // Suppress unused-variable warnings; these symbols are referenced by deleteMany only.
  void offtaker;

  console.log("✓ Seed complete");
  console.log("  Demo accounts (password: demo1234):");
  console.log("    ops@northstar-dc.com  (DC supplier)");
  console.log("    land@texasgrid.com    (Land supplier)");
  console.log("    deals@cascadepower.com (Mixed supplier)");
  console.log("    demo@offtaker.com     (Off-taker)");
  console.log("  Admin: ethan@golivio.com (password GoLivio2026$)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
