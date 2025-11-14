import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { handleError } from '@/utils/error/handleError'
import { postgres } from '@/lib/postgres/index'
import { home_page } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { getHomePage } from '@/utils/getPostgres'
import { sql } from 'drizzle-orm'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ question: z.string() })
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
    await postgres.execute(
      sql`
        UPDATE ${home_page}
        SET faq = COALESCE((
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(${home_page}.faq) AS elem
          WHERE elem->>'question' <> ${validatedBody.question}
        ), '[]'::jsonb)
        WHERE ${home_page}.faq @> ${JSON.stringify([
        { question: validatedBody.question },
      ])}
      `,
    )
  } catch (err) {
    const location = 'DELETE POSTGRES update home_page faq'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let home_page_cache
  try {
    home_page_cache = await getHomePage()
  } catch (err) {
    const location = 'DELETE REDIS getHomePage'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('home_page', JSON.stringify(home_page_cache), 'EX', 3600)
  } catch (err) {
    const location = 'DELETE REDIS set home_page'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
