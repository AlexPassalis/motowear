import type { typeCoupon } from '@/lib/postgres/data/type'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { email } from '@/lib/postgres/schema'
import { DatabaseError } from 'pg'
import { couponCodeMPRELOK } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  const requestBodySchema = z.object({ email: z.string().email() })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres.insert(email).values({ email: validatedBody.email })
  } catch (err) {
    if (err instanceof DatabaseError && err.code === '23505') {
      return NextResponse.json({}, { status: 209 })
    } else {
      const location = 'POST POSTGRES insert email'
      handleError(location, err)

      return NextResponse.json({ err: location }, { status: 500 })
    }
  }

  return NextResponse.json(
    {
      coupon: {
        coupon_code: couponCodeMPRELOK,
        percentage: null,
        fixed: null,
      } as typeCoupon,
    },
    { status: 200 },
  )
}
