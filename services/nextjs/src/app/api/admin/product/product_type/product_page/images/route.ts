import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { product_pages } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { getPages } from '@/utils/getPostgres'
import { sql } from 'drizzle-orm'
import { handleError } from '@/utils/error/handleError'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({
    product_type: z.string(),
    image: z.string(),
  })
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
    await postgres.execute(
      sql`
          UPDATE ${product_pages}
          SET images = COALESCE((
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements_text(${product_pages}.images) AS elem
            WHERE elem <> ${validatedBody.image}
          ), '[]'::jsonb)
          WHERE ${product_pages}.product_type = ${validatedBody.product_type}
            AND ${product_pages}.images @> ${JSON.stringify([
        validatedBody.image,
      ])}
        `,
    )
  } catch (err) {
    const location = 'DELETE POSTGRES update product_pages images'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let pages_postgres
  try {
    pages_postgres = await getPages()
  } catch (err) {
    const location = 'DELETE GET getPages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (err) {
    const location = 'DELETE REDIS set pages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
