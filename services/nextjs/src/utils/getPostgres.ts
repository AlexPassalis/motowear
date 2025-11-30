import type { SQL } from 'drizzle-orm'
import type { typeReview, typeVariant } from '@/lib/postgres/data/type'

import { postgres } from '@/lib/postgres'
import {
  product_pages,
  brand,
  variant,
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

export async function getVariants() {
  const array = await postgres.select().from(variant).orderBy(variant.index)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return array.map(({ index, ...rest }) => rest)
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
    product_types.map((product_type) =>
      postgres
        .selectDistinctOn([variant.name], {
          product_type: variant.product_type,
          name: variant.name,
          image: sql`${variant.images}[1]` as SQL<string>,
        })
        .from(variant)
        .where(eq(variant.product_type, product_type))
        .orderBy(variant.name, variant.index)
        .limit(4),
    ),
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
  const array = await postgres
    .select()
    .from(variant)
    .where(eq(variant.product_type, product_type))
    .orderBy(variant.index)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return array.map(({ index, ...rest }) => rest)
}

export async function getCollectionPageData(
  product_type: typeVariant['product_type'],
) {
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
        upsell_id: null,
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

  const special_products_filtered = products.filter((prod) =>
    special_products.includes(prod.name),
  )
  const regular_products = products.filter(
    (prod) => !special_products.includes(prod.name),
  )

  const ordered_products =
    special_products_filtered.length > 0
      ? [
          ...special_products_filtered,
          ...regular_products,
          ...special_products_filtered,
        ]
      : products

  const collection_page_products = ordered_products.map((product) => ({
    name: product.name,
    ...(product.brand && { brand: product.brand }),
    image: product.images[0],
  }))

  const brands = unique_brands.map((b) => b.brand as string) // null values have been filtered out by the query

  return { brands, products: collection_page_products }
}

export async function getProductPageData(
  product_type: typeVariant['product_type'],
) {
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
        description: '',
        price: 0,
        price_before: 0,
        sizes: [],
        upsell_id: null,
        sold_out: false,
      },
      reviews: [],
      brands: [],
      products: [],
      upsells: [],
    }
  }
  const collection = collections[0]

  const products_raw = await postgres
    .select({
      id: product_v2.id,
      name: product_v2.name,
      brand: product_v2.brand,
      description: product_v2.description,
      price: product_v2.price,
      price_before: product_v2.price_before,
      color: product_v2.color,
      images: product_v2.images,
      upsell_id: product_v2.upsell_id,
      sold_out: product_v2.sold_out,
    })
    .from(product_v2)
    .where(eq(product_v2.collection_id, collection.id))
  const products = products_raw.map((prod) => ({
    id: prod.id,
    name: prod.name,
    ...(prod.brand && { brand: prod.brand }),
    ...(prod.description && { description: prod.description }),
    ...(prod.price && { price: prod.price }),
    ...(prod.price_before && { price_before: prod.price_before }),
    ...(prod.color && { color: prod.color }),
    images: prod.images,
    ...(prod.upsell_id && { upsell_id: prod.upsell_id }),
    ...(prod.sold_out && { sold_out: prod.sold_out }),
  }))

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

    return {
      ...product,
      ...(product_variant && {
        sizes: product_variant.sizes,
      }),
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

  const upsell_ids = [
    ...(collection.upsell_id ? [collection.upsell_id] : []),
    ...sorted_products
      .filter((product) => product.upsell_id)
      .map((product) => product.upsell_id as string),
  ]

  const upsells_with_variants =
    upsell_ids.length === 0
      ? []
      : await (async () => {
          const upsells_raw = await postgres
            .select({
              id: product_v2.id,
              name: product_v2.name,
              price: product_v2.price,
              price_before: product_v2.price_before,
              color: product_v2.color,
              images: product_v2.images,
            })
            .from(product_v2)
            .where(inArray(product_v2.id, upsell_ids))

          const upsells = upsells_raw.map((upsell) => ({
            id: upsell.id,
            name: upsell.name,
            ...(upsell.price && { price: upsell.price }),
            ...(upsell.price_before && { price_before: upsell.price_before }),
            ...(upsell.color && { color: upsell.color }),
            images: upsell.images,
          }))

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

            return {
              ...upsell,
              ...(upsell_variant && { sizes: upsell_variant.sizes }),
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
    .selectDistinctOn([variant.name])
    .from(variant)
    .orderBy(variant.name)

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
