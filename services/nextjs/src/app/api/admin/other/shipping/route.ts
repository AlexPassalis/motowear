import { zodShipping } from '@/lib/postgres/data/zod'

import { postgres } from '@/lib/postgres/index'
import { formatMessage } from '@/utils/formatMessage'
import { errorInvalidBody, errorPostgres, errorRedis } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { shipping } from '@/lib/postgres/schema'
import { z } from 'zod'
import { redis } from '@/lib/redis/index'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const { error, data: validatedBody } = z
    .object({ shipping: zodShipping })
    .safeParse(await req.json())

  if (error) {
    const message = formatMessage(
      '@/app/api/admin/other/shipping/route.ts POST',
      errorInvalidBody,
      error,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .insert(shipping)
      .values({
        primary_key: 'primary_key',
        expense_elta_courier: validatedBody.shipping.expense_elta_courier,
        expense_box_now: validatedBody.shipping.expense_box_now,
        free: validatedBody.shipping.free,
        surcharge: validatedBody.shipping.surcharge,
      })
      .onConflictDoUpdate({
        target: shipping.primary_key,
        set: {
          expense_elta_courier: validatedBody.shipping.expense_elta_courier,
          expense_box_now: validatedBody.shipping.expense_box_now,
          free: validatedBody.shipping.free,
          surcharge: validatedBody.shipping.surcharge,
        },
      })
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/other/shipping/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await redis.set(
      'shipping',
      JSON.stringify({
        expense_elta_courier: validatedBody.shipping.expense_elta_courier,
        expense_box_now: validatedBody.shipping.expense_box_now,
        free: validatedBody.shipping.free,
        surcharge: validatedBody.shipping.surcharge,
      }),
      'EX',
      3600,
    )
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/other/shipping/route.ts POST',
      errorRedis,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
