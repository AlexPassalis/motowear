import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { collection_v2 } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { handleError } from '@/utils/error/handleError'
import { eq } from 'drizzle-orm'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const request_body_schema = z.object({
    collection: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      price: z.number().nullable(),
      price_before: z.number().nullable(),
      sizes: z.array(z.string()).nullable(),
      upsell_collection: z.string().nullable(),
      upsell_product: z.string().nullable(),
      sold_out: z.boolean().nullable(),
    }),
  })
  const request_body = await req.json()

  const { error, data: validated_body } = request_body_schema.safeParse(request_body)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres
      .update(collection_v2)
      .set({
        description: validated_body.collection.description,
        price: validated_body.collection.price,
        price_before: validated_body.collection.price_before,
        sizes: validated_body.collection.sizes,
        upsell_collection: validated_body.collection.upsell_collection,
        upsell_product: validated_body.collection.upsell_product,
        sold_out: validated_body.collection.sold_out,
      })
      .where(eq(collection_v2.id, validated_body.collection.id))
  } catch (err) {
    const location = 'POST POSTGRES update collection_v2'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.del(`product_page_data_${validated_body.collection.name}`)
    await redis.del(`collection_page_data_${validated_body.collection.name}`)
  } catch (err) {
    const location = 'POST REDIS delete cache'
    handleError(location, err)
  }

  return NextResponse.json({}, { status: 200 })
}
