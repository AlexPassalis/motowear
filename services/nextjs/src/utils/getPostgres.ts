import type { SQL } from 'drizzle-orm'

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

export async function getProductTypes() {
  return (
    await postgres
      .select({ product_type: product_pages.product_type })
      .from(product_pages)
      .orderBy(
        sql`CASE
              WHEN ${product_pages.product_type} = 'Φούτερ'    THEN 0
              WHEN ${product_pages.product_type} = 'Μπλουζάκι' THEN 1
              ELSE 2
            END`,
      )
  ).map((row) => row.product_type)
}
export type typeProductTypes = Awaited<ReturnType<typeof getProductTypes>>

export async function getVariants() {
  return await postgres
    .select({
      product_type: variant.product_type,
      id: variant.id,
      images: variant.images,
      name: variant.name,
      description: variant.description,
      brand: variant.brand,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      price_before: variant.price_before,
      upsell: variant.upsell,
    })
    .from(variant)
    .orderBy(variant.index)
}

export async function getPages() {
  return await postgres.select().from(product_pages)
}

export async function getShipping() {
  return (
    await postgres
      .select({
        expense: shipping.expense,
        free: shipping.free,
        surcharge: shipping.surcharge,
      })
      .from(shipping)
  )[0]
}
export type typeShipping = Awaited<ReturnType<typeof getShipping>>

export async function getHomePage() {
  return (
    await postgres
      .select({
        big_image: home_page.big_image,
        smaller_images: home_page.smaller_images,
        quotes: home_page.quotes,
        faq: home_page.faq,
        coupon: home_page.coupon,
        reviews: home_page.reviews,
      })
      .from(home_page)
  )[0]
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

export async function getReviews() {
  return await postgres.select().from(review)
}

// ### ADMIN QUERIES FROM NOW ON ###

export async function getBrands() {
  return (
    await postgres
      .select({ image: brand.image })
      .from(brand)
      .where(not(eq(brand.image, '')))
      .orderBy(brand.index)
  ).map((row) => row.image)
}
export type typeBrands = Awaited<ReturnType<typeof getBrands>>

export async function getProductPage(product_type: string) {
  return (
    await postgres
      .select()
      .from(product_pages)
      .where(eq(product_pages.product_type, product_type))
      .limit(1)
  )[0]
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
  return (await postgres.select().from(email)).map((obj) => obj.email)
}
export type typeEmails = Awaited<ReturnType<typeof getEmails>>

export async function getPhones() {
  return (await postgres.select().from(phone)).map((obj) => obj.phone)
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
  return (
    await postgres
      .select()
      .from(order)
      .where(and(eq(order.order_code, order_code)))
  )[0]
}
export type typeOrderByOrderCode = Awaited<
  ReturnType<typeof getOrderByOrderCode>
>

export async function unsubscribe(customer_email: string) {
  return await postgres.delete(email).where(eq(email.email, customer_email))
}

export async function getVariantsProductType(product_type: string) {
  return await postgres
    .select({
      product_type: variant.product_type,
      id: variant.id,
      images: variant.images,
      name: variant.name,
      description: variant.description,
      brand: variant.brand,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      price_before: variant.price_before,
      upsell: variant.upsell,
    })
    .from(variant)
    .where(eq(variant.product_type, product_type))
    .orderBy(variant.index)
}
