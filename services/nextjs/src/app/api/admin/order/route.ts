import { isSessionAPI } from '@/lib/better-auth/isSession'
import { postgres } from '@/lib/postgres'
import { order } from '@/lib/postgres/schema'
import { handleError } from '@/utils/error/handleError'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { zodOrderServer } from '@/lib/postgres/data/zod'
import pLimit from 'p-limit'
import { eq } from 'drizzle-orm'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({
    orders: z.array(zodOrderServer),
  })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    await handleError(location, err)
    return NextResponse.json({ err }, { status: 400 })
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
    const location = 'POST POSTGRES insert order'
    await handleError(location, err)
    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ id: z.number() })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    await handleError(location, err)
    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres.delete(order).where(eq(order.id, validatedBody.id))
  } catch (err) {
    const location = 'DELETE POSTGRES delete order'
    await handleError(location, err)
    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
