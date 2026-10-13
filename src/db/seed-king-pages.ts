import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites, pages, pageSections, siteSettings } from "./schema";

async function main() {
  const [site] = await db.select().from(sites).where(eq(sites.slug, "kingrentalhomes")).limit(1);
  if (!site) throw new Error("Site 'kingrentalhomes' not found — create it first.");

  // Local /public media this frontend used directly (hero poster/video, logo,
  // one attraction hero photo) were uploaded once to this site's media store
  // ahead of this script — referencing a local path here would render fine
  // on the live site but show up blank in the admin's own image/video
  // preview (it resolves against admin.weblaucher.com, not this frontend).
  const M = `https://admin.weblaucher.com/api/media/sites/${site.id}/seed`;

  // The rest of the photos used across marketing sections are the same
  // Hostaway-hosted listing photos the live site already links to directly
  // (see src/data/site.ts `photos`) — stable URLs, no re-hosting needed.
  const img = (key: string) => `https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/${key}`;
  const photos = {
    stonehamDining: img("168077-475597-gTwtukQvqhz0EXXoZSmkSdqEoidkSRuPkujbtaP42pw-6965b52880cb2"),
    stonehamLiving: img("168077-475597-mqEWBZnncjVm-Ci3JwS8rqCnSGH06jJpfOLiUxef-iA-6965b54f83860"),
    stonehamExterior: img("168077-475597-r-Tp3QBOZA5Kma0pCqxkGff1e3jZBxvjDgKpCjyt3W0-6a3a606fd04d9"),
    coGameRoom: img("168077-428936-G7bZZOtqLXOI0VZp1g--VTaS5KhZ-DQUtloy3lencYpA-68b63457f3531"),
    quincyGarden: img("168077-428932-h9fpUptYPiLskVhIo7O9awg-OgQkPidE73-s8LasIYY-68b6356c4a4bd"),
    backyard: img("168077-428935-x2cW1Iu0Yss8E7mGxJL--iOSlrqYdSMKvWg-l1n--4aT8-68b634b89c7a1"),
    patio: img("168077-428935-uw530pZCKogM1KrzDvkUPs856otsRmETiOqvyHDKoBs-68b63c321a566"),
  };

  // The default page set from db:seed ("Terms", flat "About Us") doesn't
  // match this frontend's actual routes, so the page list is replaced with
  // exactly the pages this frontend renders. The properties and attractions
  // *catalogs* themselves stay live/code-driven (Hostaway listings, and a
  // local curated attractions dataset) — only the fixed marketing copy
  // around them is editable here, same as every other site in this project.
  await db.delete(pages).where(eq(pages.siteId, site.id));
  await db.insert(pages).values(
    [
      { slug: "home", title: "Home", icon: "home" },
      { slug: "properties", title: "Properties", icon: "building" },
      { slug: "about", title: "About Us", icon: "users" },
      { slug: "co-hosting", title: "Co Hosting", icon: "handshake" },
      { slug: "attractions", title: "Attractions", icon: "map" },
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
        badge: "Family-hosted since 2011",
        heading: "Escape the ordinary.",
        headingAccent: "Come home to the coast & the mountains.",
        posterImage: `${M}/hero-poster.jpg`,
        videoMobile: `${M}/hero-1280.mp4`,
        videoDesktop: `${M}/hero-1920.mp4`,
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "homes",
      order: 1,
      content: {
        eyebrow: "Our homes",
        heading: "Guest favorites",
        description:
          "A sample of our homes, from a woodland manor to a beach house and a Colorado retreat, all stocked, styled and hosted by us.",
        // "View all {count} homes" — {count} is replaced with the live
        // Hostaway listing count.
        viewAllTemplate: "View all {count} homes",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "whyStay",
      order: 2,
      content: {
        eyebrow: "The King Rental Homes difference",
        heading: "Everything you need, nothing you don't",
        description: "We stock, style and look after every home ourselves, so you can unpack once and settle in.",
        items: [
          {
            title: "Thoughtful & comfortable",
            text: "Memory-foam beds, crisp linens, stocked coffee bars and the small extras that make a rental feel like home.",
          },
          {
            title: "Fully equipped kitchens",
            text: "Modern appliances, real cookware and pantry basics, so you can cook a family feast or just make a great breakfast.",
          },
          {
            title: "Pet-friendly stays",
            text: "Most of our homes welcome well-behaved pets, because the whole family deserves a vacation.",
          },
          {
            title: "Easy for work & play",
            text: "Fast Wi-Fi, proper desks and smart TVs. Take the call in the morning and hit the beach by afternoon.",
          },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "reviews",
      order: 3,
      content: {
        eyebrow: "Guest reviews",
        description: "Real words from recent guests across our homes.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "attractions",
      order: 4,
      content: {
        eyebrow: "Local attractions",
        heading: "Things to see near our homes",
        description: "Beaches, landmarks and neighborhoods near our Boston-area homes and between Boulder and Denver.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "hostIntro",
      order: 5,
      content: {
        eyebrow: "Meet your hosts",
        heading: "Hi, we're Todd, Bobbi & Albert",
        quote: "We're a fun-loving family who enjoy hosting and traveling, and we host the way we'd want to be welcomed.",
        paragraph1:
          "Todd grew up in Colorado, Bobbi grew up in Thailand, and together we call Massachusetts home. Todd runs King Rental Homes full-time, and Bobbi is a nurse.",
        paragraph2:
          "We love adventures, good food & drink, the outdoors, sports, books, music and movies. We put that into every home: great beds, real kitchens, games for rainy days, and local tips we actually use.",
        ctaLabel: "Our story",
        // Falls back to a shot of the Chapel Way Manor when no real host
        // photo is set — see the TODO on `site.hostPhoto`.
        image: photos.stonehamExterior,
      },
    },
    {
      siteId: site.id,
      pageSlug: "home",
      sectionKey: "coHostCta",
      order: 6,
      content: {
        eyebrow: "For property owners",
        heading: "Own a home in Colorado or Massachusetts?",
        description: "We co-host short- and mid-term rentals hands-on. The details matter, and we never outsource them.",
        points: ["Listing strategy & copywriting", "Guest communication & care", "Airbnb, VRBO & direct bookings"],
        primaryLabel: "Explore co-hosting",
        secondaryLabel: "Talk to Todd",
        image: photos.patio,
      },
    },

    // ─────────────────────────── Properties ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Book direct",
        heading: "Find your home base",
        // {count} is replaced with the live Hostaway listing count.
        introTemplate: "{count} hand-kept homes near Boston's beaches and between Boulder & Denver.",
      },
    },
    // The property detail page (/properties/[slug]) itself. Everything here
    // is fixed copy around the listing — the listing's own name, photos,
    // description, amenities, house rules, reviews and location stay live
    // from Hostaway and aren't editable here.
    {
      siteId: site.id,
      pageSlug: "properties",
      sectionKey: "detail",
      order: 1,
      content: {
        breadcrumbHomeLabel: "Home",
        breadcrumbPropertiesLabel: "Properties",
        whyGuestsLoveHeading: "Why guests love it",
        petFriendlyText: "Pet-friendly: bring the whole family",
        evChargingText: "EV charging on site",
        aboutHeading: "About this home",
        amenitiesHeading: "What this home offers",
        goodToKnowHeading: "Good to know",
        checkInLabel: "Check-in",
        checkOutLabel: "Check-out",
        selfCheckInTitle: "Self check-in",
        selfCheckInText: "Contactless check-in, with details sent before arrival",
        houseRulesLabel: "House rules",
        locationHeading: "Where you'll be",
        nearbyAttractionsLabel: "See nearby attractions",
        reviewsEyebrow: "Guest reviews",
        reviewsBadge: "Consistently 5-star hosting",
        moreHomesHeading: "More homes you might like",
        viewAllHomesLabel: "View all homes",
      },
    },

    // ─────────────────────────── About ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "hero",
      order: 0,
      content: {
        eyebrow: "About us",
        heading: "A family business, built on hospitality",
        intro: "King Rental Homes is Todd, Bobbi and Albert: a fun-loving family who love to travel, and love hosting even more.",
        image: photos.stonehamLiving,
      },
    },
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "story",
      order: 1,
      content: {
        eyebrow: "Our story",
        heading: "From Colorado to Massachusetts, by way of Thailand",
        paragraph1:
          "Hello! Todd manages our short-term rental business, King Rental Homes, which has homes in Massachusetts and Colorado, and Bobbi is a nurse. Todd is from Colorado, Bobbi grew up in Thailand, and we live in Massachusetts with our son, Albert.",
        paragraph2Prefix:
          "We're fun and easy-going. We love adventures, good food & drink, the outdoors, sports, books, music and movies, and time with family and friends. We've been welcoming guests since",
        paragraph2Suffix: "and we still get excited when someone tells us our home made their trip.",
        signature: "Todd, Bobbi & Albert",
        image: photos.stonehamExterior,
        secondaryImage: photos.coGameRoom,
      },
    },
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "howWeHost",
      order: 2,
      content: {
        eyebrow: "How we host",
        heading: "More than a place to sleep",
        description:
          "We want each home to be a place where families, friends and groups can connect, celebrate and make memories that last.",
        items: [
          { title: "Hands-on hosting", text: "We manage every home ourselves. When you message, you reach us, not a call center." },
          {
            title: "Comfort in the details",
            text: "Memory-foam beds, stocked kitchens, coffee bars, games and good Wi-Fi, the way we'd want to find it.",
          },
          { title: "Local know-how", text: "Ask us for a beach, a trail or a dinner spot near your home and you'll get a real answer." },
          { title: "Escape the ordinary", text: "We want every stay to be the trip you're still talking about next year." },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "guestWords",
      order: 3,
      content: {
        featuredQuoteText: "The Kings are wonderful hosts and have thoughtfully maintained and prepared for their guests.",
        featuredQuoteName: "David S.",
        featuredQuoteHome: "The Beachside Flat",
        quotes: [
          { text: "Todd's a great host. We always look forward to staying at his place.", name: "Ryan C.", home: "The Chapel Way Manor" },
          { text: "Todd was a great host with excellent communication from start to finish.", name: "Alett R.", home: "Sheridan Green House" },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "about",
      sectionKey: "cta",
      order: 4,
      content: {
        eyebrow: "Stay with us",
        heading: "Come see what hosting done right feels like",
        description: "Beach homes in Quincy, a Victorian in Melrose, family houses in Milton and Stoneham, and a home between Boulder & Denver.",
        primaryLabel: "Browse our homes",
        secondaryLabel: "Say hello",
        coHostingPrompt: "Own a home in Colorado or Massachusetts?",
        coHostingLinkLabel: "Explore co-hosting",
      },
    },

    // ─────────────────────────── Co Hosting ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "co-hosting",
      sectionKey: "hero",
      order: 0,
      content: {
        eyebrow: "Co Hosting",
        heading: "Your property, hosted like it's ours",
        intro:
          "We co-host short- and mid-term rentals across Colorado and Massachusetts. We're hands-on with every property: the details matter, and we don't outsource them.",
        primaryLabel: "Tell us about your property",
        image: photos.backyard,
      },
    },
    {
      siteId: site.id,
      pageSlug: "co-hosting",
      sectionKey: "services",
      order: 1,
      content: {
        eyebrow: "What we handle",
        heading: "Full-service, personally delivered",
        description: "Pick the whole package or just the parts you need.",
        items: [
          { title: "Listing strategy", text: "Positioning, pricing and calendar strategy that fits your home, your market and your goals." },
          { title: "Professional copywriting", text: "Listing titles and descriptions that sound human, rank well and set the right expectations." },
          { title: "Guest experience design", text: "Furnishing, stocking and the small touches that turn good stays into 5-star reviews." },
          { title: "Platform management", text: "Airbnb, VRBO and calendar sync handled day to day, so nothing slips through." },
          { title: "Guest communication", text: "Fast, friendly replies from booking to check-out, handled by us personally." },
          { title: "Marketing & direct booking", text: "Reach beyond the platforms with marketing and direct bookings through our own site." },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "co-hosting",
      sectionKey: "trackRecord",
      order: 2,
      content: {
        eyebrow: "Our track record",
        heading: "The same care goes into every listing",
      },
    },
    {
      siteId: site.id,
      pageSlug: "co-hosting",
      sectionKey: "howItWorks",
      order: 3,
      content: {
        eyebrow: "How it works",
        heading: "Simple to start, easy to trust",
        steps: [
          { title: "Intro call", text: "Tell us about your property and what you want from it. We'll be honest about the opportunity." },
          { title: "Set up & launch", text: "We shape the listing, copy and guest experience, then launch across the platforms." },
          { title: "Hands-on hosting", text: "We manage the day-to-day and keep you informed, and we never outsource the details." },
        ],
      },
    },
    {
      siteId: site.id,
      pageSlug: "co-hosting",
      sectionKey: "inquiry",
      order: 4,
      content: {
        eyebrow: "Get in touch",
        heading: "Have a property you'd like to discuss?",
        description: "We currently co-host in Colorado and Massachusetts. Tell us about your home and we'll be in touch.",
        formHeading: "Tell us about your property",
        formPlaceholder: "Where is the property, how many bedrooms, and is it listed anywhere yet?",
        image: photos.stonehamDining,
      },
    },

    // ─────────────────────────── Contact ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Contact us",
        heading: "We're here to help",
        description: "Planning a trip, already booked, or thinking about co-hosting? Get in touch and we'll get back to you.",
        image: photos.quincyGarden,
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "sidebar",
      order: 1,
      content: {
        talkToHostHeading: "Talk to a real host",
        talkToHostText: "Messages come straight to us, not a call center.",
        goodToKnowLabel: "Good to know",
        browseHomesLabel: "Browse our homes",
        coHostingLabel: "Co-hosting for owners",
      },
    },
    {
      siteId: site.id,
      pageSlug: "contact",
      sectionKey: "form",
      order: 2,
      content: {
        formHeading: "Send us a message",
        formSubtext: "We'll reply by email, or by phone if you leave a number.",
        topics: [
          { label: "Booking a stay", placeholder: "Your dates, how many guests (and pets), and which home you're interested in…" },
          { label: "A current reservation", placeholder: "Which home and dates, and how can we help?" },
          { label: "Co-hosting my property", placeholder: "Where is the property, how many bedrooms, and is it listed anywhere yet?" },
          { label: "Something else", placeholder: "How can we help?" },
        ],
      },
    },

    // ─────────────────────────── Booking confirmed ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "booking-confirmed",
      sectionKey: "content",
      order: 0,
      content: {
        confirmedTitle: "You're booked!",
        confirmedTextTemplate: "Your stay at {home} is confirmed. We've got it from here.",
        pendingTitle: "Payment received",
        pendingText: "We're finalizing your reservation now. If anything needs attention, we'll reach out by email.",
        refundedTitle: "Those dates were just taken",
        refundedText:
          "Someone booked these dates moments before your payment went through, so we've refunded you in full. Refunds usually appear within 5–10 business days.",
        unpaidTitle: "Payment not completed",
        unpaidText: "Your payment didn't go through, so you haven't been charged.",
        planTripLabel: "Plan your trip",
        chooseNewDatesLabel: "Choose new dates",
        questionsLabel: "Questions? Email us",
      },
    },

    // ─────────────────────────── Attractions ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "attractions",
      sectionKey: "intro",
      order: 0,
      content: {
        eyebrow: "Attractions",
        heading: "Make the most of your stay",
        description: "Our favorite things to see and do near our homes, from Boston's landmarks and Quincy's shoreline to Colorado's Front Range.",
        image: `${M}/wollaston-beach.jpg`,
      },
    },
    {
      siteId: site.id,
      pageSlug: "attractions",
      sectionKey: "cta",
      order: 1,
      content: {
        heading: "Stay close to it all",
        description: "Our Quincy homes are minutes from Wollaston Beach and the T into Boston, and our Colorado home sits between Boulder and Denver.",
        buttonLabel: "Browse our homes",
      },
    },

    // ─────────────────────────── Global ───────────────────────────
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "navbar",
      order: 0,
      content: {
        links: ["Home", "About Us", "Properties", "Co Hosting", "Attractions", "Contact Us"],
        bookButtonLabel: "Book your stay",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "footer",
      order: 1,
      content: {
        tagline: "Family-hosted vacation homes near Boston's beaches and between Boulder & Denver.",
        exploreHeading: "Explore",
        contactHeading: "Contact",
        addressLine: "Massachusetts & Colorado",
        newsletterHeading: "Get first dibs on open dates",
        newsletterSubtext: "Last-minute openings and seasonal offers. No spam.",
        copyrightNote: "All rights reserved.",
      },
    },
    {
      siteId: site.id,
      pageSlug: "global",
      sectionKey: "seo",
      order: 2,
      content: {
        title: "King Rental Homes | Vacation Homes near Boston & Denver",
        description:
          "Thoughtfully hosted vacation homes near Boston's beaches and between Boulder & Denver. Book direct with Todd & Bobbi King, hosting since 2011.",
      },
    },
  ]);

  const settings = {
    siteName: "King Rental Homes",
    email: "todd@kingrentalhomes.com",
    phone: "+1 720 352 3671",
    address: "Massachusetts & Colorado",
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
