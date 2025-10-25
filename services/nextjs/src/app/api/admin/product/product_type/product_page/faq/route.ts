import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorInvalidBody, errorPostgres, errorRedis } from '@/data/error'
import { headers } from 'next/headers'
import { postgres } from '@/lib/postgres/index'
import { product_pages } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'
import { getPages } from '@/utils/getPostgres'
import { sql } from 'drizzle-orm'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        product_type: z.string(),
        question: z.string(),
      })
      .parse(await req.json())
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/product_page/faq/route.ts DELETE',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres.execute(
      sql`
          UPDATE ${product_pages}
          SET faq = COALESCE((
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements(${product_pages}.faq) AS elem
            WHERE elem->>'question' <> ${validatedBody.question}
          ), '[]'::jsonb)
          WHERE ${product_pages}.product_type = ${validatedBody.product_type}
            AND ${product_pages}.faq @> ${JSON.stringify([
        { question: validatedBody.question },
      ])}
        `,
    )
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/product_page/faq/route.ts DELETE',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  let pages_postgres
  try {
    pages_postgres = await getPages()
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 500 })
  }

  try {
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (err) {
    const message = formatMessage(
      '@/app/api/admin/product/product_type/product_page/faq/route.ts DELETE',
      errorRedis,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
