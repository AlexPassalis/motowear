import { errorPostgres } from '@/data/error'
import { postgres } from '@/lib/postgres'
import { product_types, brands, variants } from '@/lib/postgres/schema'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import { eq } from 'drizzle-orm'
import { v4 as id } from 'uuid'
import { unstable_cache } from 'next/cache'

export async function getProductTypes() {
  async function productTypes() {
    let array
    try {
      array = await postgres
        .select({ product_type: product_types.product_type })
        .from(product_types)
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
    return array.map(row => row.product_type)
  }
  return process.env.BUILD_TIME !== 'true' ? await productTypes() : []
}
export const getProductTypesCached = unstable_cache(
  async () => getProductTypes(),
  ['product_types'],
  {
    tags: ['product_types'],
    revalidate: 3600,
  }
)

export async function getBrands() {
  let array
  try {
    array = await postgres.select().from(brands)
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
  return array
    .filter(brand => brand.image !== '')
    .sort((a, b) => a.index - b.index)
    .map(row => row.image)
}

export async function getVariants(product_type: string) {
  if (process.env.BUILD_TIME !== 'true') {
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
        '@/utils/getPostgres.ts getVariants()',
        errorPostgres,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorPostgres
    }
  } else {
    return []
  }
}
export const getVariantsCashed = unstable_cache(
  async (product_type: string) => getVariants(product_type),
  ['variants'],
  {
    tags: ['variants'],
    revalidate: 3600,
  }
)

export async function getAllVariants() {
  if (process.env.BUILD_TIME !== 'true') {
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
  } else {
    return []
  }
}
export const getAllVariantsCached = unstable_cache(
  async () => getAllVariants(),
  ['all_variants'],
  {
    tags: ['all_variants'],
    revalidate: 3600,
  }
)
