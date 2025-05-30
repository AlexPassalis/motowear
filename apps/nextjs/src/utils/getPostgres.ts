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
import { or, eq, and, gte, lte } from 'drizzle-orm'

export async function getProductTypes() {
  try {
    const array = await postgres
      .select({ product_type: product_pages.product_type })
      .from(product_pages)
    return array.map((row) => row.product_type)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductTypes()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeProductTypes = Awaited<ReturnType<typeof getProductTypes>>

export async function getVariants() {
  try {
    const array = await postgres.select().from(variant)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getVariants()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getVariantsProductType(product_type: string) {
  try {
    const array = await postgres
      .select()
      .from(variant)
      .where(eq(variant.product_type, product_type))
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getVariantsProductType()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getBrands() {
  try {
    const array = await postgres.select().from(brand)
    return array
      .filter((brand) => brand.image !== '')
      .sort((a, b) => a.index - b.index)
      .map((row) => row.image)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getBrands()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeBrands = Awaited<ReturnType<typeof getBrands>>

export async function getPages() {
  try {
    const array = await postgres.select().from(product_pages)
    return array
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getPages()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getProductPage(product_type: string) {
  try {
    const array = await postgres
      .select()
      .from(product_pages)
      .where(eq(product_pages.product_type, product_type))
      .limit(1)
    return array[0]
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductPage()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getReviews() {
  try {
    const array = await postgres.select().from(review)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getReviews()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getProductReviews(product_type: string) {
  try {
    const array = await postgres
      .select()
      .from(review)
      .where(eq(review.product_type, product_type))
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getProductReviews()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getOrders() {
  try {
    const array = await postgres.select().from(order)
    return array.filter((order) => order.paid !== false)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrders()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getDailySessions() {
  try {
    const array = await postgres.select().from(daily_session)
    return array
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getDailySessions()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeDailySessions = Awaited<ReturnType<typeof getDailySessions>>

export async function getShipping() {
  try {
    const array = await postgres.select().from(shipping)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array.map(({ primary_key, ...rest }) => rest)[0]
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getFreeShippingAmount()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeShipping = Awaited<ReturnType<typeof getShipping>>

export async function getHomePage() {
  try {
    const array = await postgres.select().from(home_page)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array.map(({ primary_key, ...rest }) => rest)[0]
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getHomePage()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeHomePage = Awaited<ReturnType<typeof getHomePage>>

export async function getHomePageVariants() {
  try {
    const array = await postgres
      .select()
      .from(variant)
      .where(
        or(
          eq(variant.index, 3),
          eq(variant.index, 4),
          eq(variant.index, 5),
          eq(variant.index, 6)
        )
      )
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array.map(({ product_type, name, images, ...rest }) => ({
      product_type,
      name,
      image: images[0],
    }))
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getHomePageVariants()',
      errorPostgres,
      e
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
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeHomePageReviews = Awaited<ReturnType<typeof getHomePageReviews>>

export async function getCoupons() {
  try {
    const array = await postgres.select().from(coupon)
    return array
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getCoupons()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeCoupons = Awaited<ReturnType<typeof getCoupons>>

export async function getEmails() {
  try {
    const array = await postgres.select().from(email)
    return array.map((obj) => obj.email)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getEmails()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typeEmails = Awaited<ReturnType<typeof getEmails>>

export async function getPhones() {
  try {
    const array = await postgres.select().from(phone)
    return array.map((obj) => obj.phone)
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getPhones()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
export type typePhones = Awaited<ReturnType<typeof getPhones>>

export async function getOrder(order_id: string) {
  try {
    const array = await postgres
      .select()
      .from(order)
      .where(
        and(
          eq(order.id, Number(order_id)),
          eq(order.review_email, true),
          eq(order.review_submitted, false)
        )
      )
    return array
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrder()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}

export async function getOrderByOrderCode(order_code: string) {
  try {
    const array = await postgres
      .select()
      .from(order)
      .where(and(eq(order.order_code, order_code)))
    return array[0]
  } catch (e) {
    const message = formatMessage(
      '@/utils/getPostgres.ts getOrderByOrderCode()',
      errorPostgres,
      e
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
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
