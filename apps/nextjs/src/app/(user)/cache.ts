import { errorRedis } from '@/data/error'
import { redis } from '@/lib/redis'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import {
  getPages,
  getProductTypes,
  getReviews,
  getVariants,
} from '@/utils/getPostgres'
import type { ProductPage, ProductTypes, Review, Variants } from '@/data/type'

export async function getProductTypesCached(): Promise<ProductTypes> {
  if (process.env.BUILD_TIME !== 'true') {
    let product_types
    try {
      product_types = await redis.get('product_types')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getProductTypesCached() get',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (product_types) {
      return JSON.parse(product_types)
    } else {
      try {
        product_types = await getProductTypes()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set(
        'product_types',
        JSON.stringify(product_types),
        'EX',
        3600
      )
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getProductTypesCached() set',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return product_types
  } else {
    return []
  }
}

export async function getVariantsCached(): Promise<Variants> {
  if (process.env.BUILD_TIME !== 'true') {
    let variants
    try {
      variants = await redis.get('variants')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getVariantsCached() get',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (variants) {
      return JSON.parse(variants)
    } else {
      try {
        variants = await getVariants()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set('variants', JSON.stringify(variants), 'EX', 3600)
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getVariantsCached() set',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return variants
  } else {
    return []
  }
}

export async function getPagesCached(): Promise<
  { productPages: ProductPage[] }[]
> {
  if (process.env.BUILD_TIME !== 'true') {
    let pages
    try {
      pages = await redis.get('pages')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() get',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (pages) {
      return JSON.parse(pages)
    } else {
      try {
        pages = await getPages()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set('pages', JSON.stringify(pages), 'EX', 3600)
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() set',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return pages
  } else {
    return []
  }
}

export async function getReviewsCached(): Promise<Review[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let reviews
    try {
      reviews = await redis.get('reviews')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getReviewsCached() get',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (reviews) {
      return JSON.parse(reviews)
    } else {
      try {
        reviews = await getReviews()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set('reviews', JSON.stringify(reviews), 'EX', 3600)
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getReviewsCached() set',
        errorRedis,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return reviews
  } else {
    return []
  }
}
