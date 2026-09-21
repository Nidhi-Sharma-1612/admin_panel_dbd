import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pages, pageSections, siteSettings, faqs } from "./schema";

// Homepage photos are the Lodgify listing photos the site was already
// showing (hero/welcome/concierge/etc. were picked live from the property
// catalogue). Seeding them as plain URLs means every image slot shows up in
// the admin as a replaceable image field, while the site looks identical on
// day one. Clearing a slot in the admin makes the frontend fall back to its
// automatic Lodgify pick again.
const IMG = {
  hero: [
    "https://l.icdbcdn.com/oh/14058f9b-6425-4a1e-b35d-29c860d7a458.jpg?f=32",
    "https://l.icdbcdn.com/oh/98a82f75-4bbc-49e5-9f56-ce31a277b200.jpg?f=32",
    "https://l.icdbcdn.com/oh/2e5a1f0d-eb4d-4b0a-a0e6-6372c3883ba1.jpg?f=32",
  ],
  welcome: [
    "https://l.icdbcdn.com/oh/bf1256e7-31ce-4b5c-8baf-19f6bd55f5df.jpg?f=32",
    "https://l.icdbcdn.com/oh/e85df100-f887-4eee-99f5-003d65fe553c.jpg?f=32",
    "https://l.icdbcdn.com/oh/8185df9a-e5f9-47a0-bc43-a8526c7f42e7.jpg?f=32",
    "https://l.icdbcdn.com/oh/6e0eee6c-b07a-4af7-b15c-cdd38b22aba2.jpg?f=32",
    "https://l.icdbcdn.com/oh/6d5ef51b-6006-4629-a86a-48764eae5a98.jpg?f=32",
  ],
  concierge: [
    "https://l.icdbcdn.com/oh/875bffbb-bef8-4f29-86ea-5924135dba8e.jpg?f=32",
    "https://l.icdbcdn.com/oh/8062f139-7377-45a2-a2da-3a18989104e5.jpg?f=32",
    "https://l.icdbcdn.com/oh/9c5b6090-f578-4145-99b5-629a8e08e729.jpg?f=32",
  ],
  pool: "https://l.icdbcdn.com/oh/a2d791bb-5dee-41d1-8f04-4d4f007a14be.jpg?f=32",
  comfort: "https://l.icdbcdn.com/oh/4493cf1f-30e2-4fac-9476-b8f12f8c860e.jpg?f=32",
  cta: "https://l.icdbcdn.com/oh/ffc845f6-31af-45e5-a2f6-b837e0445900.jpg?f=32",
};

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "kevin")).limit(1);
  if (!site) throw new Error("Site 'kevin' not found — run db:seed first.");

  // The default page set from db:seed includes About/Privacy/Terms, which
  // this site doesn't have, and lacks the booking result pages — so the
  // page list is replaced with exactly the pages this frontend renders.
  await db.delete(pages).where(eq(pages.siteId, site.id));
  await db.insert(pages).values(
    [
      { slug: "home", title: "Home", icon: "home" },
      { slug: "properties", title: "Properties", icon: "building" },
      { slug: "contact", title: "Contact", icon: "phone" },
      { slug: "booking-success", title: "Booking Success", icon: "file-text" },
      { slug: "booking-cancel", title: "Booking Cancelled", icon: "file-text" },
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
        eyebrow: "Torremolinos · Costa del Sol · Spain",
        heading: "Book your holidays under the Andalusian sun",
        description:
          "Curated apartments with sea views, private pools and a dedicated concierge team — the heart of vibrant, seaside Torremolinos.",
        image1: IMG.hero[0],
        image2: IMG.hero[1],
        image3: IMG.hero[2],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "welcome",
      order: 1,
      content: {
        eyebrow: "Welcome",
        heading: "Welcome to Andalusia!",
        paragraphs: [
          "Welcome to Andalusia and to our charming apartments, carefully managed by La Conciergerie del Sol.",
          "Immerse yourself in the essence of Andalusian living by staying in one of our magnificent properties, located in the heart of this vibrant seaside town. Whether you're looking for a seaside getaway, a cultural stay, or a total immersion in local gastronomy, our dedicated team is here to make your experience unforgettable.",
        ],
        apartmentsLabel: "Apartments",
        neighborhoodsLabel: "Neighborhoods",
        hospitalityBadge: "5★ Hospitality",
        linkLabel: "Discover our properties",
        homesCaption: "Homes across Torremolinos",
        image1: IMG.welcome[0],
        image2: IMG.welcome[1],
        image3: IMG.welcome[2],
        image4: IMG.welcome[3],
        image5: IMG.welcome[4],
        cornerImage: IMG.pool,
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "featured",
      order: 2,
      content: {
        eyebrow: "Handpicked",
        heading: "Featured stays",
        linkLabel: "View all properties",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "comfort",
      order: 3,
      content: {
        eyebrow: "Why stay with us",
        heading: "Comfort & Convenience",
        description:
          "Our apartments, carefully selected for their comfort and privileged location, are designed to make you feel instantly at home.",
        items: [
          {
            title: "Steps from the beach",
            text: "Most homes sit minutes from Torremolinos' golden sand and beachfront promenade.",
          },
          {
            title: "Carefully vetted stays",
            text: "Every apartment is personally inspected and maintained to our comfort standard.",
          },
          {
            title: "Spotless & well-equipped",
            text: "Fresh linens, full kitchens and thoughtful touches waiting on arrival.",
          },
          {
            title: "Local, Andalusian soul",
            text: "Curated recommendations for gastronomy, culture and hidden corners of the coast.",
          },
        ],
        image: IMG.comfort,
        badgeTitle: "Quality checked",
        badgeText: "Every stay, every time",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "concierge",
      order: 4,
      content: {
        eyebrow: "Our promise",
        heading: "Concierge Excellence",
        description:
          "As your dedicated concierge, we strive to exceed your expectations at every stage of your trip. From booking to arrival, we're here to answer your questions, provide local recommendations and ensure your stay goes off without a hitch.",
        promises: ["Always reachable", "Local expertise", "Peace of mind"],
        ctaLabel: "Talk to our concierge team",
        image1: IMG.concierge[0],
        image2: IMG.concierge[1],
        image3: IMG.concierge[2],
        badgeTitle: "5★ Hospitality",
        badgeText: "Rated by our guests",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "testimonials",
      order: 5,
      content: {
        eyebrow: "Guest stories",
        heading: "Loved by our guests",
        items: [
          {
            quote:
              "Our balcony overlooked the sea and the concierge team had everything ready before we even landed. Best stay we've had on the Costa del Sol.",
            name: "Sophie & Mark",
            detail: "Stayed in Santa Clara",
          },
          {
            quote:
              "Spotless apartment, fast WiFi, and the local restaurant recommendations were spot on. We'll be back every summer.",
            name: "Familie Weber",
            detail: "Stayed in La Nogalera",
          },
          {
            quote:
              "From check-in to check-out, everything was effortless. It felt like having a friend in Torremolinos.",
            name: "Elena R.",
            detail: "Stayed in City Centre",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "faq",
      order: 6,
      content: {
        eyebrow: "Good to know",
        heading: "Frequently asked questions",
        description:
          "Can't find what you're looking for? Our concierge team is always a message away.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "cta",
      order: 7,
      content: {
        eyebrow: "Book direct",
        heading: "Ready to feel the Andalusian sun?",
        description:
          "Browse our full collection of Torremolinos apartments and find your perfect seaside home.",
        primaryLabel: "Explore all properties",
        secondaryLabel: "Talk to our concierge",
        backgroundImage: IMG.cta,
      },
    },

    // ─────────────────────────── Contact ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Get in touch",
        heading: "We're here to help plan your stay",
        description:
          "Questions about a property, dates or local recommendations? Our concierge team in Torremolinos replies to every message personally.",
        replyPill: "Replies within a few hours",
        teamPill: "Local Torremolinos team",
        managedPillSuffix: "apartments managed",
        addressLabel: "Address",
        phoneLabel: "Phone",
        emailLabel: "Email",
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "map",
      order: 1,
      content: {
        heading: "Where we host",
        description: "Our apartments are spread across Torremolinos, Costa del Sol.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "faqNudge",
      order: 2,
      content: {
        heading: "Have a quick question?",
        text: "Check-in times, cancellation policy and more — our FAQ covers the essentials.",
        buttonLabel: "Read the FAQ",
      },
    },

    // ─────────────────────────── Properties ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "intro",
      order: 0,
      content: {
        heading: "Apartments in Torremolinos",
        description:
          "Hover a stay to locate it on the map, or explore the map to find your neighborhood.",
        emptyTitle: "No stays match your search",
        emptyText:
          "Try a different neighborhood or guest count, or browse everything we have.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "detail",
      order: 1,
      content: {
        backLabel: "Back to all properties",
        aboutHeading: "About this apartment",
        amenitiesHeading: "What this place offers",
        goodToKnowHeading: "Good to know",
        conciergeSupport: "24/7 concierge support",
        cancellationHeading: "Cancellation policy",
        cancellationFallback:
          "Cancellation terms depend on your dates and rate — your concierge will confirm the exact policy when you book.",
        cancellationNote:
          "Exact terms are confirmed with your concierge at the time of booking.",
        locationHeading: "Where you'll be",
        directionsLabel: "Get directions",
        conciergeTitle: "Managed by La Conciergerie Del Sol",
        conciergeText:
          "Our concierge team is on hand before, during and after your stay — questions answered, local recommendations included.",
        contactLabel: "Contact us",
        similarHeading: "You might also like",
      },
    },

    // ─────────────────────────── Booking ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "booking-success",
      sectionKey: "content",
      order: 0,
      content: {
        heading: "Booking confirmed",
        confirmedNote:
          "Your reservation has been created. A confirmation email will follow shortly.",
        pendingNote:
          "Our concierge team will follow up by email shortly to confirm the final details of your stay.",
        buttonLabel: "Browse more properties",
        failedHeading: "We couldn't confirm this payment",
        failedText:
          "If you completed a payment, please contact us and we'll sort it out — you have not been charged twice.",
        failedButtonLabel: "Back to properties",
      },
    },
    {
      siteId: site.id,
      pageSlug: "booking-cancel",
      sectionKey: "content",
      order: 0,
      content: {
        heading: "Checkout cancelled",
        text: "No payment was taken and your selected dates are still free — you're welcome to pick up where you left off any time.",
        buttonLabel: "Back to properties",
      },
    },

    // ─────────────────────────── Global ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "navbar",
      order: 0,
      content: {
        links: ["Home", "Properties", "Contact"],
        ctaLabel: "Book your stay",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "footer",
      order: 1,
      content: {
        exploreHeading: "Explore",
        exploreLinks: ["Home", "All Properties", "Contact Us"],
        neighborhoodsHeading: "Torremolinos",
        neighborhoods: ["Santa Clara", "La Nogalera", "Torre La Roca", "City Centre"],
        contactHeading: "Get in touch",
        copyrightNote: "All rights reserved. · Andalusia, Spain",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "seo",
      order: 2,
      content: {
        title: "La Conciergerie Del Sol | Torremolinos Vacation Rentals",
        description:
          "Curated apartments in Torremolinos, Costa del Sol — sea views, private pools and a dedicated concierge team for an unforgettable Andalusian stay.",
      },
    },
  ]);

  const settings = {
    siteName: "La Conciergerie Del Sol",
    phone: "+34 635 861 443",
    email: "Contact@laconciergeriedelsol.com",
    address: "Torremolinos, Costa del Sol, Spain",
    responseTimeNote: "We typically reply within a few hours.",
    footerTagline:
      "Curated apartments across Torremolinos, Costa del Sol — with a dedicated concierge team to make every stay unforgettable.",
    copyrightName: "La Conciergerie Del Sol",
    updatedAt: new Date(),
  };
  await db
    .insert(siteSettings)
    .values({ siteId: site.id, ...settings })
    .onConflictDoUpdate({ target: siteSettings.siteId, set: settings });

  await db.delete(faqs).where(eq(faqs.siteId, site.id));
  await db.insert(faqs).values(
    [
      {
        question: "What time is check-in and check-out?",
        answer:
          "Check-in is from 3:00 PM and check-out by 11:00 AM. Early check-in or late check-out can often be arranged with your concierge, subject to availability.",
      },
      {
        question: "What is your cancellation policy?",
        answer:
          "Cancellation terms vary by property and are confirmed at the time of booking. Your concierge will confirm the exact policy for your chosen apartment before you pay.",
      },
      {
        question: "Is there a minimum stay?",
        answer:
          "It depends on the apartment and the season — many have no minimum at all, though some require a few nights during peak periods. If a stay you've selected is too short, we'll flag the exact requirement for that property before you book.",
      },
      {
        question: "Do you offer airport transfers?",
        answer:
          "Yes — we can arrange private transfers to and from Málaga Airport. Just share your flight details with your concierge ahead of arrival.",
      },
      {
        question: "Are pets allowed?",
        answer:
          "Pet policies vary by apartment. Let us know when enquiring and we'll match you with a pet-friendly stay where possible.",
      },
    ].map((f, i) => ({ siteId: site.id, order: i, ...f })),
  );

  console.log(`Seeded page sections, settings and FAQs for ${site.name}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
