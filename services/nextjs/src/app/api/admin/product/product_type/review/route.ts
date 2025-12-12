import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { zodTypeReviews } from '@/lib/postgres/data/zod'
import { postgres } from '@/lib/postgres/index'
import { review } from '@/lib/postgres/schema'
import pLimit from 'p-limit'
import { redis } from '@/lib/redis/index'
import { handleError } from '@/utils/error/handleError'
import { getProductReviews } from '@/utils/getPostgres'
import { v4 as id } from 'uuid'
import { ERROR } from '@/data/magic'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let requestBody
  try {
    requestBody = await req.json()
  } catch (err) {
    const location = 'POST parse request body'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 400 })
  }

  const requestBodySchema = z.object({ reviews: zodTypeReviews })
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
      validatedBody.reviews.map((r) =>
        limit(
          async () =>
            await postgres
              .insert(review)
              .values({
                ...r,
                id: r.id ? r.id : id(),
              })
              .onConflictDoUpdate({
                target: [review.id],
                set: {
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
  } catch (err) {
    const location = 'POST POSTGRES insert review'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let reviews_postgres
  try {
    reviews_postgres = await getProductReviews(
      validatedBody.reviews[0].product_type,
    )
  } catch (err) {
    const location = 'POST POSTGRES getProductReviews'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set(
      `reviews_${validatedBody.reviews[0].product_type}`,
      JSON.stringify(reviews_postgres),
      'EX',
      3600,
    )
  } catch (err) {
    const location = `${ERROR.redis} POST set reviews`
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
