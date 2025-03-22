ALTER TABLE "product"."brand" ADD COLUMN "index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "product"."brand" ADD CONSTRAINT "brand_index_unique" UNIQUE("index");