import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorInvalidBody, errorPostgres, errorRedis } from '@/data/error'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { home_page } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { getHomePage } from '@/utils/getPostgres'
import { sql } from 'drizzle-orm'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        question: z.string(),
      })
      .parse(await req.json())
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/pages/home/faq/route.ts DELETE',
      errorInvalidBody,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
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
      `
    )
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/pages/home/faq/route.ts DELETE',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  let home_page_cache
  try {
    home_page_cache = await getHomePage()
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 })
  }

  try {
    await redis.set('home_page', JSON.stringify(home_page_cache), 'EX', 3600)
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/pages/home/faq/route.ts DELETE',
      errorRedis,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
