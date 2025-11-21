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

import { redis } from '@/lib/redis/index'
import {
  getHomePage,
  getHomePageVariants,
  getPages,
  getProductTypes,
  getProductTypeReviews,
  getShipping,
  getVariants,
  getVariantsProductPage,
  getDataCollectionPage,
} from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'

export async function getProductTypesCached(): Promise<typeProductTypes> {
  if (process.env.BUILD_TIME !== 'true') {
    let product_types

    try {
      product_types = await redis.get('product_types')
    } catch (err) {
      const location = 'REDIS get product_types'
      handleError(location, err)
    }

    if (product_types) {
      return JSON.parse(product_types)
    } else {
      try {
        product_types = await getProductTypes()
      } catch (err) {
        const location = 'POSTGRES get product_types'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('product_types', JSON.stringify(product_types), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set product_types'
        handleError(location, err)
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
      const location = 'REDIS get variants'
      handleError(location, err)
    }

    if (variants) {
      return JSON.parse(variants)
    } else {
      try {
        variants = await getVariants()
      } catch (err) {
        const location = 'POSTGRES get variants'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('variants', JSON.stringify(variants), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set variants'
        handleError(location, err)
      })

    return variants
  } else {
    return []
  }
}

export async function getDataCollectionPageCached(
  product_type: string,
): Promise<Awaited<ReturnType<typeof getDataCollectionPage>>> {
  if (process.env.BUILD_TIME !== 'true') {
    let data_collection_page

    try {
      data_collection_page = await redis.get(
        `collection_page_data_${product_type}`,
      )
    } catch (err) {
      const location = 'REDIS get data_collection_page'
      handleError(location, err)
    }

    if (data_collection_page) {
      return JSON.parse(data_collection_page)
    } else {
      try {
        data_collection_page = await getDataCollectionPage(product_type)
      } catch (err) {
        const location = 'POSTGRES get data_collection_page'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set(
        `collection_page_data_${product_type}`,
        JSON.stringify(data_collection_page),
        'EX',
        3600,
      )
      .catch((err) => {
        const location = 'REDIS set data_collection_page'
        handleError(location, err)
      })

    return data_collection_page
  } else {
    return { variants: [], brands: [] }
  }
}

export async function getVariantsProductPageCached(
  product_type: string,
): Promise<typeVariant[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let variants_product_type

    try {
      variants_product_type = await redis.get(
        `product_page_variants_${product_type}`,
      )
    } catch (err) {
      const location = 'REDIS get variants product page'
      handleError(location, err)
    }

    if (variants_product_type) {
      return JSON.parse(variants_product_type)
    } else {
      try {
        variants_product_type = await getVariantsProductPage(product_type)
      } catch (err) {
        const location = 'POSTGRES get variants product page'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set(
        `product_page_variants_${product_type}`,
        JSON.stringify(variants_product_type),
        'EX',
        3600,
      )
      .catch((err) => {
        const location = 'REDIS set variants product page'
        handleError(location, err)
      })

    return variants_product_type
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
      const location = 'REDIS get pages'
      handleError(location, err)
    }

    if (pages) {
      return JSON.parse(pages)
    } else {
      try {
        pages = await getPages()
      } catch (err) {
        const location = 'POSTGRES get pages'
        handleError(location, err)

        throw err
      }
    }

    void redis.set('pages', JSON.stringify(pages), 'EX', 3600).catch((err) => {
      const location = 'REDIS set pages'
      handleError(location, err)
    })

    return pages
  } else {
    return []
  }
}

export async function getProductTypeReviewsCached(
  product_type: typeReview['product_type'],
): Promise<typeReview[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let reviews

    try {
      reviews = await redis.get('reviews')
    } catch (err) {
      const location = 'REDIS get reviews'
      handleError(location, err)
    }

    if (reviews) {
      return JSON.parse(reviews)
    } else {
      try {
        reviews = await getProductTypeReviews(product_type)
      } catch (err) {
        const location = 'POSTGRES get reviews'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('reviews', JSON.stringify(reviews), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set reviews'
        handleError(location, err)
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
      const location = 'REDIS get shipping'
      handleError(location, err)
    }

    if (shipping) {
      return JSON.parse(shipping)
    } else {
      try {
        shipping = await getShipping()
      } catch (err) {
        const location = 'POSTGRES get shipping'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('shipping', JSON.stringify(shipping), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set shipping'
        handleError(location, err)
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
      const location = 'REDIS get home_page'
      handleError(location, err)
    }

    if (home_page) {
      return JSON.parse(home_page)
    } else {
      try {
        home_page = await getHomePage()
      } catch (err) {
        const location = 'POSTGRES get home_page'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('home_page', JSON.stringify(home_page), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set home_page'
        handleError(location, err)
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
      const location = 'REDIS get home_page_variants'
      handleError(location, err)
    }

    if (home_page_variants) {
      return JSON.parse(home_page_variants)
    } else {
      try {
        home_page_variants = await getHomePageVariants()
      } catch (err) {
        const location = 'POSTGRES get home_page_variants'
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('home_page_variants', JSON.stringify(home_page_variants), 'EX', 3600)
      .catch((err) => {
        const location = 'REDIS set home_page_variants'
        handleError(location, err)
      })

    return home_page_variants
  } else {
    return []
  }
}
