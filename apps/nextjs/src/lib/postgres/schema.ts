import { pgSchema, text, integer } from 'drizzle-orm/pg-core'

export { authSchema, user, account, verification, session } from './auth.schema'

export const productSchema = pgSchema('product')
export const brand = productSchema.table('brand', {
  index: integer('index').notNull(),
  image: text('image').primaryKey(),
})
