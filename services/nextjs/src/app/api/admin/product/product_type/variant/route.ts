import { zodVariants } from '@/lib/postgres/data/zod'

import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  errorInvalidBody,
  errorPostgres,
  errorRedis,
  errorTypesense,
} from '@/data/error'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { updateTypesense } from '@/lib/typesense/server'
import { variant } from '@/lib/postgres/schema'
import pLimit from 'p-limit'
import { eq } from 'drizzle-orm'
import { redis } from '@/lib/redis/index'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { getVariants } from '@/utils/getPostgres'
import { v4 as id } from 'uuid'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        variants: zodVariants,
      })
      .parse(await req.json())
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts POST',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
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
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await updateTypesense(validatedBody.variants[0].product_type)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: errorTypesense }, { status: 500 })
  }

  let variants_postgres
  try {
    variants_postgres = await getVariants()
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await redis.set('variants', JSON.stringify(variants_postgres), 'EX', 3600)
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts POST',
      errorRedis,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        id: z.string(),
        product_type: z.string(),
      })
      .parse(await req.json())
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts DELETE',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres.delete(variant).where(eq(variant.id, validatedBody.id))
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts DELETE',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await updateTypesense(validatedBody.product_type)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: errorTypesense }, { status: 500 })
  }

  let variants_postgres
  try {
    variants_postgres = await getVariants()
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await redis.set('variants', JSON.stringify(variants_postgres), 'EX', 3600)
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts DELETE',
      errorRedis,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
