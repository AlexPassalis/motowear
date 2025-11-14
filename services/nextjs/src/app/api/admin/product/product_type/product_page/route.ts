import { zodProductPage } from '@/lib/postgres/data/zod'

import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { product_pages } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { getPages } from '@/utils/getPostgres'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ productPage: zodProductPage })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    await handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
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
          images: validatedBody.productPage.images,
          faq: validatedBody.productPage.faq,
          carousel: validatedBody.productPage.carousel,
          upsell: validatedBody.productPage.upsell,
        },
      })
  } catch (err) {
    const location = 'POST POSTGRES insert product_pages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let pages_postgres
  try {
    pages_postgres = await getPages()
  } catch (err) {
    const location = 'POST GET getPages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (err) {
    const location = 'POST REDIS set pages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
