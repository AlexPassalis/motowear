import { errorInvalidBody, errorPostgres } from '@/data/error'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { abandoned_cart } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { zodCart } from '@/lib/postgres/data/zod'
import { toZonedTime } from 'date-fns-tz'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  let validatedBody
  try {
    const result = z
      .object({
        email: z.string().email(),
        cart: zodCart,
      })
      .safeParse(await req.json())
    if (result.error) {
      const message = formatMessage(
        '@/app/api/user/abandon_cart/route.ts POST zod',
        errorInvalidBody,
        result.error,
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
    }
    validatedBody = result.data
  } catch (err) {
    const message = formatMessage(
      '@/app/api/user/abandon_cart/route.ts POST req.json()',
      errorInvalidBody,
      err,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .insert(abandoned_cart)
      .values({
        email: validatedBody.email,
        cart: validatedBody.cart,
        date: toZonedTime(new Date(), 'Europe/Athens'),
      })
      .onConflictDoUpdate({
        target: [abandoned_cart.email],
        set: {
          cart: validatedBody.cart,
          date: toZonedTime(new Date(), 'Europe/Athens'),
        },
      })
  } catch (err) {
    const message = formatMessage(
      '@/app/api/user/abandon_cart/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
  }

  return NextResponse.json({}, { status: 200 })
}
