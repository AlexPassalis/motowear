import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'
import {
  coupon,
  home_page,
  order,
  product_pages,
  review,
  shipping,
  variant,
} from '../schema'

export const zodCheckout = z
  .object({
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
      .string()
      .min(1, { message: 'Τουλάχιστον 1 χαρακτήρα.' })
      .max(30, { message: 'Όριο 30 χαρακτήρων.' }),
    receive_phone: z.boolean(),
    delivery_method: z.union([z.literal('ΕΛΤΑ Courier'), z.literal('BOX NOW')]),
    box_now_locker_id: z.string().nullable(),
    payment_method: z.union([z.literal('Κάρτα'), z.literal('Αντικαταβολή')]),
  })
  .superRefine((data, ctx) => {
    if (data.delivery_method === 'BOX NOW' && !data.box_now_locker_id) {
      ctx.addIssue({
        path: ['box_now_locker_id'],
        code: z.ZodIssueCode.custom,
        message: 'Δεν έχετε επιλέξει locker για BOX NOW.',
      })
    }
  })

export const zodCartItem = z.object({
  product_type: z.string(),
  name: z.string(),
  color: z.string().default(''),
  size: z.string().default(''),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
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
    images: z.array(z.string()).min(1),
  })
export const zodVariants = z.array(zodVariant)
export const zodCoupon = createSelectSchema(coupon)
export const zodCoupons = z.array(zodCoupon)
export const zodReview = createSelectSchema(review)
export const zodProductPage = createSelectSchema(product_pages)
export const zodTypeReview = createSelectSchema(review).extend({
  id: z.string(),
  date: z.string(),
})
export const zodTypeReviews = z.array(zodTypeReview)
export const zodShipping = createSelectSchema(shipping).omit({
  primary_key: true,
})

export const zodOrder = createSelectSchema(order)
export const zodOrderServer = zodOrder.extend({
  order_date: z.string(),
  date_fulfilled: z.string().nullable(),
  date_delivered: z.string().nullable(),
})

export const zodHomePage = createSelectSchema(home_page).omit({
  primary_key: true,
})
