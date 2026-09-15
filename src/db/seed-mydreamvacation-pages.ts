import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pageSections } from "./schema";

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "mydreamvacation")).limit(1);
  if (!site) throw new Error("Site 'mydreamvacation' not found — run db:seed first.");

  await db.delete(pageSections).where(eq(pageSections.siteId, site.id));

  await db.insert(pageSections).values([
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "hero",
      order: 0,
      content: {
        heading: "Direct booking, no middleman",
        subheading: "Find your dream stay, reserved directly.",
        description: "Short term rental vacation homes in Florida and Ontario, Canada.",
        stats: ["4.5 average rating", "0% platform fees"],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "collection_overview",
      order: 1,
      content: { text: "3 homes across Florida and Ontario, Canada" },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "about",
      order: 2,
      content: {
        heading: "A small, hand-picked collection of waterfront homes.",
        description:
          "My Dream Vacation Rentals lists a handful of homes — a boater's canal house in Southwest Florida and two waterfront properties in Killaloe, Ontario. Every stay is booked the same way: directly, by email, without a platform in between.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "key_features",
      order: 3,
      content: {
        items: [
          {
            title: "Waterfront, always",
            text: "Every home in the collection sits directly on the water — canal, lake or beachfront — in Florida or Ontario, Canada.",
          },
          {
            title: "Booked by email, direct",
            text: "No booking platform in between — reach out directly and we'll confirm availability and pricing with you personally.",
          },
          {
            title: "Pet-friendly stays",
            text: "All three homes welcome well-behaved pets, with no extra platform fee to bring them along.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "amenities",
      order: 4,
      content: {
        heading: "The comforts you'd expect from a 5-star hotel, in a home of your own.",
        subheading:
          "No hunting for hidden fees or missing basics — these standards apply across every home in the My Dream Vacation collection.",
        items: [
          "Waterfront & beach access",
          "Boat & Gulf access",
          "Private pools & hot tubs",
          "Air conditioning",
          "Full kitchens",
          "Internet included",
          "Pet-friendly",
          "Booked direct",
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "faq_intro",
      order: 5,
      content: {
        heading: "Questions, answered",
        subheading: "Everything you need to know before you book.",
        callout:
          "Can't find what you're looking for? Reach out to our concierge team and we'll get back to you within the hour.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "cta",
      order: 6,
      content: {
        heading: "Ready when you are",
        subheading: "Your next dream stay is one direct booking away.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "hero",
      order: 0,
      content: {
        heading: "Get in touch",
        subheading: "We're here to help plan your stay.",
        description:
          "Whether you're comparing homes, need a custom quote for a group, or have a question about a specific property, email us directly and we'll get back to you personally.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "footer_links",
      order: 0,
      content: {
        explore: ["All listings", "About us", "Amenities", "FAQ"],
        legal: ["Privacy Policy", "Terms and conditions", "Cookie Preferences"],
      },
    },
  ]);

  console.log(`Seeded 9 page sections for ${site.name}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
