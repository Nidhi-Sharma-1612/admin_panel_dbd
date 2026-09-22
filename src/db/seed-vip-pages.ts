import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pages, pageSections, siteSettings } from "./schema";

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "vip")).limit(1);
  if (!site) throw new Error("Site 'vip' not found — run db:seed first.");

  // The default page set from db:seed ("about", "terms") doesn't match this
  // frontend's actual routes, so the page list is replaced with exactly the
  // pages this frontend renders. Listings themselves (and reviews, amenities,
  // the FAQ answers, cities) come live from Hostaway and aren't editable here
  // — only the fixed marketing copy around them is.
  await db.delete(pages).where(eq(pages.siteId, site.id));
  await db.insert(pages).values(
    [
      { slug: "home", title: "Home", icon: "home" },
      { slug: "properties", title: "All Homes", icon: "building" },
      { slug: "contact", title: "Contact", icon: "phone" },
      { slug: "booking-confirmed", title: "Booking Confirmed", icon: "file-text" },
      { slug: "global", title: "Global (Navbar & Footer)", icon: "globe" },
    ].map((p, i) => ({ ...p, order: i, siteId: site.id })),
  );

  await db.delete(pageSections).where(eq(pageSections.siteId, site.id));

  await db.insert(pageSections).values([
    // ─────────────────────────── Home ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "hero",
      order: 0,
      content: {
        badge: "Book Direct. Stay VIP.",
        heading: "Furnished homes for every kind of stay.",
        description:
          "Vacation trip, work crew, or a family between homes — book straight with us and skip the third-party markup.",
        posterImage: "/images/cottage1-b.jpg",
        video: "/videos/hero-loop.mp4",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "about",
      order: 1,
      content: {
        eyebrow: "About us",
        paragraph1:
          "Book VIP Homes is a small, family-run collection of homes — three and four bedrooms, room for the whole group, and a host who answers his own email. No call centers, no faceless platforms — just a direct line to your stay and the VIP treatment that comes with it.",
        paragraph2:
          "Our homes are spread across Texas — each one a genuine All-American cottage with room to spread out, a full kitchen, and air conditioning that actually keeps up with the heat. Traveling with pets or need more than a weekend? Some homes are pet-friendly and set up for extended stays, because VIP treatment shouldn't stop after one night.",
        paragraph3Prefix: "Questions before you book? Eddie reads every message at",
        hostName: "Eddie",
        hostTitle: "Your host",
        image: "/images/cottage2-a.jpg",
        ratingLabel: "avg. guest rating",
        homesLabel: "homes to choose from",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "listings",
      order: 2,
      content: {
        eyebrow: "Our homes",
        heading: "Pick your home base",
        description:
          "Every home comes with free WiFi, a full kitchen, and air conditioning — because comfort shouldn't be optional.",
        viewAllLabel: "View all homes",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "amenities",
      order: 3,
      content: {
        eyebrow: "What's included",
        description:
          "Every VIP home comes stocked with the essentials — plus a few extras at select properties.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "testimonials",
      order: 4,
      content: {
        eyebrow: "What guests say",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "faq",
      order: 5,
      content: {
        eyebrow: "Common questions",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "cta",
      order: 6,
      content: {
        badge: "Ready when you are",
        headingPlain: "Book Direct.",
        headingAccent: "Stay VIP.",
        description:
          "Browse our homes, pick your dates, and let Eddie take it from there — no call centers, no middlemen, just the VIP treatment every guest deserves.",
        primaryLabel: "Browse our homes",
        secondaryLabel: "Contact",
        image: "/images/lucile-e.jpg",
      },
    },

    // ─────────────────────────── Properties ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "intro",
      order: 0,
      content: {
        heading: "All our homes",
        description: "Every VIP Homes property across Texas, in one place.",
      },
    },

    // ─────────────────────────── Contact ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "intro",
      order: 0,
      content: {
        heading: "Get in touch",
        description:
          "Questions about a home, your dates, or anything else — Eddie reads every message personally and answers directly, no call center in between.",
        emailLabel: "Email",
        responseTimeLabel: "Response time",
        responseTimeText: "Usually within a few hours — Eddie answers his own email.",
        beforeYouBookLabel: "Before you book",
        beforeYouBookPrefix: "Have a question about a specific home? Browse",
        beforeYouBookLinkLabel: "all our homes",
        beforeYouBookSuffix: "first, then mention which one in your message.",
      },
    },

    // ─────────────────────────── Booking confirmed ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "booking-confirmed",
      sectionKey: "content",
      order: 0,
      content: {
        successNote: "A confirmation has been sent by Stripe to the email you paid with.",
        totalLabel: "Total paid",
        browseMoreLabel: "Browse more homes",
        failedHeading: "We couldn't confirm this booking",
        backToHomeLabel: "Back to",
      },
    },

    // ─────────────────────────── Global ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "navbar",
      order: 0,
      content: {
        links: ["Home", "About", "All listings", "Amenities", "Reviews", "FAQ"],
        contactLabel: "Contact",
        tagline: "by Valencia Investment Properties",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "footer",
      order: 1,
      content: {
        exploreHeading: "Explore",
        legalHeading: "Legal",
        privacyLabel: "Privacy Policy",
        termsLabel: "Terms and conditions",
        cookieLabel: "Cookie Preferences",
        contactHeading: "Get in touch",
        copyrightNote: "a Valencia Investment Properties company. All rights reserved.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "seo",
      order: 2,
      content: {
        title: "Book VIP Homes | Book Direct. Stay VIP.",
        description:
          "Furnished, direct-booking rental homes by Valencia Investment Properties. Pet-friendly, three and four bedroom homes across Texas, with a real host who picks up the phone.",
      },
    },
  ]);

  const settings = {
    siteName: "Book VIP Homes",
    email: "eddie@bookviphomes.com",
    footerTagline:
      "Furnished, direct-booking homes across Texas — with a real host who picks up the phone.",
    copyrightName: "Book VIP Homes",
    updatedAt: new Date(),
  };
  await db
    .insert(siteSettings)
    .values({ siteId: site.id, ...settings })
    .onConflictDoUpdate({ target: siteSettings.siteId, set: settings });

  console.log(`Seeded page sections and settings for ${site.name}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
