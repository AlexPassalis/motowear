import { pgSchema, text, integer, date } from 'drizzle-orm/pg-core'

export { authSchema, user, account, verification, session } from './auth.schema'

export const productSchema = pgSchema('product')
export const brand = productSchema.table('brand', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})

export const metricsSchema = pgSchema('metrics')
export const dailySession = metricsSchema.table('daily_session', {
  day: date('day').primaryKey(),
  count: integer('count').notNull(),
})
