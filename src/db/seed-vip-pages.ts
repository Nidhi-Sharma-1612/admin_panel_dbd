import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pages, pageSections, siteSettings, faqs } from "./schema";

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "vip")).limit(1);
  if (!site) throw new Error("Site 'vip' not found — run db:seed first.");

  // These four images/video were originally seeded as the frontend's own
  // local /public paths (e.g. "/images/cottage1-b.jpg"). That renders fine
  // on the live site (Next serves them as static files there) but is
  // broken in the admin's own image/video preview, since "/images/..."
  // resolves against admin.weblaucher.com, not the vip frontend — so the
  // preview always showed empty. Uploaded once to this site's media store
  // and referenced here by their hosted URL instead, matching every other
  // seeded media field in this project.
  const M = `https://admin.weblaucher.com/api/media/sites/${site.id}/seed`;

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
      { slug: "privacy-policy", title: "Privacy Policy", icon: "shield" },
      { slug: "terms-and-conditions", title: "Terms & Conditions", icon: "file-text" },
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
        posterImage: `${M}/cottage1-b.jpg`,
        video: `${M}/hero-loop.mp4`,
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
        image: `${M}/cottage2-a.jpg`,
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
        // A snapshot of what's actually common across every listing today
        // (see MAX_SHOWN=6 in components/Amenities.tsx). Editing this list
        // freezes it to these exact labels; clear it to go back to picking
        // automatically from live Hostaway data.
        items: ["Free WiFi", "Kitchen", "Air conditioning", "Washing Machine", "Dryer", "Heating"],
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
        image: `${M}/lucile-e.jpg`,
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
    // The property detail page (/listings/[id]) itself. Everything here is
    // fixed copy around the listing — the listing's own name, photos,
    // description, amenities, house rules, reviews, and map location all
    // stay live from Hostaway and aren't editable here.
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "detail",
      order: 1,
      content: {
        breadcrumbHomeLabel: "Home",
        breadcrumbListingsLabel: "All listings",
        aboutHeading: "About this home",
        amenitiesHeading: "What this place offers",
        thingsToKnowHeading: "Things to know",
        checkInLabel: "Check-in",
        checkOutLabel: "Check-out",
        petsLabel: "Pets",
        smokingLabel: "Smoking",
        allowedLabel: "Allowed",
        notAllowedLabel: "Not allowed",
        cancellationHeading: "Cancellation policy",
        houseRulesHeading: "House rules",
        locationHeading: "Where you'll be",
        locationSuffix: "— exact address shared after booking.",
        approximateAreaLabel: "Approximate area",
        openMapsLabel: "Open in Google Maps",
        reviewsHeading: "Guest reviews",
        moreHomesHeading: "More homes to consider",
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

    // ─────────────────────────── Legal ───────────────────────────
    // Each item is one section: a heading plus a body. The body accepts a
    // little markdown — a blank line starts a new paragraph, "- " starts a
    // bullet list, and `**bold**` / `[label](url)` work inline. The literal
    // token `{email}` is replaced with a live mailto link built from
    // Settings > Email, so the contact sections below stay in sync with it
    // without needing to be re-typed.
    {
      siteId: site.id,
      pageSlug: "privacy-policy",
      sectionKey: "body",
      order: 0,
      content: {
        updated: "August 23, 2026",
        sections: [
          {
            heading: "Overview",
            body: "Book VIP Homes (“we,” “us,” or “our”), a Valencia Investment Properties company, operates this website to showcase our vacation rental homes and let guests get in touch about a stay. This policy explains what information we collect when you use the site, how we use it, and the choices you have.",
          },
          {
            heading: "Information we collect",
            body: "We collect information in a few limited ways:\n\n- **Information you give us directly** — such as your name, email address, and any details you include when you email us about a booking or question.\n- **Booking information** — if you book a stay, your reservation and payment details are handled directly by our booking platform, Hostaway, and its payment processor, not stored on this website.\n- **Basic technical information** — like the pages you visit and general device/browser information, which our hosting provider collects automatically to keep the site running securely.",
          },
          {
            heading: "How we use your information",
            body: "We use the information we collect to:\n\n- Respond to your questions and booking inquiries\n- Coordinate check-in details and guest communication\n- Keep our website secure and working correctly\n- Comply with legal obligations where required\n\nWe do not sell your personal information.",
          },
          {
            heading: "Sharing your information",
            body: "We only share information with the people who need it to run our business — for example, our booking platform (Hostaway) to process a reservation, or a service provider who helps us operate the property. We don't share your information with third parties for their own marketing purposes.",
          },
          {
            heading: "Cookies",
            body: "This site currently uses only the cookies necessary for it to function — we don't run third-party analytics or advertising trackers today.",
          },
          {
            heading: "Your choices",
            body: "You can ask us at any time to tell you what information we hold about you, correct it, or delete it, by emailing us using the contact below. If you booked through Hostaway, you can also manage your reservation details directly with them.",
          },
          {
            heading: "Contact us",
            body: "Questions about this policy? Email {email}.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "terms-and-conditions",
      sectionKey: "body",
      order: 0,
      content: {
        updated: "August 23, 2026",
        sections: [
          {
            heading: "Agreement to terms",
            body: "By using this website, you agree to these terms. If you don't agree with any part of them, please don't use the site or book a stay with us.",
          },
          {
            heading: "Bookings",
            body: "Reservations are made through our booking platform, Hostaway. A booking is only confirmed once you receive confirmation from us or through the booking platform. Rates, availability, and any promotions shown on this site are subject to change without notice until a booking is confirmed.",
          },
          {
            heading: "Check-in, check-out, and house rules",
            body: "Check-in and check-out times, along with pet and smoking policies, are listed on each individual listing page and will also be confirmed with you directly ahead of your stay. Guests are expected to follow the house rules for their booked property and treat the home with the same care they'd want in their own.",
          },
          {
            heading: "Cancellations",
            body: "Each listing has its own cancellation policy, shown on that listing's page. Please review it before booking — it governs how much of your payment is refundable and by when.",
          },
          {
            heading: "Guest responsibilities",
            body: "- Only registered guests within the listed occupancy limit may stay at the property.\n- Guests are responsible for any damage caused during their stay beyond normal wear and tear.\n- Illegal activity, unauthorized parties, or violations of the house rules may result in the stay being ended without a refund.",
          },
          {
            heading: "Limitation of liability",
            body: "We do our best to keep our homes safe, clean, and accurately described. To the extent permitted by law, Book VIP Homes is not liable for indirect, incidental, or consequential damages arising from your stay or your use of this website. Nothing in these terms limits liability that cannot be limited under applicable law.",
          },
          {
            heading: "Website use",
            body: "The content on this site — including photos, listing descriptions, and branding — belongs to Book VIP Homes and may not be copied or reused without permission.",
          },
          {
            heading: "Governing law",
            body: "These terms are governed by the laws of the State of Texas, without regard to its conflict-of-law principles.",
          },
          {
            heading: "Contact us",
            body: "Questions about these terms? Email {email}.",
          },
        ],
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

  // The FAQ used to be entirely computed at request time from live listing
  // data (pet-friendly count, cities, min-stay range, common amenities) —
  // there was no editable text at all. This freezes today's computed
  // answers into the admin's FAQ list so they're editable like every other
  // site's; the frontend now prefers these over its own computation, and
  // only falls back to recomputing live if the FAQ list here is ever
  // cleared out entirely.
  await db.delete(faqs).where(eq(faqs.siteId, site.id));
  await db.insert(faqs).values(
    [
      {
        question: "Do you allow pets?",
        answer:
          "Yes — 2 of our 4 homes are pet-friendly (All American Cottage, All American Paso Del Norte). Look for the paw icon when browsing, or email Eddie to confirm for a specific property.",
      },
      {
        question: "Where are your homes located?",
        answer: "Our homes are located across Texas, including Wichita Falls and El Paso.",
      },
      {
        question: "Is there a minimum length of stay?",
        answer:
          "It varies by home — anywhere from 1 night to 7 nights depending on the property. Reach out to Eddie and he'll help you find the right fit.",
      },
      {
        question: "What's included in every home?",
        answer:
          "Every home comes with free WiFi, kitchen, and air conditioning. Amenities vary beyond that — check each listing for the full list.",
      },
      {
        question: "How do I book or ask a question?",
        answer:
          "Browse our homes above to check dates, then reach out directly — Eddie personally reads every message and can help lock in your stay.",
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
