import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { review } from '@/lib/postgres/schema'
import { handleError } from '@/utils/error/handleError'
import { redis } from '@/lib/redis/index'
import { revalidatePath } from 'next/cache'
import { ERROR } from '@/data/magic'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({
    product_type: z.string(),
    id: z.string(),
  })
  const requestBody = await req.json()

  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres
      .delete(review)
      .where(
        and(
          eq(review.product_type, validatedBody.product_type),
          eq(review.id, validatedBody.id),
        ),
      )
  } catch (err) {
    const location = 'DELETE POSTGRES delete review'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.del(`reviews_${validatedBody.product_type}`)
  } catch (err) {
    const location = `${ERROR.redis} DELETE delete reviews cache`
    handleError(location, err)
  }

  revalidatePath('/product', 'layout')

  return NextResponse.json({}, { status: 200 })
}
