import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { and, eq } from 'drizzle-orm'
import { errorInvalidBody, errorPostgres } from '@/data/error'
import { headers } from 'next/headers'
import { review } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const { error: err, data: validatedBody } = z
    .object({ product_type: z.string(), id: z.string() })
    .safeParse(await req.json())

  if (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/review/delete/route.ts DELETE',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .delete(review)
      .where(
        and(
          eq(review.product_type, validatedBody.product_type),
          eq(review.id, validatedBody.id),
        ),
      )
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/review/delete/route.ts DELETE product_pages',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
