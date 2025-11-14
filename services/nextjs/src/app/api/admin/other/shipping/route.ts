import { zodShipping } from '@/lib/postgres/data/zod'

import { postgres } from '@/lib/postgres/index'
import { NextRequest, NextResponse } from 'next/server'
import { shipping } from '@/lib/postgres/schema'
import { z } from 'zod'
import { redis } from '@/lib/redis/index'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ shipping: zodShipping })
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
    const location = 'POST POSTGRES insert shipping'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
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
    const location = 'POST REDIS set shipping'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
