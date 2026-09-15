import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  json,
  timestamp,
  boolean,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  frontendUrl: text("frontend_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  // "super_admin" (Design by Dial staff) sees and manages every site and
  // every user. "admin" (a client) is scoped to only the sites they're
  // explicitly granted via user_sites, and can't reach user management at
  // all — set only by seeding/direct DB access, never through the UI.
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSites = pgTable(
  "user_sites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("admin"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.siteId] })],
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeSiteId: uuid("active_site_id").references(() => sites.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  siteId: uuid("site_id")
    .primaryKey()
    .references(() => sites.id, { onDelete: "cascade" }),
  siteName: text("site_name"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  address: text("address"),
  responseTimeNote: text("response_time_note"),
  footerTagline: text("footer_tagline"),
  copyrightName: text("copyright_name"),
  logoUrl: text("logo_url"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    icon: text("icon"),
    order: integer("order").notNull().default(0),
  },
  (t) => [unique().on(t.siteId, t.slug)],
);

export const pageSections = pgTable("page_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  pageSlug: text("page_slug").notNull(),
  sectionKey: text("section_key").notNull(),
  // `json`, not `jsonb`: jsonb reorders object keys internally, which would
  // scramble the field display order in the admin editor. `json` preserves
  // the exact key order it was written with.
  content: json("content").$type<Record<string, unknown>>().notNull().default({}),
  order: integer("order").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  coverImage: text("cover_image"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revoked: boolean("revoked").notNull().default(false),
});
