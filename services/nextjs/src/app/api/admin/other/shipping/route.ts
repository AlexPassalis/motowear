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
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .insert(shipping)
      .values({
        primary_key: 'primary_key',
        expense: validatedBody.shipping.expense,
        free: validatedBody.shipping.free,
        surcharge: validatedBody.shipping.surcharge,
      })
      .onConflictDoUpdate({
        target: shipping.primary_key,
        set: {
          expense: validatedBody.shipping.expense,
          free: validatedBody.shipping.free,
          surcharge: validatedBody.shipping.surcharge,
        },
      })
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/other/shipping/route.ts POST',
      errorPostgres,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }

  try {
    await redis.set(
      'shipping',
      JSON.stringify({
        expense: validatedBody.shipping.expense,
        free: validatedBody.shipping.free,
      }),
      'EX',
      3600,
    )
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/other/shipping/route.ts POST',
      errorRedis,
      e,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
