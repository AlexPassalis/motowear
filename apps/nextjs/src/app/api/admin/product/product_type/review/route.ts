import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorInvalidBody, errorPostgres, errorRedis } from '@/data/error'
import { headers } from 'next/headers'
import { zodTypeReviews } from '@/lib/postgres/data/zod'
import { postgres } from '@/lib/postgres/index'
import { review } from '@/lib/postgres/schema'
import pLimit from 'p-limit'
import { redis } from '@/lib/redis/index'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { getReviews } from '@/utils/getPostgres'
import { v4 as id } from 'uuid'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        reviews: zodTypeReviews,
      })
      .parse(await req.json())
  } catch (e) {
    const message = formatMessage(
      '@/app/api/product/product_type/review/route.ts POST',
      errorInvalidBody,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    const limit = pLimit(10)
    await Promise.all(
      validatedBody.reviews.map((r, index) =>
        limit(
          async () =>
            await postgres
              .insert(review)
              .values({
                ...r,
                index: index,
                id: r.id ? r.id : id(),
              })
              .onConflictDoUpdate({
                target: [review.id],
                set: {
                  index: index,
                  product_type: r.product_type,
                  rating: r.rating,
                  full_name: r.full_name,
                  review: r.review,
                  date: r.date,
                },
              }),
        ),
      ),
    )
  } catch (e) {
    const message = formatMessage(
      '@/app/api/product/product_type/review/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  let reviews_postgres
  try {
    reviews_postgres = await getReviews()
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 })
  }

  try {
    await redis.set('reviews', JSON.stringify(reviews_postgres), 'EX', 3600)
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
