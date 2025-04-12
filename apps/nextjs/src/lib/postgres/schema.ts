import { sql, InferSelectModel } from 'drizzle-orm'
import {
  pgSchema,
  text,
  integer,
  date,
  uuid,
  customType,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core'
import { z } from 'zod'

import type { typeUpsell } from './data/type'

export { authSchema, user, account, verification, session } from './auth.schema'

import { zodCart, zodCheckout } from './data/zod'

const Numeric = customType<{ data: number }>({
  dataType: () => 'numeric',
  toDriver: (value: number) => value.toString(),
  fromDriver: (value: unknown) => parseFloat(value as string),
})

export const pagesSchema = pgSchema('pages')
// export const home_page = pagesSchema.table('home_page', {})
// export const collection_pages = pagesSchema.table('collection_pages', {})
export const product_pages = pagesSchema.table('product_pages', {
  product_type: text('product_type').primaryKey(),
  size_chart: text('size_chart').notNull(),
  product_description: text('product_description').notNull(),
  faq: jsonb('faq').$type<{ question: string; answer: string }[]>().notNull(),
  carousel: jsonb('carousel')
    .$type<{ title: string; text: string; image: string }[]>()
    .notNull(),
  upsell: text('upsell').notNull(),
})

export const productsSchema = pgSchema('products')
export const brand = productsSchema.table('brand', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})

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
    .references(() => brand.image),
  color: text('color').notNull(),
  size: text('size').notNull(),
  price: Numeric('price', { precision: 7, scale: 2 }).notNull(),
  price_before: Numeric('price_before', { precision: 7, scale: 2 }).notNull(),
  upsell: jsonb('upsell').$type<typeUpsell>(),
})

export const ordersSchema = pgSchema('orders')
export const coupon = ordersSchema.table(
  'coupon',
  {
    coupon_code: text('code').primaryKey(),
    percentage: Numeric('percentage', { precision: 3, scale: 2 }),
    fixed: integer('fixed'),
  },
  () => ({
    validDiscount: sql`("percentage" > 0 OR "fixed" > 0)`,
  })
)

export const order = ordersSchema.table('order', {
  id: uuid('id').notNull().primaryKey(),
  order_date: date('order_date').notNull(),
  checkout: jsonb('checkout').$type<z.infer<typeof zodCheckout>>().notNull(),
  cart: jsonb('cart').$type<z.infer<typeof zodCart>>().notNull(),
  coupon: jsonb('coupon').$type<InferSelectModel<typeof coupon>>(),
  total: Numeric('total', { precision: 7, scale: 2 }).notNull(),
  confirmation_email: boolean('confirmation_email').notNull(),
  date_fulfilled: date('date_fulfilled'),
  tracking_number: text('tracking_number'),
  fulfilled_email: boolean('fulfilled_email').notNull(),
  review_email: boolean('review_email').notNull(),
})

export const reviewsSchema = pgSchema('reviews')
export const review = reviewsSchema.table('review', {
  id: uuid('id').primaryKey(),
  index: integer('index').notNull(),
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
  expense: Numeric('expense', { precision: 7, scale: 2 }),
  free: Numeric('free', { precision: 7, scale: 2 }),
  surcharge: Numeric('surcharge', { precision: 7, scale: 2 }),
})
