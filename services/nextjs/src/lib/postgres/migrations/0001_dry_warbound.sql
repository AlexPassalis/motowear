ALTER TABLE "products"."variant_v2" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "products"."variant_v2" CASCADE;--> statement-breakpoint
ALTER TABLE "products"."collection_v2" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products"."collection_v2" ALTER COLUMN "price_before" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products"."product_v2" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products"."product_v2" ALTER COLUMN "price_before" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "products"."collection_v2" ADD COLUMN "mtrl" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "products"."product_v2" ADD COLUMN "sizes" text[];