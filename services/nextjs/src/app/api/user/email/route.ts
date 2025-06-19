import type { typeCoupon } from '@/lib/postgres/data/type'

import { errorInvalidBody, errorPostgres } from '@/data/error'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { email } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { DatabaseError } from 'pg'

export async function POST(req: NextRequest) {
  const { error, data: validatedBody } = z
    .object({ email: z.string().email() })
    .safeParse(await req.json())
  if (error) {
    const message = formatMessage(
      '@/app/api/user/email/route.ts POST',
      errorInvalidBody,
      error,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres.insert(email).values({ email: validatedBody.email })
  } catch (err) {
    if (err instanceof DatabaseError && err.code === '23505') {
      return NextResponse.json({}, { status: 209 })
    } else {
      const message = formatMessage(
        '@/app/api/user/email/route.ts POST',
        errorPostgres,
        err,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      return NextResponse.json({ message: errorPostgres }, { status: 500 })
    }
  }

  return NextResponse.json(
    {
      coupon: {
        coupon_code: 'FREEMPRELOK',
        percentage: null,
        fixed: null,
      } as typeCoupon,
    },
    { status: 200 },
  )
}
