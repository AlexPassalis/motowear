import { zodProducts } from '@/lib/postgres/data/zod'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { product_v2, collection_v2 } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { handleError } from '@/utils/error/handleError'
import { eq } from 'drizzle-orm'
import { v4 as id } from 'uuid'
import { updateTypesense } from '@/lib/typesense/server'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const request_body_schema = z.object({ products: zodProducts })
  const request_body = await req.json()

  const { error, data: validated_body } = request_body_schema.safeParse(request_body)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    for (const product of validated_body.products) {
      const collection = await postgres
        .select()
        .from(collection_v2)
        .where(eq(collection_v2.id, product.collection_id))
        .limit(1)

      if (collection.length === 0) {
        throw new Error(`Collection not found: ${product.collection_id}`)
      }

      const collection_defaults = collection[0]

      const normalized_product = {
        id: product.id || id(),
        collection_id: product.collection_id,
        name: product.name,
        brand: product.brand,
        color: product.color,
        images: product.images,
        sizes: product.sizes,
        description:
          product.description === collection_defaults.description
            ? null
            : product.description,
        price:
          product.price === collection_defaults.price ? null : product.price,
        price_before:
          product.price_before === collection_defaults.price_before
            ? null
            : product.price_before,
        upsell_collection:
          product.upsell_collection === collection_defaults.upsell_collection &&
          product.upsell_product === collection_defaults.upsell_product
            ? null
            : product.upsell_collection,
        upsell_product:
          product.upsell_collection === collection_defaults.upsell_collection &&
          product.upsell_product === collection_defaults.upsell_product
            ? null
            : product.upsell_product,
        sold_out:
          product.sold_out === collection_defaults.sold_out
            ? null
            : product.sold_out,
      }

      await postgres
        .insert(product_v2)
        .values(normalized_product)
        .onConflictDoUpdate({
          target: [product_v2.id],
          set: {
            collection_id: normalized_product.collection_id,
            name: normalized_product.name,
            brand: normalized_product.brand,
            description: normalized_product.description,
            price: normalized_product.price,
            price_before: normalized_product.price_before,
            color: normalized_product.color,
            images: normalized_product.images,
            sizes: normalized_product.sizes,
            upsell_collection: normalized_product.upsell_collection,
            upsell_product: normalized_product.upsell_product,
            sold_out: normalized_product.sold_out,
          },
        })
    }
  } catch (err) {
    const location = 'POST POSTGRES upsert product_v2'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  if (validated_body.products.length > 0) {
    let collection_name: string | null = null

    try {
      const collection = await postgres
        .select({ name: collection_v2.name })
        .from(collection_v2)
        .where(eq(collection_v2.id, validated_body.products[0].collection_id))
        .limit(1)

      if (collection[0]) {
        collection_name = collection[0].name
        await redis.del(`product_page_data_${collection[0].name}`)
        await redis.del(`collection_page_data_${collection[0].name}`)
        await redis.del('home_page_variants')
      }
    } catch (err) {
      const location = 'POST REDIS delete cache'
      handleError(location, err)
    }

    if (collection_name) {
      try {
        await updateTypesense(collection_name)
      } catch (err) {
        const location = 'POST TYPESENSE updateTypesense'
        handleError(location, err)

        return NextResponse.json({ err: location }, { status: 500 })
      }
    }
  }

  return NextResponse.json({}, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const request_body_schema = z.object({
    id: z.string(),
    collection_id: z.string(),
  })
  const request_body = await req.json()

  const { error, data: validated_body } = request_body_schema.safeParse(request_body)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres.delete(product_v2).where(eq(product_v2.id, validated_body.id))
  } catch (err) {
    const location = 'DELETE POSTGRES delete product_v2'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let collection_name: string | null = null

  try {
    const collection = await postgres
      .select({ name: collection_v2.name })
      .from(collection_v2)
      .where(eq(collection_v2.id, validated_body.collection_id))
      .limit(1)

    if (collection[0]) {
      collection_name = collection[0].name
      await redis.del(`product_page_data_${collection[0].name}`)
      await redis.del(`collection_page_data_${collection[0].name}`)
      await redis.del('home_page_variants')
    }
  } catch (err) {
    const location = 'DELETE REDIS delete cache'
    handleError(location, err)
  }

  if (collection_name) {
    try {
      await updateTypesense(collection_name)
    } catch (err) {
      const location = 'DELETE TYPESENSE updateTypesense'
      handleError(location, err)

      return NextResponse.json({ err: location }, { status: 500 })
    }
  }

  return NextResponse.json({}, { status: 200 })
}
