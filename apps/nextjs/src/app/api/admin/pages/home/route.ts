import { zodHomePage } from '@/lib/postgres/data/zod'

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

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let validatedBody
  try {
    validatedBody = z
      .object({
        home_page: zodHomePage,
      })
      .parse(await req.json())
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/pages/home/image/route.ts POST',
      errorInvalidBody,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .insert(home_page)
      .values({ ...validatedBody.home_page, primary_key: 'primary_key' })
      .onConflictDoUpdate({
        target: [home_page.primary_key],
        set: {
          big_image: validatedBody.home_page.big_image,
          smaller_images: validatedBody.home_page.smaller_images,
          quotes: validatedBody.home_page.quotes,
          faq: validatedBody.home_page.faq,
          coupon: validatedBody.home_page.coupon,
        },
      })
  } catch (e) {
    const message = formatMessage(
      '@/app/api/admin/pages/home/image/route.ts POST',
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
      '@/app/api/admin/pages/home/image/route.ts POST',
      errorRedis,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorRedis }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
