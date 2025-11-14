import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { coupon } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  const requestBodySchema = z.object({ coupon_code: z.string() })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  let couponArray
  try {
    couponArray = await postgres
      .select()
      .from(coupon)
      .where(
        eq(
          coupon.coupon_code,
          validatedBody.coupon_code.trim().toLocaleLowerCase(),
        ),
      )
      .limit(1)
  } catch (err) {
    const location = 'POST POSTGRES select coupon'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({ couponArray: couponArray }, { status: 200 })
}
