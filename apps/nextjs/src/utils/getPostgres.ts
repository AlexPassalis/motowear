import type { SQL } from 'drizzle-orm'

import { errorPostgres } from '@/data/error'
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
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import { eq, and, gte, lte, sql, not } from 'drizzle-orm'

export async function getProductTypes() {
  try {
    return (
      await postgres
        .select({ product_type: product_pages.product_type })
        .from(product_pages)
    ).map((row) => row.product_type)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductTypes()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeProductTypes = Awaited<ReturnType<typeof getProductTypes>>

export async function getVariants() {
  try {
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
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getVariants()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getVariantsProductType(product_type: string) {
  try {
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
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getVariantsProductType()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getBrands() {
  try {
    return (
      await postgres
        .select({ image: brand.image })
        .from(brand)
        .where(not(eq(brand.image, '')))
        .orderBy(brand.index)
    ).map((row) => row.image)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getBrands()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeBrands = Awaited<ReturnType<typeof getBrands>>

export async function getPages() {
  try {
    return await postgres.select().from(product_pages)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getPages()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getProductPage(product_type: string) {
  try {
    return (
      await postgres
        .select()
        .from(product_pages)
        .where(eq(product_pages.product_type, product_type))
        .limit(1)
    )[0]
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductPage()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getReviews() {
  try {
    return await postgres
      .select({
        id: review.id,
        product_type: review.product_type,
        rating: review.rating,
        full_name: review.full_name,
        review: review.review,
        date: review.date,
      })
      .from(review)
      .orderBy(review.index)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getReviews()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getProductReviews(product_type: string) {
  try {
    return await postgres
      .select({
        id: review.id,
        product_type: review.product_type,
        rating: review.rating,
        full_name: review.full_name,
        review: review.review,
        date: review.date,
      })
      .from(review)
      .where(eq(review.product_type, product_type))
      .orderBy(review.index)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductReviews()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getOrders() {
  try {
    return await postgres
      .select()
      .from(order)
      .where(not(eq(order.paid, false)))
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrders()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getDailySessions() {
  try {
    return await postgres.select().from(daily_session)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getDailySessions()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeDailySessions = Awaited<ReturnType<typeof getDailySessions>>

export async function getShipping() {
  try {
    return await postgres
      .select({
        expense: shipping.expense,
        free: shipping.free,
        surcharge: shipping.surcharge,
      })
      .from(shipping)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getFreeShippingAmount()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeShipping = Awaited<ReturnType<typeof getShipping>>

export async function getHomePage() {
  try {
    return await postgres
      .select({
        big_image: home_page.big_image,
        smaller_images: home_page.smaller_images,
        quotes: home_page.quotes,
        faq: home_page.faq,
        coupon: home_page.coupon,
      })
      .from(home_page)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getHomePage()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeHomePage = Awaited<ReturnType<typeof getHomePage>>

export async function getHomePageVariants() {
  try {
    return await postgres
      .selectDistinctOn([variant.product_type], {
        product_type: variant.product_type,
        name: variant.name,
        image: sql`${variant.images}[1]` as SQL<string>,
      })
      .from(variant)
      .orderBy(variant.product_type, variant.index)
      .limit(4)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getHomePageVariants()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeHomePageVariants = Awaited<
  ReturnType<typeof getHomePageVariants>
>

export async function getHomePageReviews() {
  try {
    const array = await postgres
      .select()
      .from(review)
      .where(and(gte(review.index, 0), lte(review.index, 9)))
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getHomePageReviews()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeHomePageReviews = Awaited<ReturnType<typeof getHomePageReviews>>

export async function getCoupons() {
  try {
    return await postgres.select().from(coupon)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getCoupons()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeCoupons = Awaited<ReturnType<typeof getCoupons>>

export async function getEmails() {
  try {
    return await postgres.select({ email: email.email }).from(email)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getEmails()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeEmails = Awaited<ReturnType<typeof getEmails>>

export async function getPhones() {
  try {
    return await postgres.select({ phone: phone.phone }).from(phone)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getPhones()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typePhones = Awaited<ReturnType<typeof getPhones>>

export async function getOrder(order_id: string) {
  try {
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
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrder()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getOrderByOrderCode(order_code: string) {
  try {
    return (
      await postgres
        .select()
        .from(order)
        .where(and(eq(order.order_code, order_code)))
    )[0]
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrderByOrderCode()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeOrderByOrderCode = Awaited<
  ReturnType<typeof getOrderByOrderCode>
>

export async function unsubscribe(customer_email: string) {
  try {
    return await postgres.delete(email).where(eq(email.email, customer_email))
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts unsubscribe()',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
