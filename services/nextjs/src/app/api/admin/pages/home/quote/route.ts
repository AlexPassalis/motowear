import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { home_page } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { getHomePage } from '@/utils/getPostgres'
import { sql } from 'drizzle-orm'

import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  let requestBody
  try {
    requestBody = await req.json()
  } catch (err) {
    const location = 'DELETE parse request body'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 400 })
  }

  const requestBodySchema = z.object({ quote: z.string() })
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
        SET quotes = COALESCE((
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(${home_page}.quotes) AS elem
          WHERE elem->>'quote' <> ${validatedBody.quote}
        ), '[]'::jsonb)
        WHERE ${home_page}.quotes @> ${JSON.stringify([
        { quote: validatedBody.quote },
      ])}
      `,
    )
  } catch (err) {
    const location = 'DELETE POSTGRES update home_page quotes'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let home_page_cache
  try {
    home_page_cache = await getHomePage()
  } catch (err) {
    const location = `DELETE ${ERROR.postgres} getHomePage`
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('home_page', JSON.stringify(home_page_cache), 'EX', 3600)
  } catch (err) {
    const location = `DELETE ${ERROR.redis} set home_page`
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
