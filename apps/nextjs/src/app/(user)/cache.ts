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

import { errorPostgres, errorRedis } from '@/data/error'
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
    }

    if (product_types) {
      return JSON.parse(product_types)
    } else {
      try {
        product_types = await getProductTypes()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getProductTypes()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('product_types', JSON.stringify(product_types), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getProductTypesCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

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
    }

    if (variants) {
      return JSON.parse(variants)
    } else {
      try {
        variants = await getVariants()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getVariants()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('variants', JSON.stringify(variants), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getVariantsCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

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
    }

    if (pages) {
      return JSON.parse(pages)
    } else {
      try {
        pages = await getPages()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getPages()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis.set('pages', JSON.stringify(pages), 'EX', 3600).catch((e) => {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() set',
        errorRedis,
        e,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
    })

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
    }

    if (reviews) {
      return JSON.parse(reviews)
    } else {
      try {
        reviews = await getReviews()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getReviews()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('reviews', JSON.stringify(reviews), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getReviewsCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

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
    }

    if (shipping) {
      return JSON.parse(shipping)
    } else {
      try {
        shipping = await getShipping()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getFreeShippingAmount()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('shipping', JSON.stringify(shipping), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getShippingCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

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
    }

    if (home_page) {
      return JSON.parse(home_page)
    } else {
      try {
        home_page = await getHomePage()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePage()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    await redis
      .set('home_page', JSON.stringify(home_page), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

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
    }

    if (home_page_variants) {
      return JSON.parse(home_page_variants)
    } else {
      try {
        home_page_variants = await getHomePageVariants()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageVariants()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('home_page_variants', JSON.stringify(home_page_variants), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageVariantsCached() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

    return home_page_variants
  } else {
    return []
  }
}

export async function getHomePageReviewsCached(): Promise<typeHomePageReviews> {
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
    }

    if (home_page_reviews) {
      return JSON.parse(home_page_reviews)
    } else {
      try {
        home_page_reviews = await getHomePageReviews()
      } catch (e) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageReviews()',
          errorPostgres,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('home_page_reviews', JSON.stringify(home_page_reviews), 'EX', 3600)
      .catch((e) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageReviewsCache() set',
          errorRedis,
          e,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

    return home_page_reviews
  } else {
    return []
  }
}
