import { errorInvalidBody, errorPostgres } from '@/data/error'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { postgres } from '@/lib/postgres'
import { order } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendTelegramMessage } from '@/lib/telegram'
import { zodOrderServer } from '@/lib/postgres/data/zod'
import pLimit from 'p-limit'
import { eq } from 'drizzle-orm'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        orders: z.array(zodOrderServer),
      })
      .parse(await req.json())
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/order/route.ts POST',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    const limit = pLimit(10)
    await Promise.all(
      validatedBody.orders.map((row) =>
        limit(
          async () =>
            await postgres
              .insert(order)
              .values({
                ...row,
                order_date: new Date(row.order_date),
                date_fulfilled: row.date_fulfilled
                  ? new Date(row.date_fulfilled)
                  : null,
                date_delivered: row.date_delivered
                  ? new Date(row.date_delivered)
                  : null,
              })
              .onConflictDoUpdate({
                target: [order.id],
                set: {
                  order_date: new Date(row.order_date),
                  date_fulfilled: row.date_fulfilled
                    ? new Date(row.date_fulfilled)
                    : null,
                  checkout: row.checkout,
                  cart: row.cart,
                },
              }),
        ),
      ),
    )
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/order/route.ts POST',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const body = await req.json()
  const { data: validatedBody } = z.object({ id: z.number() }).safeParse(body)
  if (!validatedBody) {
    const message = formatMessage(
      '@/app/api/admin/order/route.ts DELETE',
      errorInvalidBody,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres.delete(order).where(eq(order.id, validatedBody.id))
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/order/route.ts DELETE',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
