import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'
import { coupon, product_pages, review, variant } from '../schema'

export const zodCheckout = z.object({
  email: z.string().email({ message: 'Λάθος email.' }),
  receive_email: z.boolean(),
  country: z.union([z.literal('Ελλάδα'), z.literal('Κύπρος')]),
  first_name: z
    .string()
    .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
    .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  last_name: z
    .string()
    .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
    .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  address: z
    .string()
    .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
    .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  extra: z.string(),
  post_code: z
    .string()
    .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
    .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  city: z
    .string()
    .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
    .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  phone: z
    .number({ message: 'Συμπλήρωσε ένα τηλέφωνο επικοινωνίας.' })
    .refine(value => value.toString().length > 0, {
      message: 'Τουλάχιστον 1 χαρακτήρα.',
    })
    .refine(value => value.toString().length <= 30, {
      message: 'Όριο 30 χαρακτήρων.',
    }),
  receive_phone: z.boolean(),
  payment_method: z.union([z.literal('Κάρτα'), z.literal('Αντικαταβολή')]),
})

export const zodCartItem = z.object({
  product_type: z.string(),
  name: z.string(),
  color: z.string(),
  size: z.string(),
  price: z.number(),
  quantity: z.number(),
})
export const zodCart = z.array(zodCartItem)
export const zodCartItemLocalStorage = zodCartItem.extend({
  image: z.string(),
  price_before: z.number(),
})
export const zodCartLocalStorage = z.array(zodCartItemLocalStorage)
export const zodVariant = createSelectSchema(variant)
  .omit({ index: true })
  .extend({
    id: z.string(),
  })
export const zodVariants = z.array(zodVariant)
export const zodCoupon = createSelectSchema(coupon)
export const zodReview = createSelectSchema(review)
export const zodProductPage = createSelectSchema(product_pages)
export const zodTypeReview = createSelectSchema(review)
export const zodTypeReviews = z.array(zodTypeReview)
