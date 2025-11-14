import { zodVariants } from '@/lib/postgres/data/zod'

import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { updateTypesense } from '@/lib/typesense/server'
import { variant } from '@/lib/postgres/schema'
import pLimit from 'p-limit'
import { eq } from 'drizzle-orm'
import { redis } from '@/lib/redis/index'
import { getVariants } from '@/utils/getPostgres'
import { v4 as id } from 'uuid'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ variants: zodVariants })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    const limit = pLimit(10)
    await Promise.all(
      validatedBody.variants.map((v, index) =>
        limit(
          async () =>
            await postgres
              .insert(variant)
              .values({
                ...v,
                index: index,
                id: v.id ? v.id : id(),
              })
              .onConflictDoUpdate({
                target: [variant.id],
                set: {
                  product_type: v.product_type,
                  index: index,
                  name: v.name,
                  description: v.description,
                  images: v.images,
                  price: v.price,
                  brand: v.brand,
                  color: v.color,
                  size: v.size,
                  price_before: v.price_before,
                  upsell: v.upsell,
                  sold_out: v.sold_out,
                },
              }),
        ),
      ),
    )
  } catch (err) {
    const location = 'POST POSTGRES insert variants'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await updateTypesense(validatedBody.variants[0].product_type)
  } catch (err) {
    const location = 'POST TYPESENSE updateTypesense'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let variants_postgres
  try {
    variants_postgres = await getVariants()
  } catch (err) {
    const location = 'POST GET getVariants'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('variants', JSON.stringify(variants_postgres), 'EX', 3600)
  } catch (err) {
    const location = 'POST REDIS set variants'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({
    id: z.string(),
    product_type: z.string(),
  })
  const requestBody = await req.json()
  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres.delete(variant).where(eq(variant.id, validatedBody.id))
  } catch (err) {
    const location = 'DELETE POSTGRES delete variant'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await updateTypesense(validatedBody.product_type)
  } catch (err) {
    const location = 'DELETE TYPESENSE updateTypesense'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let variants_postgres
  try {
    variants_postgres = await getVariants()
  } catch (err) {
    const location = 'DELETE GET getVariants'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('variants', JSON.stringify(variants_postgres), 'EX', 3600)
  } catch (err) {
    const location = 'DELETE REDIS set variants'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
