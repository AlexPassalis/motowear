-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "reviews";
--> statement-breakpoint
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "orders";
--> statement-breakpoint
CREATE SCHEMA "other";
--> statement-breakpoint
CREATE SCHEMA "pages";
--> statement-breakpoint
CREATE SCHEMA "products";
--> statement-breakpoint
CREATE SEQUENCE "orders"."order_id_seq" INCREMENT BY 1 MINVALUE 1000 MAXVALUE 100000000 START WITH 1000 CACHE 1 CYCLE;--> statement-breakpoint
CREATE TABLE "__drizzle_migrations__" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "__drizzle_migrations___hash_key" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "reviews"."review" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_type" text NOT NULL,
	"rating" integer NOT NULL,
	"full_name" text NOT NULL,
	"review" text NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products"."variant" (
	"product_type" text NOT NULL,
	"index" integer NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"images" text[] NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"color" text NOT NULL,
	"size" text NOT NULL,
	"price" numeric NOT NULL,
	"price_before" numeric NOT NULL,
	"upsell" jsonb,
	"sold_out" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders"."coupon" (
	"code" text PRIMARY KEY NOT NULL,
	"percentage" numeric,
	"fixed" integer
);
--> statement-breakpoint
CREATE TABLE "auth"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "products"."brand" (
	"index" integer NOT NULL,
	"image" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages"."product_pages" (
	"product_type" text PRIMARY KEY NOT NULL,
	"size_chart" text NOT NULL,
	"product_description" text NOT NULL,
	"faq" jsonb NOT NULL,
	"carousel" jsonb NOT NULL,
	"upsell" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orders"."order" (
	"id" integer PRIMARY KEY DEFAULT nextval('orders.order_id_seq'::regclass) NOT NULL,
	"order_date" timestamp NOT NULL,
	"checkout" jsonb NOT NULL,
	"cart" jsonb NOT NULL,
	"coupon" jsonb,
	"total" numeric NOT NULL,
	"order_code" text,
	"paid" boolean,
	"date_fulfilled" timestamp,
	"tracking_number" text,
	"review_email" boolean NOT NULL,
	"review_submitted" boolean NOT NULL,
	"shippping_expense" numeric,
	"shipping_surcharge" numeric,
	"date_delivered" timestamp,
	"einvoice_id" text,
	"einvoice_link" text,
	"order_late_email_sent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other"."abandoned_cart" (
	"email" text PRIMARY KEY NOT NULL,
	"cart" jsonb NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other"."daily_session" (
	"date" date PRIMARY KEY NOT NULL,
	"sessions" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other"."email" (
	"email" text PRIMARY KEY NOT NULL,
	"customer" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other"."phone" (
	"phone" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "other"."shipping" (
	"primary_key" text PRIMARY KEY NOT NULL,
	"free" numeric,
	"surcharge" numeric,
	"expense_elta_courier" numeric,
	"expense_box_now" numeric
);
--> statement-breakpoint
CREATE TABLE "pages"."home_page" (
	"primary_key" text PRIMARY KEY NOT NULL,
	"big_image" jsonb NOT NULL,
	"smaller_images" jsonb NOT NULL,
	"quotes" jsonb NOT NULL,
	"faq" jsonb NOT NULL,
	"coupon" jsonb NOT NULL,
	"reviews" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products"."variant" ADD CONSTRAINT "variant_brand_brand_image_fk" FOREIGN KEY ("brand") REFERENCES "products"."brand"("image") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products"."variant" ADD CONSTRAINT "variant_product_type_product_pages_product_type_fk" FOREIGN KEY ("product_type") REFERENCES "pages"."product_pages"("product_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;
*/