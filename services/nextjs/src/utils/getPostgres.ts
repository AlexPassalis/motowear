import type { SQL } from 'drizzle-orm'
import type { typeReview, typeVariant } from '@/lib/postgres/data/type'

import { postgres } from '@/lib/postgres'
import {
  product_pages,
  brand,
  variant,
  review,
  order,
  daily_session,
  shipping,
  home_page,
  coupon,
  email,
  phone,
} from '@/lib/postgres/schema'
import { eq, and, sql, not, or, isNull, desc } from 'drizzle-orm'
import { specialVariant } from '@/data/magic'

export async function getProductTypes() {
  const array = await postgres
    .select({ product_type: product_pages.product_type })
    .from(product_pages)
    .orderBy(
      sql`CASE
              WHEN ${product_pages.product_type} = 'Φούτερ'    THEN 0
              WHEN ${product_pages.product_type} = 'Μπλουζάκι' THEN 1
              ELSE 2
            END`,
    )

  return array.map((row) => row.product_type)
}
export type typeProductTypes = Awaited<ReturnType<typeof getProductTypes>>

export async function getVariants() {
  const array = await postgres.select().from(variant).orderBy(variant.index)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return array.map(({ index, ...rest }) => rest)
}

export async function getPages() {
  return await postgres.select().from(product_pages)
}

export async function getShipping() {
  const array = await postgres.select().from(shipping)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primary_key, ...rest } = array[0]

  return rest
}
export type typeShipping = Awaited<ReturnType<typeof getShipping>>

export async function getHomePage() {
  const array = await postgres.select().from(home_page)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primary_key, ...rest } = array[0]

  return rest
}
export type typeHomePage = Awaited<ReturnType<typeof getHomePage>>

export async function getHomePageVariants() {
  const product_types = await getProductTypes()
  const arrays = await Promise.all(
    product_types.map((product_type) =>
      postgres
        .selectDistinctOn([variant.name], {
          product_type: variant.product_type,
          name: variant.name,
          image: sql`${variant.images}[1]` as SQL<string>,
        })
        .from(variant)
        .where(eq(variant.product_type, product_type))
        .orderBy(variant.name, variant.index)
        .limit(4),
    ),
  )

  return arrays.flat()
}
export type typeHomePageVariants = Awaited<
  ReturnType<typeof getHomePageVariants>
>

export async function getProductTypeReviews(
  product_type: typeReview['product_type'],
) {
  return await postgres
    .select()
    .from(review)
    .where(eq(review.product_type, product_type))
    .orderBy(desc(review.date))
}

export async function getBrands() {
  const array = await postgres
    .select({ image: brand.image })
    .from(brand)
    .where(not(eq(brand.image, '')))
    .orderBy(brand.index)

  return array.map((row) => row.image)
}
export type typeBrands = Awaited<ReturnType<typeof getBrands>>

export async function getProductPage(product_type: string) {
  const array = await postgres
    .select()
    .from(product_pages)
    .where(eq(product_pages.product_type, product_type))
    .limit(1)

  return array[0]
}

export async function getProductReviews(product_type: string) {
  return await postgres
    .select()
    .from(review)
    .where(eq(review.product_type, product_type))
    .orderBy(desc(review.date))
}

export async function getOrders() {
  return await postgres
    .select()
    .from(order)
    .where(or(eq(order.paid, true), isNull(order.paid)))
    .orderBy(desc(order.order_date))
}

export async function getDailySessions() {
  return await postgres.select().from(daily_session)
}
export type typeDailySessions = Awaited<ReturnType<typeof getDailySessions>>

export async function getCoupons() {
  return await postgres.select().from(coupon)
}
export type typeCoupons = Awaited<ReturnType<typeof getCoupons>>

export async function getEmails() {
  return await postgres.select().from(email)
}
export type typeEmails = Awaited<ReturnType<typeof getEmails>>

export async function getPhones() {
  const array = await postgres.select().from(phone)

  return array.map((obj) => obj.phone)
}
export type typePhones = Awaited<ReturnType<typeof getPhones>>

export async function getOrder(order_id: string) {
  return await postgres
    .select()
    .from(order)
    .where(
      and(
        eq(order.id, Number(order_id)),
        eq(order.review_email, true),
        eq(order.review_submitted, false),
      ),
    )
}

export async function getOrderByOrderCode(order_code: string) {
  const array = await postgres
    .select()
    .from(order)
    .where(and(eq(order.order_code, order_code)))

  return array[0]
}
export type typeOrderByOrderCode = Awaited<
  ReturnType<typeof getOrderByOrderCode>
>

export async function unsubscribe(customer_email: string) {
  return await postgres.delete(email).where(eq(email.email, customer_email))
}

export async function getVariantsProductType(product_type: string) {
  const array = await postgres
    .select()
    .from(variant)
    .where(eq(variant.product_type, product_type))
    .orderBy(variant.index)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return array.map(({ index, ...rest }) => rest)
}

export async function getCollectionPageData(
  product_type: typeVariant['product_type'],
) {
  const product_type_variants = await getVariantsProductType(product_type)

  const variants = product_type_variants
    .filter(
      (variant, index, self) =>
        self.findIndex(
          (v) => v.name === variant.name && v.color === variant.color,
        ) === index,
    )
    .map((variant) => {
      return {
        name: variant.name,
        color: variant.color,
        brand: variant.brand,
        image: variant.images[0],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const brands = variants
    .map((variant) => variant.brand)
    .filter(Boolean) // remove empty strings ('')
    .filter(
      (item, index, self) =>
        index === self.findIndex((other) => other === item),
    )

  return { variants, brands }
}

export async function getProductPageData(
  product_type: typeVariant['product_type'],
) {
  const product_type_variants = await getVariantsProductType(product_type)
  const sorted_variants = product_type_variants.sort(
    ({ name: name_a }, { name: name_b }) => {
      if (name_a === 'Επίλεξε μηχανή') {
        return -1
      }
      if (name_b === 'Επίλεξε μηχανή') {
        return 1
      }
      if (specialVariant.includes(name_a)) {
        return 1
      }
      if (specialVariant.includes(name_b)) {
        return -1
      }
      return name_a.localeCompare(name_b)
    },
  )
  
  return sorted_variants
}

export async function getUniqueVariantNames() {
  const array = await postgres
    .selectDistinctOn([variant.name])
    .from(variant)
    .orderBy(variant.name)

  return array.map((row) => row.name)
}

export type typeUniqueVariantNames = Awaited<
  ReturnType<typeof getUniqueVariantNames>
>

export async function getCustomerDetails(email: string) {
  const array = await postgres
    .select({ checkout: order.checkout })
    .from(order)
    .where(sql`lower(${order.checkout} ->> 'email') = lower(${email})`)
    .orderBy(desc(order.order_date))
    .limit(1)

  return array[0]
}
