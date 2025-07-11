import { errorInvalidBody, errorPostgres } from '@/data/error'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { coupon } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  let validatedBody
  try {
    validatedBody = z
      .object({ coupon_code: z.string() })
      .parse(await req.json())
  } catch (e) {
    const message = formatMessage(
      '@/app/api/user/coupon_code/route.ts POST',
      errorInvalidBody,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  let couponArray
  try {
    couponArray = await postgres
      .select()
      .from(coupon)
      .where(eq(coupon.coupon_code, validatedBody.coupon_code))
      .limit(1)
  } catch (e) {
    const message = formatMessage(
      '@/app/api/user/coupon_code/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  return NextResponse.json({ couponArray: couponArray }, { status: 200 })
}
