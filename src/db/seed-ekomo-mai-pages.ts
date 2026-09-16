import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pageSections } from "./schema";

const M = "https://admin.weblaucher.com/api/media/sites";

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "louise")).limit(1);
  if (!site) throw new Error("Site 'louise' not found — run db:seed first.");

  const url = (file: string) => `${M}/${site.id}/seed/${file}`;

  await db.delete(pageSections).where(eq(pageSections.siteId, site.id));

  await db.insert(pageSections).values([
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "hero",
      order: 0,
      content: {
        eyebrow: "Lahaina Ocean Front Rentals — Welcome",
        heading: "Your Gateway to Maui's Paradise",
        description:
          "Handpicked oceanfront condos in Lahaina & Kaanapali, hosted with real Aloha spirit — and the front-row sunsets to prove it.",
        heroImage: url("hero-beach-sunset.jpg"),
        heroVideo: url("hero.mp4"),
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "featuredProperties",
      order: 1,
      content: {
        eyebrow: "Our Homes",
        heading: "Oceanfront condos across West Maui",
        description:
          "Every unit is hand-managed by us, not a faceless property manager — hosted, cleaned, and checked in with real Aloha spirit.",
        linkLabel: "View all properties",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "services",
      order: 2,
      content: {
        eyebrow: "What We Offer",
        heading: "Hospitality that feels like Aloha",
        description:
          "Every stay is backed by the same standards we'd want for our own family — because for us, this island is personal.",
        items: [
          {
            title: "Hassle-Free Check-In",
            description:
              "Door codes and arrival instructions sent well ahead of your trip, so you can walk straight in and start relaxing.",
          },
          {
            title: "Impeccable Cleanliness",
            description:
              "Professional cleaners with 3+ years of experience, backed by supervisor inspections before every check-in.",
          },
          {
            title: "Prompt Maintenance Response",
            description:
              "A direct phone and text line to us, with fast troubleshooting if anything needs attention during your stay.",
          },
          {
            title: "Transparent Pricing",
            description:
              "Nightly rate, management fee, and Hawaii taxes only — no surprise charges added at checkout.",
          },
          {
            title: "Fast Communication",
            description:
              "Held to Airbnb Superhost and VRBO Premier Host standards, we typically respond within the hour.",
          },
          {
            title: "Fully Stocked Condo",
            description:
              "Equipped kitchens, L'Occitane toiletries, beach gear, and pool towels waiting for you on arrival.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "about",
      order: 3,
      content: {
        eyebrow: "Our Story",
        heading: "Aloha, from Louis & Kristine",
        paragraph1:
          "We've been captivated by the enchanting beauty of the Hawaiian Islands since 1995. Maui holds something truly special — pristine beaches, the Road to Hana, sunrise over Haleakala, and a pace of life that never feels crowded, no matter the season.",
        paragraph2:
          "We built LahainaOceanfrontRentals to share that feeling with every guest who stays with us — real Aloha spirit, from booking to check-out.",
        linkLabel: "Read our full story",
        founderImage: url("founders.jpeg"),
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "explore",
      order: 4,
      content: {
        eyebrow: "Explore the Island",
        heading: "More than just a place to stay",
        description:
          "Every condo puts you minutes from the beaches, reefs, and sunsets that make Maui unlike anywhere else.",
        items: [
          { label: "Days on the Sand", image: url("beach-palms-sailboat.jpg") },
          { label: "Reef Diving & Snorkeling", image: url("snorkeling-reef.jpg") },
          { label: "Paddleboarding at Sunset", image: url("paddleboard-sunset.jpg") },
          { label: "Sunrise Beach Walks", image: url("beach-birds-sunrise.jpg") },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "cta",
      order: 5,
      content: {
        eyebrow: "Start Planning",
        heading: "Ready to feel the Aloha spirit?",
        description: "Reach out and we'll help you find the right oceanfront condo for your Maui getaway.",
        backgroundImage: url("beach-birds-sunrise.jpg"),
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "testimonials",
      order: 6,
      content: {
        eyebrow: "Guest Stories",
        heading: "What guests are saying",
      },
    },
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "story",
      order: 0,
      content: {
        eyebrow: "About Us",
        title: "A love for Maui since 1995",
        tag: "Louis & Kristine Trinh",
        heading: "Captivated by the islands, one visit at a time",
        paragraph1:
          "We've been captivated by the enchanting beauty of the Hawaiian Islands since 1995. There's something truly special about Maui — pristine beaches, the winding Road to Hana, sunrise hikes up Haleakala, world-class snorkeling and surfing, and a food scene that punches well above its size.",
        paragraph2:
          "And despite all it offers, Maui never feels too crowded — it's a genuine sanctuary for reconnecting with nature. Visit between December and April and you might even catch humpback whales breaching just offshore.",
        paragraph3:
          "We started LahainaOceanfrontRentals to share that feeling with every guest who stays with us — hosting each condo the way we'd want to be hosted ourselves.",
        heroImage: url("paddleboard-sunset.jpg"),
        founderImage: url("founders.jpeg"),
        reefImage: url("snorkeling-reef.jpg"),
        highlightLabels: [
          "Sunrise on Haleakala",
          "World-Class Snorkeling",
          "Surfing & Paddleboarding",
          "The Road to Hana",
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Our Homes",
        heading: "Every property, hand-managed",
        description:
          "From honeymoon studios to resort-style condos with room for the family — each one hosted with real Aloha spirit.",
        regionText: "Oceanfront condos in Lahaina & Kaanapali, West Maui",
        heroImage: url("beach-palms-sailboat.jpg"),
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Get in Touch",
        heading: "Let's plan your Maui stay",
        description: "Questions about a property, dates, or the island itself? We usually respond within the hour.",
        formHeading: "Send us a message",
        formSubtext: "Fill out the form below and we'll get back to you shortly.",
        trustNote:
          "Held to Airbnb Superhost and VRBO Premier Host standards — expect a reply within the hour during normal waking hours in Hawaii.",
        heroImage: url("poolside-dusk.jpg"),
      },
    },
    {
      siteId: site.id,
      pageSlug: "privacy-policy",
      sectionKey: "body",
      order: 0,
      content: {
        lastUpdated: "Last updated September 2026",
        heroImage: url("snorkeling-reef.jpg"),
        sections: [
          {
            heading: "Introduction",
            body: 'LahainaOceanfrontRentals ("we," "us," or "our") respects your privacy. This policy explains what information we collect through this website, how we use it, and the choices you have.',
          },
          {
            heading: "Information We Collect",
            body: "Contact form submissions — name, email address, phone number, travel dates, and any message you send us.\n\nBooking inquiries — property preferences, check-in/check-out dates, and number of guests entered into the booking widget.\n\nUsage data — pages visited and general device/browser information collected automatically for basic site analytics.",
          },
          {
            heading: "How We Use Your Information",
            body: "We use the information you provide to respond to inquiries, coordinate bookings and stays, and improve this website. We do not sell your personal information.",
          },
          {
            heading: "Sharing Your Information",
            body: "We may share limited information with service providers who help us operate this business — for example, our property management/booking platform (Hostaway) and our payment processor (Stripe) to handle reservations and payments securely. We do not share your information with third parties for their own marketing purposes.",
          },
          {
            heading: "Cookies",
            body: "This site may use basic cookies or similar technologies to remember preferences and understand how visitors use the site. You can disable cookies in your browser settings, though some features may not work as intended.",
          },
          {
            heading: "Data Security",
            body: "We take reasonable steps to protect the information you share with us. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.",
          },
          {
            heading: "Your Rights",
            body: "You may request access to, correction of, or deletion of your personal information at any time by contacting us using the details below.",
          },
          {
            heading: "Children's Privacy",
            body: "This website is not directed at children under 13, and we do not knowingly collect personal information from children.",
          },
          {
            heading: "Changes to This Policy",
            body: 'We may update this policy from time to time. The "last updated" date above reflects the most recent revision.',
          },
          {
            heading: "Contact Us",
            body: "Questions about this policy? Email us at pahiatrinh@gmail.com.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "terms",
      sectionKey: "body",
      order: 0,
      content: {
        lastUpdated: "Last updated September 2026",
        heroImage: url("beach-birds-sunrise.jpg"),
        sections: [
          {
            heading: "Acceptance of Terms",
            body: "By using this website or booking a stay with LahainaOceanfrontRentals, you agree to the terms outlined below. If you do not agree, please do not use this site or book a property with us.",
          },
          {
            heading: "Bookings & Payments",
            body: "Rates shown on this website are our best current estimate and are subject to change until confirmed at the time of booking. Payment is collected securely online at checkout to confirm your reservation.",
          },
          {
            heading: "Cancellation Policy",
            body: 'Each property listing includes a "Good to Know" section with its cancellation window and refund tiers. Please review the specific policy for your property before booking — see an example on any property page.',
          },
          {
            heading: "House Rules",
            body: "Standard house rules (check-in/check-out times, no smoking, no parties, no pets, and quiet hours) apply to all stays unless otherwise noted on the property page. Violation of house rules may result in loss of deposit or removal from the property without refund.",
          },
          {
            heading: "Guest Responsibilities",
            body: "Guests are responsible for leaving the property in the condition it was found, reporting any damage promptly, and complying with the resort or building's own rules where applicable.",
          },
          {
            heading: "Liability & Damages",
            body: "LahainaOceanfrontRentals is not liable for personal injury, loss, or damage to personal property during your stay, except where required by law. Guests may be charged for damage beyond normal wear and tear.",
          },
          {
            heading: "Intellectual Property",
            body: "All text, photos, and branding on this website belong to LahainaOceanfrontRentals and may not be reproduced without permission.",
          },
          {
            heading: "Governing Law",
            body: "These terms are governed by the laws of the State of Hawaii, without regard to conflict-of-law principles.",
          },
          {
            heading: "Changes to These Terms",
            body: 'We may update these terms from time to time. The "last updated" date above reflects the most recent revision.',
          },
          {
            heading: "Contact Us",
            body: "Questions about these terms? Email us at pahiatrinh@gmail.com.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "propertyBooking",
      order: 0,
      content: {
        trustBadge1: "Superhost Rated",
        trustBadge2: "Book Direct, No Fees",
      },
    },
    {
      siteId: site.id,
      pageSlug: "booking-success",
      sectionKey: "content",
      order: 0,
      content: {
        confirmedHeading: "Booking confirmed!",
        pendingHeading: "Payment received!",
        confirmedSuffix:
          " is booked and your dates are reserved. We can't wait to welcome you.",
        pendingSuffix:
          " is being finalized on our end — we'll confirm your exact dates by email within 24 hours.",
        failedHeading: "Payment not completed",
        failedBody:
          "We couldn't confirm this payment. If you believe you were charged, please contact us and we'll sort it out right away.",
        ctaLabel: "Browse more properties",
      },
    },
  ]);

  console.log(`Seeded page sections for ${site.name}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
