import { zodCoupons } from '@/lib/postgres/data/zod'

import { postgres } from '@/lib/postgres/index'
import { NextRequest, NextResponse } from 'next/server'
import { coupon } from '@/lib/postgres/schema'
import { z } from 'zod'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ coupons: zodCoupons })
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
  } catch (err) {
    const location = 'POST POSTGRES insert coupon'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
