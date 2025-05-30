import { postgres } from '@/lib/postgres/index'
import { formatMessage } from '@/utils/formatMessage'
import { errorInvalidBody, errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { coupon } from '@/lib/postgres/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const { error: err, data: validatedBody } = z
    .object({ coupon_code: z.string() })
    .safeParse(await req.json())

  if (err) {
    const message = formatMessage(
      '@/app/api/admin/order/coupon/delete/route.ts DELETE',
      errorInvalidBody,
      err
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .delete(coupon)
      .where(eq(coupon.coupon_code, validatedBody.coupon_code))
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/order/coupon/delete/route.ts DELETE',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }

  return NextResponse.json({}, { status: 200 })
}
