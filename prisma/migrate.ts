/**
 * Post-deploy idempotent migration. Runs as part of the Railway build pipeline
 * after `prisma db push`. Safe to run repeatedly.
 *
 * - Marks existing listings as approved (so the new admin-approval workflow
 *   doesn't make production listings disappear when the column is added).
 * - Bootstraps Ethan and Nav as admins.
 * - Deletes the original demo listings owned by seed users so we go to market
 *   with an empty catalog instead of fake stand-in data.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  "ethan@golivio.com",
  "navneet@golivio.com",
  "nav@golivio.com",
];

// Anything owned by these accounts is demo / seeded data and should be removed.
// The accounts themselves stay (used for QA), but their listings + Q&A go away.
const DEMO_SUPPLIER_EMAILS = [
  "ops@northstar-dc.com",
  "land@texasgrid.com",
  "deals@cascadepower.com",
];

async function main() {
  console.log("→ Running post-deploy migrations...");

  // 1. Backfill: any DC/Land listing created before approvalStatus existed will
  //    have approvalStatus="pending" (the schema default). Auto-approve those
  //    so the public site still shows them. NEW listings created after this
  //    deploy will go in as pending and require admin review.
  const dcUnreviewed = await prisma.dataCenterListing.findMany({
    where: { approvalStatus: "pending", approvedAt: null },
    select: { id: true, createdAt: true },
  });
  if (dcUnreviewed.length > 0) {
    // Only auto-approve listings older than 1 hour (older than this migration run).
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const idsToApprove = dcUnreviewed
      .filter((l) => l.createdAt < oneHourAgo)
      .map((l) => l.id);
    if (idsToApprove.length > 0) {
      const r = await prisma.dataCenterListing.updateMany({
        where: { id: { in: idsToApprove } },
        data: { approvalStatus: "approved", approvedAt: new Date() },
      });
      console.log(`  ✓ Auto-approved ${r.count} pre-existing DC listings`);
    }
  }

  const landUnreviewed = await prisma.poweredLandListing.findMany({
    where: { approvalStatus: "pending", approvedAt: null },
    select: { id: true, createdAt: true },
  });
  if (landUnreviewed.length > 0) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const idsToApprove = landUnreviewed
      .filter((l) => l.createdAt < oneHourAgo)
      .map((l) => l.id);
    if (idsToApprove.length > 0) {
      const r = await prisma.poweredLandListing.updateMany({
        where: { id: { in: idsToApprove } },
        data: { approvalStatus: "approved", approvedAt: new Date() },
      });
      console.log(`  ✓ Auto-approved ${r.count} pre-existing land listings`);
    }
  }

  // 2. Promote Ethan + Nav to admins (idempotent — only runs UPDATE if isAdmin=false).
  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isAdmin: true },
    });
    if (user && !user.isAdmin) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
      console.log(`  ✓ Promoted ${email} to admin`);
    }
  }

  // 3. Delete every listing owned by the demo seed accounts. Cascade handles
  //    Q&A, photos, messages on the listings. Idempotent — runs every deploy
  //    but only does work when there's something to delete.
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: DEMO_SUPPLIER_EMAILS } },
    select: { id: true },
  });
  if (demoUsers.length > 0) {
    const ownerIds = demoUsers.map((u) => u.id);
    const deletedDc = await prisma.dataCenterListing.deleteMany({
      where: { ownerId: { in: ownerIds } },
    });
    const deletedLand = await prisma.poweredLandListing.deleteMany({
      where: { ownerId: { in: ownerIds } },
    });
    if (deletedDc.count + deletedLand.count > 0) {
      console.log(
        `  ✓ Removed ${deletedDc.count} demo DC listings + ${deletedLand.count} demo land listings`,
      );
    }
  }

  console.log("✓ Migrations complete");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
