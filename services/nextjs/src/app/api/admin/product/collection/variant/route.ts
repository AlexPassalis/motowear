import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { variant_v2 } from '@/lib/postgres/schema'
import { handleError } from '@/utils/error/handleError'
import { v4 as id } from 'uuid'
import { eq } from 'drizzle-orm'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  const request_body_schema = z.object({
    variants: z.array(
      z.object({
        product_id: z.string(),
        sizes: z.array(z.string()),
      })
    ),
  })
  const request_body = await req.json()

  const { error, data: validated_body } = request_body_schema.safeParse(request_body)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    for (const variant of validated_body.variants) {
      const existing_variant = await postgres
        .select()
        .from(variant_v2)
        .where(eq(variant_v2.product_id, variant.product_id))
        .limit(1)

      if (existing_variant.length > 0) {
        await postgres
          .update(variant_v2)
          .set({ sizes: variant.sizes })
          .where(eq(variant_v2.product_id, variant.product_id))
      } else {
        await postgres.insert(variant_v2).values({
          id: id(),
          product_id: variant.product_id,
          sizes: variant.sizes,
        })
      }
    }
  } catch (err) {
    const location = 'POST POSTGRES upsert variant_v2'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
