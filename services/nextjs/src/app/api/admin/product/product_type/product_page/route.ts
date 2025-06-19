import { zodProductPage } from '@/lib/postgres/data/zod'

import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorInvalidBody, errorPostgres, errorRedis } from '@/data/error'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { product_pages } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { getPages } from '@/utils/getPostgres'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        productPage: zodProductPage,
      })
      .parse(await req.json())
  } catch (e) {
    const message = formatMessage(
      '@/app/api/product/product_type/product_page/route.ts POST',
      errorInvalidBody,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .insert(product_pages)
      .values({
        ...validatedBody.productPage,
      })
      .onConflictDoUpdate({
        target: [product_pages.product_type],
        set: {
          size_chart: validatedBody.productPage.size_chart,
          product_description: validatedBody.productPage.product_description,
          faq: validatedBody.productPage.faq,
          carousel: validatedBody.productPage.carousel,
          upsell: validatedBody.productPage.upsell,
        },
      })
  } catch (e) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  let pages_postgres
  try {
    pages_postgres = await getPages()
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 })
  }

  try {
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (e) {
    const message = formatMessage(
      '@/app/api/product/product_type/variant/route.ts POST',
      errorRedis,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
