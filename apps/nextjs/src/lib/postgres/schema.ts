import { sql } from 'drizzle-orm'
import {
  pgSchema,
  text,
  integer,
  date,
  uuid,
  customType,
  jsonb,
} from 'drizzle-orm/pg-core'

const Numeric = customType<{ data: number }>({
  dataType: () => 'numeric',
  toDriver: (value: number) => value.toString(),
  fromDriver: (value: unknown) => parseFloat(value as string),
})

export { authSchema, user, account, verification, session } from './auth.schema'

export const productSchema = pgSchema('product')
export const product_types = productSchema.table('product_types', {
  product_type: text('product_type').primaryKey(),
  size_chart: text('image').notNull(),
  product_description: text('product_description').notNull(),
})
export const faq = productSchema.table('faq', {
  primary_key: uuid().primaryKey(),
  product_type: text('product_type')
    .notNull()
    .references(() => product_types.product_type, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
})
export const carousel = productSchema.table('carousel', {
  primary_key: uuid().primaryKey(),
  product_type: text('product_type')
    .notNull()
    .references(() => product_types.product_type, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
})
export const brands = productSchema.table('brands', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})
export const variants = productSchema.table(
  'variants',
  {
    product_type: text('product_type')
      .notNull()
      .references(() => product_types.product_type, { onDelete: 'cascade' }),
    index: integer('index').notNull(),
    id: uuid().primaryKey(),
    variant: text('variant').notNull(),
    description: text('description').notNull(),
    images: text('images').array().notNull(),
    price: Numeric('price', { precision: 7, scale: 2 }).notNull(),
    brand: text('image')
      .notNull()
      .references(() => brands.image),
    color: text('color').notNull(),
    size: text('size').notNull(),
    price_before: Numeric('price_before', { precision: 7, scale: 2 }).notNull(),
  },
  variants => ({
    imagesMinLength: sql`CHECK (array_length(${variants.images}, 1) >= 1)`,
  })
)

export const orderSchema = pgSchema('order')
export const coupons = orderSchema.table(
  'coupons',
  {
    coupon_code: text('code').primaryKey(),
    percentage: Numeric('percentage', { precision: 3, scale: 2 }),
    fixed: integer('fixed'),
  },
  () => ({
    validDiscount: sql`("percentage" > 0 OR "fixed" > 0)`,
  })
)
export const orders = orderSchema.table('orders', {
  id: uuid().primaryKey(),
  checkout: jsonb('checkout').notNull(),
  cart: jsonb('cart').notNull(),
  coupon: jsonb('coupon'),
  total: integer('total').notNull(),
})

export const reviewSchema = pgSchema('review')
export const reviews = reviewSchema.table('reviews', {
  id: uuid().primaryKey(),
  product_type: text('product_type').notNull(),
  index: integer('index').notNull(),
  review: text('review').notNull(),
})

export const metricsSchema = pgSchema('metrics')
export const daily_sessions = metricsSchema.table('daily_sessions', {
  day: date('day').primaryKey(),
  count: integer('count').notNull(),
})
