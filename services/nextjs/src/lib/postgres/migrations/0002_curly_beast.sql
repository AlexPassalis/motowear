ALTER TABLE "products"."collection_v2" RENAME TO "collection";--> statement-breakpoint
ALTER TABLE "products"."product_v2" RENAME TO "product";--> statement-breakpoint
ALTER TABLE "products"."collection" DROP CONSTRAINT "collection_v2_name_product_pages_product_type_fk";
--> statement-breakpoint
ALTER TABLE "products"."product" DROP CONSTRAINT "product_v2_collection_id_collection_v2_id_fk";
--> statement-breakpoint
ALTER TABLE "products"."product" DROP CONSTRAINT "product_v2_brand_brand_image_fk";
--> statement-breakpoint
ALTER TABLE "products"."collection" ADD CONSTRAINT "collection_name_product_pages_product_type_fk" FOREIGN KEY ("name") REFERENCES "pages"."product_pages"("product_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products"."product" ADD CONSTRAINT "product_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "products"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products"."product" ADD CONSTRAINT "product_brand_brand_image_fk" FOREIGN KEY ("brand") REFERENCES "products"."brand"("image") ON DELETE set null ON UPDATE no action;