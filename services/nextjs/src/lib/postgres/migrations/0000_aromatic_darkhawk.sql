CREATE TABLE IF NOT EXISTS "products"."collection_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" numeric(7,2) DEFAULT 0 NOT NULL,
	"price_before" numeric(7,2) DEFAULT 0 NOT NULL,
	"sizes" text[],
	"upsell_collection" text,
	"upsell_product" text,
	"sold_out" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products"."product_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"description" text,
	"price" numeric(7,2),
	"price_before" numeric(7,2),
	"color" text,
	"images" text[] NOT NULL,
	"upsell_collection" text,
	"upsell_product" text,
	"sold_out" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products"."variant_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sizes" text[] NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products"."collection_v2" ADD CONSTRAINT "collection_v2_name_product_pages_product_type_fk" FOREIGN KEY ("name") REFERENCES "pages"."product_pages"("product_type") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products"."product_v2" ADD CONSTRAINT "product_v2_collection_id_collection_v2_id_fk" FOREIGN KEY ("collection_id") REFERENCES "products"."collection_v2"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products"."product_v2" ADD CONSTRAINT "product_v2_brand_brand_image_fk" FOREIGN KEY ("brand") REFERENCES "products"."brand"("image") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products"."variant_v2" ADD CONSTRAINT "variant_v2_product_id_product_v2_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"."product_v2"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
