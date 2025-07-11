import type { typeCoupon } from '@/lib/postgres/data/type'

import { errorInvalidBody, errorPostgres } from '@/data/error'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { order, review } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'
import { formatMessage, formatReviewMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import pLimit from 'p-limit'
import { v4 } from 'uuid'

import { OPTIONS } from '@/utils/OPTIONS'
export { OPTIONS }

export async function POST(req: NextRequest) {
  const { error, data: validatedBody } = z
    .object({
      id: z.number(),
      full_name: z.string(),
      values: z.record(
        z.object({
          rating: z.number().min(1).max(5),
          review: z.string().refine((value) => {
            const length = value.replace(/\s+/g, '').length
            return length >= 5 && length <= 150
          }),
        }),
      ),
    })
    .safeParse(await req.json())
  if (error) {
    const message = formatMessage(
      '@/app/api/user/review/route.ts POST',
      errorInvalidBody,
      error,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    const limit = pLimit(10)
    await Promise.all(
      Object.entries(validatedBody.values).map((array) =>
        limit(async () => {
          await postgres.insert(review).values({
            id: v4(),
            product_type: array[0],
            rating: array[1].rating,
            full_name: validatedBody.full_name,
            review: array[1].review,
            date: new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
          })

          await postgres
            .update(order)
            .set({ review_submitted: true })
            .where(eq(order.id, validatedBody.id))

          await sendTelegramMessage(
            'REVIEW',
            formatReviewMessage(
              array[0],
              array[1].rating,
              validatedBody.full_name,
              array[1].review,
            ),
          )
        }),
      ),
    )
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/review/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }

  return NextResponse.json(
    { coupon_code: 'REVIEW15', percentage: 0.15, fixed: null } as typeCoupon,
    { status: 200 },
  )
}
