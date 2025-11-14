import { postgres } from '@/lib/postgres/index'
import { handleError } from '@/utils/error/handleError'
import { NextRequest, NextResponse } from 'next/server'
import { coupon } from '@/lib/postgres/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { headers } from 'next/headers'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ coupon_code: z.string() })
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
    await postgres
      .delete(coupon)
      .where(eq(coupon.coupon_code, validatedBody.coupon_code))
  } catch (err) {
    const location = 'DELETE POSTGRES delete coupon'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
