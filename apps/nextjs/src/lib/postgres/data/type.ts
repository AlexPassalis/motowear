import { InferSelectModel } from 'drizzle-orm'
import { coupon, order, product_pages, review, variant } from '../schema'

import { z } from 'zod'
import {
  zodCheckout,
  zodCartItemLocalStorage,
  zodCartLocalStorage,
} from './zod'

export type typeCoupon = InferSelectModel<typeof coupon>
export type typeProductPage = InferSelectModel<typeof product_pages>

export type typeVariant = Omit<InferSelectModel<typeof variant>, 'index'> & {
  index?: number
}
export type typeReview = Omit<InferSelectModel<typeof review>, 'index'> & {
  index?: number
}
export type typeOrder = InferSelectModel<typeof order>

export type typeCheckout = z.infer<typeof zodCheckout>
export type typeCartItemLocalStorage = z.infer<typeof zodCartItemLocalStorage>
export type typeCartLocalStorage = z.infer<typeof zodCartLocalStorage>
