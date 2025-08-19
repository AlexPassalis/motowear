import type {
  typeShipping,
  typeProductTypes,
  typeHomePage,
  typeHomePageVariants,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getProductTypesCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (product_types) {
      return JSON.parse(product_types)
    } else {
      try {
        product_types = await getProductTypes()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getProductTypes()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('product_types', JSON.stringify(product_types), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getProductTypesCached() set',
          errorRedis,
          err,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getVariantsCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (variants) {
      return JSON.parse(variants)
    } else {
      try {
        variants = await getVariants()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getVariants()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('variants', JSON.stringify(variants), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getVariantsCached() set',
          errorRedis,
          err,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (pages) {
      return JSON.parse(pages)
    } else {
      try {
        pages = await getPages()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getPages()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis.set('pages', JSON.stringify(pages), 'EX', 3600).catch((err) => {
      const message = formatMessage(
        '@/app/(user)/cache.ts getPagesCached() set',
        errorRedis,
        err,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getReviewsCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (reviews) {
      return JSON.parse(reviews)
    } else {
      try {
        reviews = await getReviews()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getReviews()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('reviews', JSON.stringify(reviews), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getReviewsCached() set',
          errorRedis,
          err,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getShippingCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (shipping) {
      return JSON.parse(shipping)
    } else {
      try {
        shipping = await getShipping()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getFreeShippingAmount()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('shipping', JSON.stringify(shipping), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getShippingCached() set',
          errorRedis,
          err,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

    return shipping
  } else {
    return {
      expense_elta_courier: null,
      expense_box_now: null,
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
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (home_page) {
      return JSON.parse(home_page)
    } else {
      try {
        home_page = await getHomePage()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePage()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('home_page', JSON.stringify(home_page), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageCached() set',
          errorRedis,
          err,
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
      coupon: [],
      reviews: [],
    }
  }
}

export async function getHomePageVariantsCached(): Promise<typeHomePageVariants> {
  if (process.env.BUILD_TIME !== 'true') {
    let home_page_variants

    try {
      home_page_variants = await redis.get('home_page_variants')
    } catch (err) {
      const message = formatMessage(
        '@/app/(user)/cache.ts getHomePageVariantsCached() get',
        errorRedis,
        err,
      )
      console.error(message)
      await sendTelegramMessage('ERROR', message)
    }

    if (home_page_variants) {
      return JSON.parse(home_page_variants)
    } else {
      try {
        home_page_variants = await getHomePageVariants()
      } catch (err) {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageVariants()',
          errorPostgres,
          err,
        )
        console.error(message)
        await sendTelegramMessage('ERROR', message)
        throw errorPostgres
      }
    }

    void redis
      .set('home_page_variants', JSON.stringify(home_page_variants), 'EX', 3600)
      .catch((err) => {
        const message = formatMessage(
          '@/app/(user)/cache.ts getHomePageVariantsCached() set',
          errorRedis,
          err,
        )
        console.error(message)
        sendTelegramMessage('ERROR', message)
      })

    return home_page_variants
  } else {
    return []
  }
}
