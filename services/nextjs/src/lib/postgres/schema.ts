import { sql, InferSelectModel, relations } from 'drizzle-orm'
import {
  pgSchema,
  text,
  integer,
  date,
  uuid,
  customType,
  jsonb,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { z } from 'zod'

import type { typeHomePageReview, typeUpsell } from './data/type'

export { authSchema, user, account, verification, session } from './auth.schema'

import { zodCart, zodCheckout } from './data/zod'

const Numeric = customType<{ data: number }>({
  dataType: () => 'numeric',
  toDriver: (v) => v.toFixed(2),
  fromDriver: (v) => parseFloat(v as string),
})

export const pagesSchema = pgSchema('pages')
export const home_page = pagesSchema.table('home_page', {
  primary_key: text('primary_key').primaryKey(),
  big_image: jsonb('big_image')
    .$type<{ phone: string; laptop: string; url: string }>()
    .notNull(),
  smaller_images: jsonb('smaller_images')
    .$type<{ image: string; url: string }[]>()
    .notNull(),
  quotes: jsonb('quotes')
    .$type<{ quote: string; author: string }[]>()
    .notNull(),
  faq: jsonb('faq').$type<{ question: string; answer: string }[]>().notNull(),
  coupon: jsonb('coupon').$type<InferSelectModel<typeof coupon>[]>().notNull(),
  reviews: jsonb('reviews').$type<typeHomePageReview[]>().notNull(),
})
export const product_pages = pagesSchema.table('product_pages', {
  product_type: text('product_type').primaryKey(),
  size_chart: text('size_chart').notNull(),
  product_description: text('product_description').notNull(),
  upsell: text('upsell').notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  faq: jsonb('faq').$type<{ question: string; answer: string }[]>().notNull(),
  carousel: jsonb('carousel')
    .$type<{ title: string; image: string }[]>()
    .notNull(),
})

export const productsSchema = pgSchema('products')
export const brand = productsSchema.table('brand', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})

export const collection_v2 = productsSchema.table('collection_v2', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name')
    .notNull()
    .references(() => product_pages.product_type, {
      onDelete: 'cascade',
    }),
  description: text('description').notNull(),
  price: Numeric('price', { precision: 7, scale: 2 }).notNull(),
  price_before: Numeric('price_before', { precision: 7, scale: 2 }).notNull(),
  sizes: text('sizes').array(),
  upsell_id: uuid('upsell_id'),
  sold_out: boolean('sold_out').default(false).notNull(),
})

export const product_v2 = productsSchema.table('product_v2', {
  id: uuid('id').primaryKey().defaultRandom(),
  collection_id: uuid('collection_id')
    .notNull()
    .references(() => collection_v2.id, {
      onDelete: 'cascade',
    }),
  name: text('name').notNull(),
  brand: text('brand').references(() => brand.image, { onDelete: 'set null' }),
  description: text('description'),
  price: Numeric('price', { precision: 7, scale: 2 }),
  price_before: Numeric('price_before', { precision: 7, scale: 2 }),
  color: text('color'),
  images: text('images').array().notNull(),
  upsell_id: uuid('upsell_id'),
  sold_out: boolean('sold_out'),
})

export const variant_v2 = productsSchema.table('variant_v2', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id')
    .notNull()
    .references(() => product_v2.id, {
      onDelete: 'cascade',
    }),
  sizes: text('sizes').array().notNull(),
})

export const collection_v2_relations = relations(collection_v2, ({ one }) => ({
  upsell: one(product_v2, {
    fields: [collection_v2.upsell_id],
    references: [product_v2.id],
  }),
}))

export const product_v2_relations = relations(product_v2, ({ one, many }) => ({
  collection: one(collection_v2, {
    fields: [product_v2.collection_id],
    references: [collection_v2.id],
  }),
  upsell: one(product_v2, {
    fields: [product_v2.upsell_id],
    references: [product_v2.id],
    relationName: 'upsell',
  }),
  upsold_by: many(product_v2, {
    relationName: 'upsell',
  }),
  variants: many(variant_v2),
}))

export const variant_v2_relations = relations(variant_v2, ({ one }) => ({
  product: one(product_v2, {
    fields: [variant_v2.product_id],
    references: [product_v2.id],
  }),
}))

export const variant = productsSchema.table('variant', {
  product_type: text('product_type')
    .notNull()
    .references(() => product_pages.product_type, {
      onDelete: 'cascade',
    }),
  index: integer('index').notNull(),
  id: uuid('id').primaryKey(),
  images: text('images').array().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  brand: text('brand')
    .notNull()
    .default('')
    .references(() => brand.image, { onDelete: 'set default' }),
  color: text('color').notNull(),
  size: text('size').notNull(),
  price: Numeric('price', { precision: 7, scale: 2 }).notNull(),
  price_before: Numeric('price_before', { precision: 7, scale: 2 }).notNull(),
  upsell: jsonb('upsell').$type<typeUpsell>(),
  sold_out: boolean('sold_out').default(false).notNull(),
})

export const ordersSchema = pgSchema('orders')
export const orderIdSeq = ordersSchema.sequence('order_id_seq', {
  increment: 1,
  startWith: 1000,
  minValue: 1000,
  maxValue: 100000000,
  cycle: true, // Will throw an error because id is a primary key.
  cache: 1,
})
export const coupon = ordersSchema.table('coupon', {
  coupon_code: text('code').primaryKey(),
  percentage: Numeric('percentage', { precision: 3, scale: 2 }),
  fixed: integer('fixed'),
})
export const order = ordersSchema.table('order', {
  id: integer('id')
    .default(sql`nextval('orders.order_id_seq')`)
    .primaryKey(),
  order_date: timestamp('order_date').notNull(),
  checkout: jsonb('checkout').$type<z.infer<typeof zodCheckout>>().notNull(),
  cart: jsonb('cart').$type<z.infer<typeof zodCart>>().notNull(),
  coupon: jsonb('coupon').$type<InferSelectModel<typeof coupon>>(),
  total: Numeric('total', { precision: 7, scale: 2 }).notNull(),
  shippping_expense: Numeric('shippping_expense', {
    precision: 7,
    scale: 2,
  }),
  shipping_surcharge: Numeric('shipping_surcharge', {
    precision: 7,
    scale: 2,
  }),
  order_code: text('order_code'),
  paid: boolean('paid'),
  order_late_email_sent: boolean('order_late_email_sent')
    .default(false)
    .notNull(),
  einvoice_id: text('einvoice_id'),
  einvoice_link: text('einvoice_link'),
  date_fulfilled: timestamp('date_fulfilled'),
  tracking_number: text('tracking_number'),
  date_delivered: timestamp('date_delivered'),
  review_email: boolean('review_email').notNull(),
  review_submitted: boolean('review_submitted').notNull(),
})

export const reviewsSchema = pgSchema('reviews')
export const review = reviewsSchema.table('review', {
  id: uuid('id').primaryKey(),
  product_type: text('product_type').notNull(),
  rating: integer('rating').notNull(),
  full_name: text('full_name').notNull(),
  review: text('review').notNull(),
  date: date('date').notNull(),
})

export const otherSchema = pgSchema('other')
export const daily_session = otherSchema.table('daily_session', {
  date: date('date').primaryKey(),
  sessions: integer('sessions').notNull(),
})
export const shipping = otherSchema.table('shipping', {
  primary_key: text('primary_key').primaryKey(),
  expense_elta_courier: Numeric('expense_elta_courier', {
    precision: 7,
    scale: 2,
  }),
  expense_box_now: Numeric('expense_box_now', { precision: 7, scale: 2 }),
  free: Numeric('free', { precision: 7, scale: 2 }),
  surcharge: Numeric('surcharge', { precision: 7, scale: 2 }),
})
export const email = otherSchema.table('email', {
  email: text('email').primaryKey(),
  customer: boolean('customer').notNull().default(false),
})
export const phone = otherSchema.table('phone', {
  phone: text('phone').primaryKey(),
})
export const abandoned_cart = otherSchema.table('abandoned_cart', {
  email: text('email').primaryKey(),
  cart: jsonb('cart').$type<z.infer<typeof zodCart>>().notNull(),
  date: timestamp('date').notNull(),
})
