import { errorPostgres } from '@/data/error'
import { postgres } from '@/lib/postgres'
import { product_pages, brand, variant, review } from '@/lib/postgres/schema'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import { eq } from 'drizzle-orm'

export async function getProductTypes() {
  try {
    const array = await postgres
      .select({ product_type: product_pages.product_type })
      .from(product_pages)
    return array.map(row => row.product_type)
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
      .filter(brand => brand.image !== '')
      .sort((a, b) => a.index - b.index)
      .map(row => row.image)
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

export async function getPages() {
  try {
    const productPages = await postgres.select().from(product_pages)
    return [{ productPages: productPages }]
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
      '@/utils/getPostgres.ts getProductTypePageSettings()',
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
      '@/utils/getPostgres.ts getProductTypePageSettings()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
