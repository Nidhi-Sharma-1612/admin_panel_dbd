import "dotenv/config";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { sites, users, userSites, pages } from "./schema";

const DEFAULT_PAGES = [
  { slug: "home", title: "Home", icon: "home" },
  { slug: "properties", title: "Properties", icon: "building" },
  { slug: "about", title: "About Us", icon: "users" },
  { slug: "contact", title: "Contact", icon: "phone" },
  { slug: "privacy-policy", title: "Privacy Policy", icon: "shield" },
  { slug: "terms", title: "Terms & Conditions", icon: "file-text" },
  { slug: "global", title: "Global (Navbar & Footer)", icon: "globe" },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@designbydial.com";
  // No hardcoded default — a fixed fallback password would end up committed
  // to source and become a known credential for every deployment that
  // forgets to set this. Generate a random one-time password instead and
  // print it, unless the caller supplies their own via the env var.
  const generatedPassword = randomBytes(9).toString("base64url");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? generatedPassword;

  const [user] = await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Design by Dial Admin",
    })
    .onConflictDoNothing()
    .returning();

  const siteDefs = [
    { slug: "mydreamvacation", name: "My Dream Vacation Rentals", domain: "mydreamvacation.net" },
    { slug: "kevin", name: "La Conciergerie Del Sol", domain: "kevin.weblaucher.com" },
    { slug: "louise", name: "E Komo Mai Vacation Rentals", domain: "louise.weblaucher.com" },
    { slug: "vip", name: "Book VIP Homes", domain: "vip.weblaucher.com" },
  ];

  for (const def of siteDefs) {
    const [site] = await db.insert(sites).values(def).onConflictDoNothing().returning();
    if (!site) continue;

    if (user) {
      await db.insert(userSites).values({ userId: user.id, siteId: site.id }).onConflictDoNothing();
    }

    await db
      .insert(pages)
      .values(DEFAULT_PAGES.map((p) => ({ ...p, siteId: site.id })))
      .onConflictDoNothing();

    console.log(`Seeded site: ${site.name} (${site.slug})`);
  }

  if (user) {
    console.log(`\nAdmin login: ${adminEmail} / ${adminPassword}`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log("(This password was randomly generated — save it, it won't be shown again.)");
    }
  } else {
    console.log(`\nAdmin user ${adminEmail} already exists — password unchanged.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
