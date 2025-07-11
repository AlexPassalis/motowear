import { zodCoupons } from '@/lib/postgres/data/zod'

import { postgres } from '@/lib/postgres/index'
import { formatMessage } from '@/utils/formatMessage'
import { errorInvalidBody, errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { coupon } from '@/lib/postgres/schema'
import { z } from 'zod'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'

import { OPTIONS } from '@/utils/OPTIONS'
export { OPTIONS }

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const { error: err, data: validatedBody } = z
    .object({ coupons: zodCoupons })
    .safeParse(await req.json())

  if (err) {
    const message = formatMessage(
      '@/app/api/admin/order/coupon/route.ts POST',
      errorInvalidBody,
      err,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    for (const new_coupon of validatedBody.coupons) {
      await postgres
        .insert(coupon)
        .values(new_coupon)
        .onConflictDoUpdate({
          target: coupon.coupon_code,
          set: {
            coupon_code: new_coupon.coupon_code,
            percentage: new_coupon.percentage,
            fixed: new_coupon.fixed,
          },
        })
    }
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/order/coupon/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }

  return NextResponse.json({}, { status: 200 })
}
