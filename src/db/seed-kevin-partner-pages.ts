import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { sites, pages, pageSections } from "./schema";

// Adds three new pages (partner-agency landing pages, one per language) to
// the kevin site, without touching any of its existing pages or their
// content. Safe to re-run: pages are upserted by (siteId, slug), and only
// this script's own three pageSlugs are cleared before re-inserting their
// sections — home/properties/contact/booking-success/booking-cancel/global
// are never read from or written to.
const PARTNER_SLUGS = ["partners-fr", "partners-es", "partners-en"] as const;

const PAGE_TITLES: Record<(typeof PARTNER_SLUGS)[number], string> = {
  "partners-fr": "Partner agencies – French",
  "partners-es": "Partner agencies – Spanish",
  "partners-en": "Partner agencies – English",
};

type SeedFile = {
  site: string;
  pages: Record<string, Record<string, Record<string, unknown>>>;
};

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "kevin")).limit(1);
  if (!site) throw new Error("Site 'kevin' not found — run db:seed first.");

  const seedPath = join(__dirname, "partner-pages-seed.json");
  const seed: SeedFile = JSON.parse(readFileSync(seedPath, "utf-8"));
  if (seed.site !== "kevin") throw new Error(`Seed file is for site '${seed.site}', not 'kevin'.`);

  for (const slug of PARTNER_SLUGS) {
    if (!seed.pages[slug]) throw new Error(`Seed file is missing page '${slug}'.`);
  }

  // Upsert the three page entries only — existing pages (home, properties,
  // contact, booking-success, booking-cancel, global) are never touched.
  await db
    .insert(pages)
    .values(
      PARTNER_SLUGS.map((slug, i) => ({
        siteId: site.id,
        slug,
        title: PAGE_TITLES[slug],
        icon: "handshake",
        order: 6 + i,
      })),
    )
    .onConflictDoUpdate({
      target: [pages.siteId, pages.slug],
      set: { title: sql`excluded.title`, icon: sql`excluded.icon`, order: sql`excluded."order"` },
    });

  // Clear only these three pages' sections before re-inserting — scoped
  // with an explicit pageSlug filter so no other page's sections can ever
  // be touched, even by mistake.
  await db
    .delete(pageSections)
    .where(and(eq(pageSections.siteId, site.id), inArray(pageSections.pageSlug, [...PARTNER_SLUGS])));

  const rows: (typeof pageSections.$inferInsert)[] = [];
  for (const slug of PARTNER_SLUGS) {
    const page = seed.pages[slug];
    let order = 0;
    for (const [sectionKey, content] of Object.entries(page)) {
      rows.push({ siteId: site.id, pageSlug: slug, sectionKey, order: order++, content });
    }
  }
  await db.insert(pageSections).values(rows);

  console.log(`Seeded ${PARTNER_SLUGS.length} partner pages (${rows.length} sections) for ${site.name}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
