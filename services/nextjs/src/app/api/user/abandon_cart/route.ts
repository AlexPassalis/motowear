import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { abandoned_cart } from '@/lib/postgres/schema'
import { handleError } from '@/utils/error/handleError'
import { zodCart } from '@/lib/postgres/data/zod'
import { toZonedTime } from 'date-fns-tz'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  const requestBodySchema = z.object({
    email: z.string().email(),
    cart: zodCart,
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

  const { email, cart } = validatedBody
  try {
    await postgres
      .insert(abandoned_cart)
      .values({
        email: email,
        cart: cart,
        date: toZonedTime(new Date(), 'Europe/Athens'),
      })
      .onConflictDoUpdate({
        target: abandoned_cart.email,
        set: {
          cart: validatedBody.cart,
          date: toZonedTime(new Date(), 'Europe/Athens'),
        },
      })
  } catch (err) {
    const location = 'POST POSTGRES insert abandoned_cart'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
