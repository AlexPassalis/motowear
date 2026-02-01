import type {
  typeShipping,
  typeProductTypes,
  typeHomePage,
  typeHomePageVariants,
} from '@/utils/getPostgres'
import type { typeProductPage } from '@/lib/postgres/data/type'

import { redis } from '@/lib/redis/index'
import {
  getHomePage,
  getHomePageVariants,
  getPages,
  getProductTypes,
  getShipping,
  getProductPageData,
  getCollectionPageData,
} from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export async function getProductTypesCached(): Promise<typeProductTypes> {
  if (process.env.BUILD_TIME !== 'true') {
    let product_types

    try {
      product_types = await redis.get('product_types')
    } catch (err) {
      const location = `${ERROR.redis} get product_types`
      handleError(location, err)
    }

    if (product_types) {
      return JSON.parse(product_types)
    } else {
      try {
        product_types = await getProductTypes()
      } catch (err) {
        const location = `${ERROR.postgres} get product_types`
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('product_types', JSON.stringify(product_types), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set product_types`
        handleError(location, err)
      })

    return product_types
  } else {
    return []
  }
}

export async function getCollectionPageDataCached(
  product_type: string,
): Promise<Awaited<ReturnType<typeof getCollectionPageData>>> {
  if (process.env.BUILD_TIME !== 'true') {
    const redis_key = `collection_page_data_${product_type}`
    let collection_page_data

    try {
      collection_page_data = await redis.get(redis_key)
    } catch (err) {
      const location = `${ERROR.redis} get collection_page_data`
      handleError(location, err)
    }

    if (collection_page_data) {
      return JSON.parse(collection_page_data)
    } else {
      collection_page_data = await getCollectionPageData(product_type)
    }

    void redis
      .set(redis_key, JSON.stringify(collection_page_data), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set collection_page_data`
        handleError(location, err)
      })

    return collection_page_data
  } else {
    return { brands: [], products: [] }
  }
}

export async function getProductPageDataCached(
  product_type: string,
): Promise<Awaited<ReturnType<typeof getProductPageData>>> {
  if (process.env.BUILD_TIME !== 'true') {
    const redis_key = `product_page_data_${product_type}`
    let product_page_data

    try {
      product_page_data = await redis.get(redis_key)
    } catch (err) {
      const location = `${ERROR.redis} get product_page_data`
      handleError(location, err)
    }

    if (product_page_data) {
      return JSON.parse(product_page_data)
    } else {
      try {
        product_page_data = await getProductPageData(product_type)
      } catch (err) {
        const location = `${ERROR.postgres} get product_page_data`
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set(redis_key, JSON.stringify(product_page_data), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set product_page_data`
        handleError(location, err)
      })

    return product_page_data
  } else {
    return {
      collection: {
        id: '',
        name: '',
        description: null,
        price: null,
        price_before: null,
        sizes: null,
        upsell_collection: null,
        upsell_product: null,
        sold_out: null,
        cash_on_delivery: false,
      },
      reviews: [],
      brands: [],
      products: [],
      upsells: [],
    }
  }
}

export async function getPagesCached(): Promise<typeProductPage[]> {
  if (process.env.BUILD_TIME !== 'true') {
    let pages

    try {
      pages = await redis.get('pages')
    } catch (err) {
      const location = `${ERROR.redis} get pages`
      handleError(location, err)
    }

    if (pages) {
      return JSON.parse(pages)
    } else {
      try {
        pages = await getPages()
      } catch (err) {
        const location = `${ERROR.postgres} get pages`
        handleError(location, err)

        throw err
      }
    }

    void redis.set('pages', JSON.stringify(pages), 'EX', 3600).catch((err) => {
      const location = `${ERROR.redis} set pages`
      handleError(location, err)
    })

    return pages
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
      const location = `${ERROR.redis} get shipping`
      handleError(location, err)
    }

    if (shipping) {
      return JSON.parse(shipping)
    } else {
      try {
        shipping = await getShipping()
      } catch (err) {
        const location = `${ERROR.postgres} get shipping`
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('shipping', JSON.stringify(shipping), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set shipping`
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
      const location = `${ERROR.redis} get home_page`
      handleError(location, err)
    }

    if (home_page) {
      return JSON.parse(home_page)
    } else {
      try {
        home_page = await getHomePage()
      } catch (err) {
        const location = `${ERROR.postgres} get home_page`
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('home_page', JSON.stringify(home_page), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set home_page`
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
      const location = `${ERROR.redis} get home_page_variants`
      handleError(location, err)
    }

    if (home_page_variants) {
      return JSON.parse(home_page_variants)
    } else {
      try {
        home_page_variants = await getHomePageVariants()
      } catch (err) {
        const location = `${ERROR.postgres} get home_page_variants`
        handleError(location, err)

        throw err
      }
    }

    void redis
      .set('home_page_variants', JSON.stringify(home_page_variants), 'EX', 3600)
      .catch((err) => {
        const location = `${ERROR.redis} set home_page_variants`
        handleError(location, err)
      })

    return home_page_variants
  } else {
    return []
  }
}
