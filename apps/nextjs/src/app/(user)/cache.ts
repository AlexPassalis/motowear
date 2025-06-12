import type {
  typeShipping,
  typeProductTypes,
  typeHomePage,
  typeHomePageVariants,
  typeHomePageReviews,
} from '@/utils/getPostgres'
import type {
  typeProductPage,
  typeReview,
  typeVariant,
} from '@/lib/postgres/data/type'

import { errorRedis } from '@/data/error'
import { redis } from '@/lib/redis/index'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import {
  getHomePage,
  getHomePageReviews,
  getHomePageVariants,
  getPages,
  getProductTypes,
  getReviews,
  getShipping,
  getVariants,
} from '@/utils/getPostgres'

export async function getProductTypesCached(): Promise<typeProductTypes> {
  if (process.env.BUILD_TIME !== 'true') {
    let product_types
    try {
      product_types = await redis.get('product_types')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getProductTypesCached() get',
        errorRedis,
        e,
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
        3600,
      )
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getProductTypesCached() set',
        errorRedis,
        e,
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

export async function getVariantsCached(): Promise<typeVariant[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let variants
    try {
      variants = await redis.get('variants')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getVariantsCached() get',
        errorRedis,
        e,
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
        e,
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

export async function getPagesCached(): Promise<typeProductPage[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let pages
    try {
      pages = await redis.get('pages')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() get',
        errorRedis,
        e,
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
        e,
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

export async function getReviewsCached(): Promise<typeReview[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let reviews
    try {
      reviews = await redis.get('reviews')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getReviewsCached() get',
        errorRedis,
        e,
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
        e,
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

export async function getShippingCached(): Promise<typeShipping> {
  if (process.env.BUILD_TIME !== 'true') {
    let shipping
    try {
      shipping = await redis.get('shipping')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getShippingCached() get',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (shipping) {
      return JSON.parse(shipping)
    } else {
      try {
        shipping = await getShipping()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set('shipping', JSON.stringify(shipping), 'EX', 3600)
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getShippingCached() set',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return shipping
  } else {
    return {
      expense: null,
      free: null,
      surcharge: null,
    }
  }
}

export async function getHomePageCached(): Promise<typeHomePage> {
  if (process.env.BUILD_TIME !== 'true') {
    let home_page
    try {
      home_page = await redis.get('home_page')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageCached() get',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (home_page) {
      return JSON.parse(home_page)
    } else {
      try {
        home_page = await getHomePage()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set('home_page', JSON.stringify(home_page), 'EX', 3600)
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageCached() set',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return home_page
  } else {
    return {
      big_image: { phone: '', laptop: '', url: '' },
      smaller_images: [],
      quotes: [],
      faq: [],
      coupon: { coupon_code: '', percentage: null, fixed: null },
    }
  }
}

export async function getHomePageVariantsCached(): Promise<typeHomePageVariants> {
  if (process.env.BUILD_TIME !== 'true') {
    let home_page_variants
    try {
      home_page_variants = await redis.get('home_page_variants')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageVariantsCached() get',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (home_page_variants) {
      return JSON.parse(home_page_variants)
    } else {
      try {
        home_page_variants = await getHomePageVariants()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set(
        'home_page_variants',
        JSON.stringify(home_page_variants),
        'EX',
        3600,
      )
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageVariantsCached() set',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return home_page_variants
  } else {
    return []
  }
}

export async function getHomePageReviewsCache(): Promise<typeHomePageReviews> {
  if (process.env.BUILD_TIME !== 'true') {
    let home_page_reviews
    try {
      home_page_reviews = await redis.get('home_page_reviews')
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageReviewsCache() get',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    if (home_page_reviews) {
      return JSON.parse(home_page_reviews)
    } else {
      try {
        home_page_reviews = await getHomePageReviews()
      } catch (e) {
        throw e
      }
    }

    try {
      await redis.set(
        'home_page_reviews',
        JSON.stringify(home_page_reviews),
        'EX',
        3600,
      )
    } catch (e) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageReviewsCache() set',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw errorRedis
    }

    return home_page_reviews
  } else {
    return []
  }
}
