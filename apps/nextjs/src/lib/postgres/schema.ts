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

export { authSchema, user, account, verification, session } from './auth.schema'

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
    .$type<{ text: string; image: string }[]>()
    .notNull(),
})

export const productsSchema = pgSchema('products')
export const brand = productsSchema.table('brand', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})
export const variant = productsSchema.table(
  'variant',
  {
    product_type: text('product_type')
      .notNull()
      .references(() => product_pages.product_type, {
        onDelete: 'cascade',
      }),
    index: integer('index').notNull(),
    id: uuid().primaryKey(),
    images: text('images').array().notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    brand: text('image')
      .notNull()
      .references(() => brand.image),
    color: text('color').notNull(),
    size: text('size').notNull(),
    price: Numeric('price', { precision: 7, scale: 2 }).notNull(),
    price_before: Numeric('price_before', { precision: 7, scale: 2 }).notNull(),
  },
  variants => ({
    imagesMinLength: sql`CHECK (array_length(${variants.images}, 1) >= 1)`,
  })
)

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
  id: uuid('id').primaryKey(),
  checkout: jsonb('checkout').notNull(),
  cart: jsonb('cart').notNull(),
  coupon: jsonb('coupon'),
  total: integer('total').notNull(),
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

export const metricsSchema = pgSchema('metrics')
export const daily_session = metricsSchema.table('daily_session', {
  day: date('day').primaryKey(),
  count: integer('count').notNull(),
})
