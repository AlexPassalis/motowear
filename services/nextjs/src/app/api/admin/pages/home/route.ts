import { zodHomePage } from '@/lib/postgres/data/zod'

import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { home_page } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { getHomePage } from '@/utils/getPostgres'
import { v4 } from 'uuid'

import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ home_page: zodHomePage })
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
    await postgres
      .insert(home_page)
      .values({ ...validatedBody.home_page, primary_key: 'primary_key' })
      .onConflictDoUpdate({
        target: [home_page.primary_key],
        set: {
          big_image: validatedBody.home_page.big_image,
          smaller_images: validatedBody.home_page.smaller_images,
          quotes: validatedBody.home_page.quotes,
          faq: validatedBody.home_page.faq,
          coupon: validatedBody.home_page.coupon,
          reviews: validatedBody.home_page.reviews.map((review) => ({
            ...review,
            id: review.id || v4(),
          })),
        },
      })
  } catch (err) {
    const location = 'POST POSTGRES insert home_page'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let home_page_cache
  try {
    home_page_cache = await getHomePage()
  } catch (err) {
    const location = 'POST REDIS getHomePage'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('home_page', JSON.stringify(home_page_cache), 'EX', 3600)
  } catch (err) {
    const location = 'POST REDIS set home_page'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
