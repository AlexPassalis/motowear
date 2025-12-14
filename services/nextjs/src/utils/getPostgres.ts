import type { SQL } from 'drizzle-orm'
import type {
  Collection,
  ColorVariant,
  typeReview,
} from '@/lib/postgres/data/type'

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
  collection_v2,
  product_v2,
  variant_v2,
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
import { special_products } from '@/data/magic'

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
  const data = await postgres
    .select()
    .from(product_v2)
    .leftJoin(collection_v2, eq(product_v2.collection_id, collection_v2.id))

  return data.map((row) => ({
    ...row.product_v2,
    collection_name: row.collection_v2!.name,
  }))
}

export async function getAllProductsWithSizes(): Promise<ColorVariant[]> {
  const data = await postgres
    .select()
    .from(product_v2)
    .leftJoin(variant_v2, eq(product_v2.id, variant_v2.product_id))

  return data.map((row) => ({
    ...row.product_v2,
    sizes: row.variant_v2?.sizes || [],
  }))
}

export async function getCollection(collection_name: Collection['name']) {
  const data = await postgres
    .select()
    .from(collection_v2)
    .where(eq(collection_v2.name, collection_name))
    .limit(1)

  return data[0]
}

export async function getAllCollections() {
  return await postgres.select().from(collection_v2)
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
        .select({ id: collection_v2.id })
        .from(collection_v2)
        .where(eq(collection_v2.name, product_type))
        .limit(1)

      if (collections.length === 0) {
        return []
      }

      const products = await postgres
        .selectDistinctOn([product_v2.name], {
          name: product_v2.name,
          image: sql`${product_v2.images}[1]` as SQL<string>,
        })
        .from(product_v2)
        .where(eq(product_v2.collection_id, collections[0].id))
        .orderBy(product_v2.name)
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
    .select({ id: collection_v2.id })
    .from(collection_v2)
    .where(eq(collection_v2.name, product_type))
    .limit(1)

  if (collections.length === 0) {
    return []
  }

  const products_raw = await postgres
    .select()
    .from(product_v2)
    .innerJoin(collection_v2, eq(product_v2.collection_id, collection_v2.id))
    .where(eq(product_v2.collection_id, collections[0].id))
    .orderBy(product_v2.name)

  return products_raw.map(({ product_v2: prod }) => ({
    id: prod.id,
    product_type,
    name: prod.name,
    image: prod.images[0],
  }))
}

export async function getCollectionPageData(product_type: string) {
  const collections = await postgres
    .select({
      id: collection_v2.id,
    })
    .from(collection_v2)
    .where(eq(collection_v2.name, product_type))
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

  const collection = collections[0]

  const [products, unique_brands] = await Promise.all([
    postgres
      .selectDistinctOn([product_v2.name], {
        name: product_v2.name,
        brand: product_v2.brand,
        images: product_v2.images,
      })
      .from(product_v2)
      .where(eq(product_v2.collection_id, collection.id))
      .orderBy(product_v2.name),
    postgres
      .selectDistinctOn([product_v2.brand], { brand: product_v2.brand })
      .from(product_v2)
      .where(
        and(
          eq(product_v2.collection_id, collection.id),
          isNotNull(product_v2.brand),
        ),
      )
      .orderBy(product_v2.brand),
  ])

  const collection_page_products = products.map((product) => ({
    name: product.name,
    ...(product.brand && { brand: product.brand }),
    image: product.images[0],
  }))

  const brands = unique_brands.map((b) => b.brand as string) // null values have been filtered out by the query

  return { brands, products: collection_page_products }
}

export async function getProductPageData(product_type: string) {
  const collections = await postgres
    .select()
    .from(collection_v2)
    .where(eq(collection_v2.name, product_type))
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
      },
      reviews: [],
      brands: [],
      products: [],
      upsells: [],
    }
  }
  const collection = collections[0]

  const products_raw = await postgres
    .select()
    .from(product_v2)
    .innerJoin(collection_v2, eq(product_v2.collection_id, collection_v2.id))
    .where(eq(product_v2.collection_id, collection.id))
  const products = products_raw.map(
    ({ collection_v2: coll, product_v2: prod }) => {
      const price = prod.price ?? coll.price
      const price_before = prod.price_before ?? coll.price_before
      const sold_out = prod.sold_out ?? coll.sold_out

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
      }
    },
  )

  const product_ids = products.map((product) => product.id)

  const variants_raw = await postgres
    .select({
      product_id: variant_v2.product_id,
      sizes: variant_v2.sizes,
    })
    .from(variant_v2)
    .where(inArray(variant_v2.product_id, product_ids))

  const products_with_variants = products.map((product) => {
    const product_variant = variants_raw.find(
      (variant) => variant.product_id === product.id,
    )
    const variant_sizes = product_variant?.sizes
    const sizes =
      variant_sizes && variant_sizes.length > 0
        ? variant_sizes
        : collection.sizes

    return {
      ...product,
      ...(sizes && sizes.length > 0 && { sizes }),
    }
  })

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
    ...(collection.upsell_collection && collection.upsell_product
      ? [
          {
            collection: collection.upsell_collection,
            product: collection.upsell_product,
          },
        ]
      : []),
    ...sorted_products
      .filter((product) => product.upsell_collection && product.upsell_product)
      .map((product) => ({
        collection: product.upsell_collection as string,
        product: product.upsell_product as string,
      })),
  ]

  const upsells_with_variants =
    upsell_items.length === 0
      ? []
      : await (async () => {
          const upsell_product_names = upsell_items.map((item) => item.product)

          const upsells_raw = await postgres
            .select()
            .from(product_v2)
            .innerJoin(
              collection_v2,
              eq(product_v2.collection_id, collection_v2.id),
            )
            .where(inArray(product_v2.name, upsell_product_names))

          const upsells = upsells_raw.map(
            ({ collection_v2: coll, product_v2: prod }) => {
              const price = prod.price ?? coll.price
              const price_before = prod.price_before ?? coll.price_before
              const sold_out = prod.sold_out ?? coll.sold_out

              return {
                id: prod.id,
                collection: coll.name,
                ...(coll.sizes && { collection_sizes: coll.sizes }),
                name: prod.name,
                ...(price != null && { price }),
                ...(price_before != null && { price_before }),
                ...(prod.color && { color: prod.color }),
                images: prod.images,
                ...(sold_out && { sold_out }),
              }
            },
          )

          const upsell_product_ids = upsells.map((upsell) => upsell.id)

          const upsell_variants_raw = await postgres
            .select({
              product_id: variant_v2.product_id,
              sizes: variant_v2.sizes,
            })
            .from(variant_v2)
            .where(inArray(variant_v2.product_id, upsell_product_ids))

          return upsells.map((upsell) => {
            const upsell_variant = upsell_variants_raw.find(
              (variant) => variant.product_id === upsell.id,
            )
            const variant_sizes = upsell_variant?.sizes
            const sizes =
              variant_sizes && variant_sizes.length > 0
                ? variant_sizes
                : upsell.collection_sizes

            // Remove collection_sizes from the returned object
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { collection_sizes, ...upsell_without_collection_sizes } =
              upsell

            return {
              ...upsell_without_collection_sizes,
              ...(sizes && sizes.length > 0 && { sizes }),
            }
          })
        })()

  const brands = [
    ...new Set(
      sorted_products
        .filter(
          (product) => product.brand !== null && product.brand !== undefined,
        )
        .map((product) => product.brand as string),
    ),
  ].sort()

  const reviews = await getReviewsCollection(product_type)

  return {
    collection,
    reviews,
    brands,
    products: sorted_products,
    upsells: upsells_with_variants,
  }
}

export async function getUniqueVariantNames() {
  const array = await postgres
    .selectDistinctOn([product_v2.name])
    .from(product_v2)
    .orderBy(product_v2.name)

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
