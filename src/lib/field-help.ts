// Small, scoped help notes shown under specific fields in the generic
// section editor. The editor itself stays fully generic — this is just a
// lookup table, so adding a note for one page/field never affects any
// other page's fields. Used by kevin's partner pages and vacaytothesmokies'
// specials page (lib/data is irrelevant here; this file has no site-specific imports).

const PARTNER_PAGE_SLUGS = ["partners-fr", "partners-es", "partners-en"];

// Keyed by "sectionKey:fieldKey", shown once next to the field itself
// (a whole list field, a text field, etc).
const SECTION_FIELD_HELP: Record<string, string> = {
  "hero:proof": "Keep exactly 2 items — the site ignores this list otherwise.",
  "hero:referMessage": "Pre-filled WhatsApp message.",
  "hero:image": "Leave empty to use the default photo.",
  "why:checklist": "Keep exactly 4 items — the site ignores this list otherwise.",
  "why:image": "Leave empty to use the default photo.",
  "offer:cards": "Keep exactly 4 items — the site ignores this list otherwise.",
  "offer:estimateBullets": "Keep exactly 3 items — the site ignores this list otherwise.",
  "steps:items": "Keep exactly 3 items — the site ignores this list otherwise.",
  "apart:cards": "Keep exactly 6 items — the site ignores this list otherwise.",
  "apart:image1": "Photo for card 1. Leave empty to use the default photo.",
  "apart:image2": "Photo for card 2. Leave empty to use the default photo.",
  "apart:image3": "Photo for card 3. Leave empty to use the default photo.",
  "apart:image4": "Photo for card 4. Leave empty to use the default photo.",
  "apart:image5": "Photo for card 6 (card 5 is the pricing calendar and has no photo). Leave empty to use the default photo.",
  "form:options": "Keep exactly 4 items — the site ignores this list otherwise.",
  "final:programmeMessage": "Pre-filled WhatsApp message.",
  "whatsapp:talkMessage": "Pre-filled WhatsApp message.",
};

// Keyed by "sectionKey:itemFieldKey", shown once under that sub-field for
// every row of the matching item list (e.g. form.options[].message).
const ITEM_FIELD_HELP: Record<string, string> = {
  "form:message": "Text inserted into the WhatsApp message when this box is ticked.",
};

// vacaytothesmokies' "specials" page (no other site has a page with this slug).
const SPECIALS_FIELD_HELP: Record<string, string> = {
  "moreSpecials:cards": "Seasonal specials shown after the Midweek Escape. Keep at least one card (set Show to no to hide it) so these fields stay available.",
  "midweek:offers": "Keep the two cards in this order: the first is for the studio cabins and Firefly #1, the second for Firefly #2.",
  "when:months": "Full month names. Ticked on the page; every other month is shown crossed out.",
  "claim:textMessage": "Pre-filled text message when a guest taps Text Us.",
  "enhancements:orderUrl": "Where the Order button and every enhancement card go (your Akia menu).",
  "enhancements:items": "Keep at least one item (set Show to no to hide it) so these fields stay available.",
};

const SPECIALS_ITEM_FIELD_HELP: Record<string, string> = {
  "moreSpecials:show": "yes to show this card, no to hide it.",
  "moreSpecials:startDate": "Optional. YYYY-MM-DD — the card appears from this date.",
  "moreSpecials:endDate": "Optional. YYYY-MM-DD — the card hides itself after this date.",
  "moreSpecials:dates": "Shown on the card, e.g. Valid January 5 – February 28.",
  "moreSpecials:offer": "Short price line on the photo, e.g. 3 nights for $399.",
  "moreSpecials:buttonLink": "A page (e.g. /contact) or a full link. Leave empty to link to the contact page.",
  "enhancements:show": "yes to show this item, no to hide it (e.g. Valentine's outside February).",
};

export function getFieldHelp(pageSlug: string, sectionKey: string, fieldKey: string): string | undefined {
  if (pageSlug === "specials") return SPECIALS_FIELD_HELP[`${sectionKey}:${fieldKey}`];
  if (!PARTNER_PAGE_SLUGS.includes(pageSlug)) return undefined;
  return SECTION_FIELD_HELP[`${sectionKey}:${fieldKey}`];
}

export function getItemFieldHelp(pageSlug: string, sectionKey: string, itemFieldKey: string): string | undefined {
  if (pageSlug === "specials") return SPECIALS_ITEM_FIELD_HELP[`${sectionKey}:${itemFieldKey}`];
  if (!PARTNER_PAGE_SLUGS.includes(pageSlug)) return undefined;
  return ITEM_FIELD_HELP[`${sectionKey}:${itemFieldKey}`];
}
