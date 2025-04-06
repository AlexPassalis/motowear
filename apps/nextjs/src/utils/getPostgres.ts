import { errorPostgres } from '@/data/error'
import { postgres } from '@/lib/postgres'
import { product_types, brands, variants } from '@/lib/postgres/schema'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import { eq } from 'drizzle-orm'
import { v4 as id } from 'uuid'

export async function getProductTypes() {
  try {
    const array = await postgres
      .select({ product_type: product_types.product_type })
      .from(product_types)
    return array.map(row => row.product_type)
  } catch (e) {
    const message = formatMessage(
      id(),
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
    const array = await postgres.select().from(variants)
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      id(),
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
      .from(variants)
      .where(eq(variants.product_type, product_type))
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return array
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...rest }) => rest)
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    const message = formatMessage(
      id(),
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
    const array = await postgres.select().from(brands)
    return array
      .filter(brand => brand.image !== '')
      .sort((a, b) => a.index - b.index)
      .map(row => row.image)
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/utils/getPostgres.ts getBrands()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
}
