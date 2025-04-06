import { z } from 'zod'

export const typeVariants = z.array(
  z.object({
    id: z.string(),
    product_type: z.string().nonempty(),
    variant: z.string().nonempty(),
    description: z.string().nonempty(),
    images: z.array(z.string()).nonempty(),
    price: z.number(),
    brand: z.string(),
    color: z.string(),
    size: z.string(),
    price_before: z.number(),
  })
)

export const typeImage = z.array(z.instanceof(File))

export const typeCoupon = z.object({
  coupon_code: z.string().min(1).max(20),
  percentage: z.number().nullable(),
  fixed: z.number().nullable(),
})

export type Coupon = {
  coupon_code: string
  percentage: null | number
  fixed: null | number
}

export const typeCheckout = z.object({
  email: z.string().email({ message: 'Λάθος email.' }),
  receive_email: z.boolean(),
  country: z.union([z.literal('Ελλάδα'), z.literal('Κύπρος')]),
  first_name: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  last_name: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  address: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  extra: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  post_code: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  city: z.string().max(30, { message: 'Όριο 30 χαρακτήρων.' }),
  phone: z
    .number({ message: 'Συμπλήρωσε ένα τηλέφωνο επικοινωνίας.' })
    .refine(value => value.toString().length <= 30, {
      message: 'Όριο 30 χαρακτήρων.',
    }),
  receive_phone: z.boolean(),
  payment_method: z.union([z.literal('Κάρτα'), z.literal('Αντικαταβολή')]),
})

export type LocalStorageCartItem = {
  image: string
  procuct_type: string
  variant: string
  color: string
  size: string
  price: number
  price_before: number
  quantity: number
}

export const typeCart = z
  .array(
    z.object({
      image: z.string(),
      procuct_type: z.string(),
      variant: z.string(),
      color: z.string(),
      size: z.string(),
      price: z.number(),
      price_before: z.number(),
      quantity: z.number(),
    })
  )
  .min(1)

export type ProductTypes = string[]
export type Brands = string[]
export type Variants = {
  product_type: string
  id: string
  variant: string
  description: string
  images: string[]
  price: number
  brand: string
  color: string
  size: string
  price_before: number
}[]
