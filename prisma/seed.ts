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

  // Wipe existing demo listings to keep idempotent
  await prisma.dataCenterListing.deleteMany({
    where: { ownerId: { in: [supplier1.id, supplier2.id, supplier3.id] } },
  });
  await prisma.poweredLandListing.deleteMany({
    where: { ownerId: { in: [supplier1.id, supplier2.id, supplier3.id] } },
  });

  // DC Listings
  const dc1 = await prisma.dataCenterListing.create({
    data: {
      ownerId: supplier1.id,
      title: "50 MW immediately available — Northern Virginia",
      location: "Ashburn, VA",
      totalCapacityMW: 120,
      availableMW: 50,
      availabilityDate: new Date("2026-06-01"),
      ratePerKWh: 0.082,
      pricingModel: "per-kWh",
      contractMinYears: 7,
      tier: "Tier III",
      pue: 1.32,
      coolingType: "liquid",
      powerDensityKWPerRack: 35,
      network: "Equinix Metro Connect, AWS Direct Connect, Lumen, Cogent, Zayo",
      certifications: "SOC 2 Type II, ISO 27001, PCI DSS",
      description:
        "Recently expanded campus with diverse fiber paths and dual-feed utility. Supports liquid-cooled GPU deployments up to 50kW/rack with engineering review.",
    },
  });

  const dc2 = await prisma.dataCenterListing.create({
    data: {
      ownerId: supplier1.id,
      title: "20 MW available Q3 2026 — Hillsboro, OR",
      location: "Hillsboro, OR",
      totalCapacityMW: 60,
      availableMW: 20,
      availabilityDate: new Date("2026-09-15"),
      ratePerKWh: 0.061,
      pricingModel: "per-kWh",
      contractMinYears: 5,
      tier: "Tier III",
      pue: 1.18,
      coolingType: "hybrid",
      powerDensityKWPerRack: 25,
      network: "Multiple Tier 1 carriers, AWS, Azure, GCP onramps",
      certifications: "SOC 2, ISO 27001",
      description:
        "Pacific Northwest hydro-backed power. Free cooling 8 months of the year delivers industry-leading PUE.",
    },
  });

  const dc3 = await prisma.dataCenterListing.create({
    data: {
      ownerId: supplier3.id,
      title: "10 MW HPC-ready — Quincy, WA",
      location: "Quincy, WA",
      totalCapacityMW: 25,
      availableMW: 10,
      availabilityDate: new Date("2026-05-01"),
      ratePerKWh: 0.045,
      pricingModel: "per-kWh",
      contractMinYears: 3,
      tier: "Tier II",
      pue: 1.22,
      coolingType: "immersion",
      powerDensityKWPerRack: 80,
      network: "NoaNet, Lumen",
      description:
        "Purpose-built for crypto / HPC workloads. Immersion-cooled racks support extreme density.",
    },
  });

  // Land Listings
  const land1 = await prisma.poweredLandListing.create({
    data: {
      ownerId: supplier2.id,
      title: "300 MW ERCOT site — Abilene, TX",
      location: "Abilene, TX",
      acres: 540,
      availableMW: 300,
      utilityProvider: "ERCOT — Oncor",
      substationDistanceMiles: 0.8,
      ppaStatus: "in-negotiation",
      ppaPricePerMWh: 38,
      interconnectionStage: "facility-study",
      expectedEnergization: new Date("2027-09-01"),
      waterAvailable: "limited",
      waterSourceNotes:
        "Municipal connection ~3 miles. Grey water reuse permitting in progress.",
      fiberAvailable: "near",
      zoning: "Heavy industrial (M-2)",
      askingPrice: 18000000,
      pricingModel: "sale",
      description:
        "Large flat parcel adjacent to existing transmission. Letter of authorization secured with Oncor. Adjacent to rail.",
    },
  });

  const land2 = await prisma.poweredLandListing.create({
    data: {
      ownerId: supplier2.id,
      title: "150 MW MISO site — Council Bluffs, IA",
      location: "Council Bluffs, IA",
      acres: 220,
      availableMW: 150,
      utilityProvider: "MidAmerican Energy",
      substationDistanceMiles: 1.5,
      ppaStatus: "available",
      interconnectionStage: "study",
      expectedEnergization: new Date("2028-01-01"),
      waterAvailable: "yes",
      waterSourceNotes: "Missouri River access; municipal redundancy.",
      fiberAvailable: "yes",
      zoning: "I-2",
      askingPrice: 9000000,
      pricingModel: "sale",
      description:
        "Excellent climate for free cooling. Wind-heavy generation mix in MISO supports green PPAs.",
    },
  });

  const land3 = await prisma.poweredLandListing.create({
    data: {
      ownerId: supplier3.id,
      title: "75 MW LGIA-executed site — Yakima, WA",
      location: "Yakima, WA",
      acres: 130,
      availableMW: 75,
      utilityProvider: "PacifiCorp",
      substationDistanceMiles: 0.3,
      ppaStatus: "signed",
      ppaPricePerMWh: 42,
      interconnectionStage: "LGIA",
      expectedEnergization: new Date("2026-12-01"),
      waterAvailable: "yes",
      waterSourceNotes: "Senior water rights conveyed with parcel. ~600 gpm.",
      fiberAvailable: "near",
      zoning: "Heavy industrial",
      askingPrice: 12500000,
      pricingModel: "JV",
      description:
        "Shovel-ready. Owner open to JV structure with experienced DC operator.",
    },
  });

  // Sample questions & answers
  const q1 = await prisma.question.create({
    data: {
      body: "What's the lead time on liquid cooling commissioning for new tenants?",
      askerId: offtaker.id,
      dcListingId: dc1.id,
    },
  });
  await prisma.answer.create({
    data: {
      body: "Typical commissioning is 8-10 weeks from contract signing for liquid-cooled white space. We can accelerate to 6 weeks for committed tenants > 5MW.",
      questionId: q1.id,
      responderId: supplier1.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      body: "Is there a path to expand beyond 300 MW on this parcel? Any adjacent land you control?",
      askerId: offtaker.id,
      landListingId: land1.id,
    },
  });
  await prisma.answer.create({
    data: {
      body: "Yes — we have an option on an adjacent 280-acre parcel that could support an additional 200 MW with substation expansion. Happy to walk through the topology under NDA.",
      questionId: q2.id,
      responderId: supplier2.id,
    },
  });

  await prisma.question.create({
    data: {
      body: "What's the current condition of the access roads? Heavy equipment ingress will be needed.",
      askerId: offtaker.id,
      landListingId: land3.id,
    },
  });

  console.log("✓ Seed complete");
  console.log("  Demo accounts (password: demo1234):");
  console.log("    ops@northstar-dc.com  (DC supplier)");
  console.log("    land@texasgrid.com    (Land supplier)");
  console.log("    deals@cascadepower.com (Mixed supplier)");
  console.log("    demo@offtaker.com     (Off-taker)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
