import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { sql } from 'drizzle-orm'
import {
  errorInvalidBody,
  errorMinio,
  errorPostgres,
  errorRedis,
  errorTypesense,
} from '@/data/error'
import { headers } from 'next/headers'
import { deleteTypeImages } from '@/lib/minio'
import { updateTypesense } from '@/lib/typesense/server'
import { product_pages } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { redis } from '@/lib/redis/index'
import {
  getHomePageVariants,
  getPages,
  getProductTypes,
  getVariants,
} from '@/utils/getPostgres'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({ product_type: z.string() })
      .parse(await req.json())
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/route.ts POST',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres.insert(product_pages).values({
      product_type: validatedBody.product_type,
      size_chart: '',
      product_description: '',
      faq: [],
      carousel: [],
      upsell: '',
    })
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  let product_types_postgres
  let pages_postgres
  try {
    product_types_postgres = await getProductTypes()
    pages_postgres = await getPages()
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 500 })
  }

  try {
    await redis.set(
      'product_types',
      JSON.stringify(product_types_postgres),
      'EX',
      3600,
    )
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/route.ts POST',
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

  const bodyType = z.object({ productType: z.string() })
  const body = await req.json()
  const { data: validatedBody } = bodyType.safeParse(body)
  if (!validatedBody) {
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  const { productType } = validatedBody
  try {
    await postgres.execute(sql`
      DROP TABLE IF EXISTS product."${sql.raw(productType)}"
    `)
  } catch (err) {
    console.error(errorPostgres, err)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await deleteTypeImages(`${productType}`)
  } catch (err) {
    console.error(errorMinio, err)
    return NextResponse.json({ message: errorMinio }, { status: 500 })
  }

  try {
    await updateTypesense(productType)
  } catch (err) {
    console.error(errorTypesense, err)
    return NextResponse.json({ message: errorTypesense }, { status: 500 })
  }

  let product_types
  let variants
  let pages
  let home_page_variants
  try {
    product_types = await getProductTypes()
    variants = await getVariants()
    pages = await getPages()
    home_page_variants = await getHomePageVariants()
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 500 })
  }

  try {
    await redis.set('product_types', JSON.stringify(product_types), 'EX', 3600)
    await redis.set('variants', JSON.stringify(variants), 'EX', 3600)
    await redis.set('pages', JSON.stringify(pages), 'EX', 3600)
    await redis.set(
      'home_page_variants',
      JSON.stringify(home_page_variants),
      'EX',
      3600,
    )
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/route.ts DELETE',
      errorRedis,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
