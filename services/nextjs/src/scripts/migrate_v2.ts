import { postgres } from '@/lib/postgres/index'
import {
  collection_v2,
  product_v2,
  variant_v2,
  variant,
} from '@/lib/postgres/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { flush_all } from '@/lib/redis/flush_all'

export async function migrate_v2() {
  console.info('Running migrate_v2 script ...')

  // Check if migration has already been completed
  const existing_collections = await postgres.select().from(collection_v2)
  const existing_products = await postgres.select().from(product_v2)
  const existing_variants = await postgres.select().from(variant_v2)

  if (
    existing_collections.length > 0 &&
    existing_products.length > 0 &&
    existing_variants.length > 0
  ) {
    console.info(
      'Migration already completed (v2 tables have data), skipping migration',
    )

    return
  }

  const collections = await postgres
    .selectDistinct({ product_type: variant.product_type })
    .from(variant)
  console.info(
    `Found the following collections: ${collections
      .map((c) => c.product_type)
      .join(', ')}`,
  )

  for (const collection of collections) {
    console.info(`Migrating collection: ${collection.product_type}`)

    const existing = await postgres
      .select()
      .from(collection_v2)
      .where(eq(collection_v2.name, collection.product_type))

    if (existing.length > 0) {
      console.info(
        `Collection ${collection.product_type} already exists, skipping`,
      )
      continue
    }

    const variants = await postgres
      .select()
      .from(variant)
      .where(eq(variant.product_type, collection.product_type))

    const most_common_description = find_most_common(variants, 'description') || ''
    const most_common_price = find_most_common(variants, 'price') || 0
    const most_common_price_before =
      find_most_common(variants, 'price_before') || 0
    const most_common_sold_out = find_most_common(variants, 'sold_out')
    const most_common_upsell = find_most_common(variants, 'upsell')
    const most_common_sizes = find_most_common_array(variants, 'size')

    const [created_collection] = await postgres
      .insert(collection_v2)
      .values({
        name: collection.product_type,
        description: most_common_description,
        price: most_common_price,
        price_before: most_common_price_before,
        sizes: most_common_sizes,
        upsell_collection: most_common_upsell?.product_type || null,
        upsell_product: most_common_upsell?.name || null,
        sold_out: most_common_sold_out,
      })
      .returning({ name: collection_v2.name, id: collection_v2.id })

    console.info(`Created collection_v2: ${created_collection.name}`)
  }

  const collections_after = await postgres.select().from(collection_v2)
  for (const collection_after of collections_after) {
    const variants = await postgres
      .select()
      .from(variant)
      .where(eq(variant.product_type, collection_after.name))

    // Find unique product names AND colors within this collection
    const unique_products = [
      ...new Map(
        variants.map((v) => [
          `${v.name}|${v.color}`,
          { name: v.name, color: v.color },
        ]),
      ).values(),
    ]

    console.info(
      `Found ${unique_products.length} unique product/color combinations in ${collection_after.name}`,
    )

    for (const {
      name: product_name,
      color: product_color,
    } of unique_products) {
      // Check if product already exists
      const existing_product = await postgres
        .select({ id: product_v2.id })
        .from(product_v2)
        .where(
          and(
            eq(product_v2.collection_id, collection_after.id),
            eq(product_v2.name, product_name),
            product_color
              ? eq(product_v2.color, product_color)
              : isNull(product_v2.color),
          ),
        )

      if (existing_product.length > 0) {
        console.info(
          `Product ${product_name} (${product_color}) already exists, skipping`,
        )
        continue
      }

      console.info(`Creating product: ${product_name} (${product_color})`)

      // Get all variants with this name AND color
      const product_variants = variants.filter(
        (v) => v.name === product_name && v.color === product_color,
      )

      // Find most common values for this specific product
      const most_common_description = find_most_common(
        product_variants,
        'description',
      )
      const most_common_price = find_most_common(product_variants, 'price')
      const most_common_price_before = find_most_common(
        product_variants,
        'price_before',
      )
      const most_common_sold_out = find_most_common(
        product_variants,
        'sold_out',
      )
      const most_common_images = find_most_common(product_variants, 'images')
      const most_common_upsell = find_most_common(product_variants, 'upsell')
      const most_common_brand = find_most_common(product_variants, 'brand')

      // Collect all unique sizes for this product
      const product_sizes = [
        ...new Set(product_variants.map((v) => v.size).filter(Boolean)),
      ]

      // Use null if product value matches collection default (to inherit from collection)
      const product_description =
        most_common_description === collection_after.description
          ? null
          : most_common_description
      const product_price =
        most_common_price === collection_after.price ? null : most_common_price
      const product_price_before =
        most_common_price_before === collection_after.price_before
          ? null
          : most_common_price_before
      const product_sold_out =
        most_common_sold_out === collection_after.sold_out
          ? null
          : most_common_sold_out

      // Get the most common upsell for the collection
      const collection_variants = await postgres
        .select()
        .from(variant)
        .where(eq(variant.product_type, collection_after.name))
      const collection_most_common_upsell = find_most_common(
        collection_variants,
        'upsell',
      )

      // Store upsell data (only if different from collection)
      const product_upsell =
        JSON.stringify(most_common_upsell) ===
        JSON.stringify(collection_most_common_upsell)
          ? null
          : most_common_upsell

      const [created_product] = await postgres
        .insert(product_v2)
        .values({
          collection_id: collection_after.id,
          name: product_name,
          brand: most_common_brand === '' ? null : most_common_brand,
          description: product_description,
          price: product_price,
          price_before: product_price_before,
          color: product_color, // Color is notNull in schema
          images: most_common_images, // Images always stored at product level
          upsell_collection: product_upsell?.product_type || null,
          upsell_product: product_upsell?.name || null,
          sold_out: product_sold_out,
        })
        .returning({ id: product_v2.id })

      console.info(
        `Created product: ${product_name} (id: ${created_product.id})`,
      )

      // Create single variant_v2 entry with sizes array
      // Check if variant already exists
      const existing_variant = await postgres
        .select({ id: variant_v2.id })
        .from(variant_v2)
        .where(eq(variant_v2.product_id, created_product.id))

      if (existing_variant.length > 0) {
        console.info(
          `Variant for product ${product_name} already exists, skipping`,
        )
      } else {
        console.info(`Creating variant with sizes: ${product_sizes.join(', ')}`)

        await postgres.insert(variant_v2).values({
          product_id: created_product.id,
          sizes: product_sizes,
        })

        console.info(`Created variant with ${product_sizes.length} sizes`)
      }
    }
  }

  console.info('Migration complete')

  await flush_all()
}

type Variant = typeof variant.$inferSelect

function find_most_common<K extends keyof Variant>(
  variants: Variant[],
  property_name: K,
): Variant[K] {
  const counts = new Map<Variant[K], number>()
  for (const v of variants) {
    const value = v[property_name]
    const count = counts.get(value) || 0
    counts.set(value, count + 1)
  }

  let most_common_value = variants[0][property_name]
  let max_count = 0
  for (const [value, count] of counts) {
    if (count > max_count) {
      max_count = count
      most_common_value = value
    }
  }

  return most_common_value
}

function find_most_common_array<K extends keyof Variant>(
  variants: Variant[],
  property_name: K,
): string[] | null {
  const all_values = new Set<string>()
  for (const v of variants) {
    const value = v[property_name]
    if (value && typeof value === 'string') {
      all_values.add(value)
    }
  }
  return all_values.size > 0 ? Array.from(all_values) : null
}
