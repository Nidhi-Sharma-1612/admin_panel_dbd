ALTER TABLE "articles" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "hero_image" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "cabins" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "legacy_slug" text;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_site_id_slug_unique" UNIQUE("site_id","slug");