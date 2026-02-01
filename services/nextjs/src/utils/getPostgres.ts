import type { SQL } from 'drizzle-orm'
import type { Collection, typeReview } from '@/lib/postgres/data/type'

import { postgres } from '@/lib/postgres'
import {
  product_pages,
  brand,
  review,
  order,
  daily_session,
  shipping,
  home_page,
  coupon,
  email,
  phone,
  collection,
  product,
} from '@/lib/postgres/schema'
import {
  eq,
  and,
  sql,
  not,
  or,
  isNull,
  isNotNull,
  desc,
  inArray,
} from 'drizzle-orm'
import { ERROR, special_products } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

export async function getProductTypes() {
  const array = await postgres
    .select({ product_type: product_pages.product_type })
    .from(product_pages)
    .orderBy(
      sql`CASE
              WHEN ${product_pages.product_type} = 'Φούτερ'    THEN 0
              WHEN ${product_pages.product_type} = 'Μπλουζάκι' THEN 1
              ELSE 2
            END`,
    )

  return array.map((row) => row.product_type)
}
export type typeProductTypes = Awaited<ReturnType<typeof getProductTypes>>

export async function getAllProducts() {
  return await postgres.select().from(product)
}

export async function getCollection(collection_name: Collection['name']) {
  const data = await postgres
    .select()
    .from(collection)
    .where(eq(collection.name, collection_name))
    .limit(1)

  return data[0]
}

export async function getAllCollections() {
  return await postgres.select().from(collection)
}

export async function getPages() {
  return await postgres.select().from(product_pages)
}

export async function getShipping() {
  const array = await postgres.select().from(shipping)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primary_key, ...rest } = array[0]

  return rest
}
export type typeShipping = Awaited<ReturnType<typeof getShipping>>

export async function getHomePage() {
  const array = await postgres.select().from(home_page)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primary_key, ...rest } = array[0]

  return rest
}
export type typeHomePage = Awaited<ReturnType<typeof getHomePage>>

export async function getHomePageVariants() {
  const product_types = await getProductTypes()
  const arrays = await Promise.all(
    product_types.map(async (product_type) => {
      const collections = await postgres
        .select({ id: collection.id })
        .from(collection)
        .where(eq(collection.name, product_type))
        .limit(1)

      if (collections.length === 0) {
        return []
      }

      const products = await postgres
        .selectDistinctOn([product.name], {
          name: product.name,
          image: sql`${product.images}[1]` as SQL<string>,
        })
        .from(product)
        .where(eq(product.collection_id, collections[0].id))
        .orderBy(product.name)
        .limit(4)

      return products.map((p) => ({
        product_type,
        name: p.name,
        image: p.image,
      }))
    }),
  )

  return arrays.flat()
}
export type typeHomePageVariants = Awaited<
  ReturnType<typeof getHomePageVariants>
>

export async function getReviewsCollection(
  product_type: typeReview['product_type'],
) {
  return await postgres
    .select()
    .from(review)
    .where(eq(review.product_type, product_type))
    .orderBy(desc(review.date))
}

export async function getBrands() {
  const array = await postgres
    .select({ image: brand.image })
    .from(brand)
    .where(not(eq(brand.image, '')))
    .orderBy(brand.index)

  return array.map((row) => row.image)
}
export type typeBrands = Awaited<ReturnType<typeof getBrands>>

export async function getProductPage(product_type: string) {
  const array = await postgres
    .select()
    .from(product_pages)
    .where(eq(product_pages.product_type, product_type))
    .limit(1)

  return array[0]
}

export async function getProductReviews(product_type: string) {
  return await postgres
    .select()
    .from(review)
    .where(eq(review.product_type, product_type))
    .orderBy(desc(review.date))
}

export async function getOrders() {
  return await postgres
    .select()
    .from(order)
    .where(or(eq(order.paid, true), isNull(order.paid)))
    .orderBy(desc(order.order_date))
}

export async function getDailySessions() {
  return await postgres.select().from(daily_session)
}
export type typeDailySessions = Awaited<ReturnType<typeof getDailySessions>>

export async function getCoupons() {
  return await postgres.select().from(coupon)
}
export type typeCoupons = Awaited<ReturnType<typeof getCoupons>>

export async function getEmails() {
  return await postgres.select().from(email)
}
export type typeEmails = Awaited<ReturnType<typeof getEmails>>

export async function getPhones() {
  const array = await postgres.select().from(phone)

  return array.map((obj) => obj.phone)
}
export type typePhones = Awaited<ReturnType<typeof getPhones>>

export async function getOrder(order_id: string) {
  return await postgres
    .select()
    .from(order)
    .where(
      and(
        eq(order.id, Number(order_id)),
        eq(order.review_email, true),
        eq(order.review_submitted, false),
      ),
    )
}

export async function getOrderByOrderCode(order_code: string) {
  const array = await postgres
    .select()
    .from(order)
    .where(and(eq(order.order_code, order_code)))

  return array[0]
}
export type typeOrderByOrderCode = Awaited<
  ReturnType<typeof getOrderByOrderCode>
>

export async function unsubscribe(customer_email: string) {
  return await postgres.delete(email).where(eq(email.email, customer_email))
}

export async function getVariantsProductType(product_type: string) {
  const collections = await postgres
    .select({ id: collection.id })
    .from(collection)
    .where(eq(collection.name, product_type))
    .limit(1)

  if (collections.length === 0) {
    return []
  }

  const products_raw = await postgres
    .select()
    .from(product)
    .innerJoin(collection, eq(product.collection_id, collection.id))
    .where(eq(product.collection_id, collections[0].id))
    .orderBy(product.name)

  return products_raw.map(({ product: prod }) => {
    let prod_image = prod.images[0]

    if (!prod_image) {
      const location = `${ERROR.unexpected} getVariantsProductType`
      const err = `The ${product_type} ${prod.name} is missing an image`
      handleError(location, err)

      prod_image = ''
    }

    return {
      id: prod.id,
      product_type,
      name: prod.name,
      image: prod_image,
    }
  })
}

export async function getCollectionPageData(product_type: string) {
  const collections = await postgres
    .select({
      id: collection.id,
    })
    .from(collection)
    .where(eq(collection.name, product_type))
    .limit(1)

  if (collections.length === 0) {
    return {
      collection: {
        id: '',
        name: '',
        description: '',
        price: null,
        price_before: null,
        sizes: null,
        upsell_collection: null,
        upsell_product: null,
        sold_out: null,
      },
      reviews: [],
      brands: [],
      products: [],
      upsells: [],
    }
  }

  const collection_row = collections[0]

  const [products, unique_brands] = await Promise.all([
    postgres
      .selectDistinctOn([product.name], {
        name: product.name,
        brand: product.brand,
        images: product.images,
      })
      .from(product)
      .where(eq(product.collection_id, collection_row.id))
      .orderBy(product.name),
    postgres
      .selectDistinctOn([product.brand], { brand: product.brand })
      .from(product)
      .where(
        and(
          eq(product.collection_id, collection_row.id),
          isNotNull(product.brand),
        ),
      )
      .orderBy(product.brand),
  ])

  const collection_page_products = products.map((product_item) => ({
    name: product_item.name,
    ...(product_item.brand && { brand: product_item.brand }),
    image: product_item.images[0],
  }))

  const brands = unique_brands.map((b) => b.brand as string) // null values have been filtered out by the query

  return { brands, products: collection_page_products }
}

export async function getProductPageData(product_type: string) {
  const collections = await postgres
    .select()
    .from(collection)
    .where(eq(collection.name, product_type))
    .limit(1)
  if (collections.length !== 1) {
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
  const collection_row = collections[0]

  const products_raw = await postgres
    .select()
    .from(product)
    .innerJoin(collection, eq(product.collection_id, collection.id))
    .where(eq(product.collection_id, collection_row.id))
  const products_with_variants = products_raw.map(
    ({ collection: coll, product: prod }) => {
      const price = prod.price ?? coll.price
      const price_before = prod.price_before ?? coll.price_before
      const sold_out = prod.sold_out ?? coll.sold_out
      const sizes =
        prod.sizes && prod.sizes.length > 0 ? prod.sizes : collection_row.sizes

      return {
        id: prod.id,
        name: prod.name,
        ...(prod.brand && { brand: prod.brand }),
        ...(prod.description && { description: prod.description }),
        ...(price != null && { price }),
        ...(price_before != null && { price_before }),
        ...(prod.color && { color: prod.color }),
        images: prod.images,
        ...(prod.upsell_collection && {
          upsell_collection: prod.upsell_collection,
        }),
        ...(prod.upsell_product && { upsell_product: prod.upsell_product }),
        ...(sold_out && { sold_out }),
        ...(sizes && sizes.length > 0 && { sizes }),
      }
    },
  )

  const sorted_products = products_with_variants.sort(
    ({ name: name_a }, { name: name_b }) => {
      if (name_a === 'Επίλεξε μηχανή') {
        return -1
      }
      if (name_b === 'Επίλεξε μηχανή') {
        return 1
      }
      if (special_products.includes(name_a)) {
        return 1
      }
      if (special_products.includes(name_b)) {
        return -1
      }
      return name_a.localeCompare(name_b)
    },
  )

  const upsell_items = [
    ...(collection_row.upsell_collection && collection_row.upsell_product
      ? [
          {
            collection: collection_row.upsell_collection,
            product: collection_row.upsell_product,
          },
        ]
      : []),
    ...sorted_products
      .filter(
        (product_item) =>
          product_item.upsell_collection && product_item.upsell_product,
      )
      .map((product_item) => ({
        collection: product_item.upsell_collection as string,
        product: product_item.upsell_product as string,
      })),
  ]

  const upsells_with_variants =
    upsell_items.length === 0
      ? []
      : await (async () => {
          const upsell_product_names = upsell_items.map((item) => item.product)

          const upsells_raw = await postgres
            .select()
            .from(product)
            .innerJoin(collection, eq(product.collection_id, collection.id))
            .where(inArray(product.name, upsell_product_names))

          return upsells_raw.map(({ collection: coll, product: prod }) => {
            const price = prod.price ?? coll.price
            const price_before = prod.price_before ?? coll.price_before
            const sold_out = prod.sold_out ?? coll.sold_out
            const sizes =
              prod.sizes && prod.sizes.length > 0 ? prod.sizes : coll.sizes

            return {
              id: prod.id,
              collection: coll.name,
              name: prod.name,
              ...(price != null && { price }),
              ...(price_before != null && { price_before }),
              ...(prod.color && { color: prod.color }),
              images: prod.images,
              ...(sold_out && { sold_out }),
              ...(sizes && sizes.length > 0 && { sizes }),
              cash_on_delivery: coll.cash_on_delivery,
            }
          })
        })()

  const brands = [
    ...new Set(
      sorted_products
        .filter(
          (product_item) =>
            product_item.brand !== null && product_item.brand !== undefined,
        )
        .map((product_item) => product_item.brand as string),
    ),
  ].sort()

  const reviews = await getReviewsCollection(product_type)

  return {
    collection: collection_row,
    reviews,
    brands,
    products: sorted_products,
    upsells: upsells_with_variants,
  }
}

export async function getUniqueVariantNames() {
  const array = await postgres
    .selectDistinctOn([product.name])
    .from(product)
    .orderBy(product.name)

  return array.map((row) => row.name)
}

export type typeUniqueVariantNames = Awaited<
  ReturnType<typeof getUniqueVariantNames>
>

export async function getCustomerDetails(email: string) {
  const array = await postgres
    .select({ checkout: order.checkout })
    .from(order)
    .where(sql`lower(${order.checkout} ->> 'email') = lower(${email})`)
    .orderBy(desc(order.order_date))
    .limit(1)

  return array[0]
}
