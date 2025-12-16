import { InferSelectModel } from 'drizzle-orm'
import {
  abandoned_cart,
  collection_v2,
  coupon,
  order,
  product_pages,
  product_v2,
  review,
} from '../schema'

import { z } from 'zod'
import {
  zodCheckout,
  zodCartItemLocalStorage,
  zodCartLocalStorage,
  zodCart,
} from './zod'

export type typeUpsell = {
  product_type: string
  name: string
}
export type typeUpsells = typeUpsell[]

export type typeCoupon = InferSelectModel<typeof coupon>
export type typeProductPage = InferSelectModel<typeof product_pages>

export type Collection = InferSelectModel<typeof collection_v2>
export type Product = InferSelectModel<typeof product_v2>

export type ProductWithCollectionName = Product & {
  collection_name: string
}

export type ProductNameGroup = {
  name: string
  color_count: number
  product_ids: string[]
  collection_id: string
}

export type typeReview = Omit<InferSelectModel<typeof review>, 'index'> & {
  index?: number
}
export type typeOrder = InferSelectModel<typeof order>

export type typeCheckout = z.infer<typeof zodCheckout>
export type typeCartItemLocalStorage = z.infer<typeof zodCartItemLocalStorage>
export type typeCartLocalStorage = z.infer<typeof zodCartLocalStorage>
export type typeCart = z.infer<typeof zodCart>

export type typeEmail = InferSelectModel<typeof abandoned_cart>['email']

export type typeHomePageReview = Omit<
  InferSelectModel<typeof review>,
  'product_type'
>
