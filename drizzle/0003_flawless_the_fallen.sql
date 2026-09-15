ALTER TABLE "page_sections" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "page_sections" ALTER COLUMN "content" SET DEFAULT '{}'::json;