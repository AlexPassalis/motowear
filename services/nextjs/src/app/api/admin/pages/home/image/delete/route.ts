import { errorInvalidBody, errorMinio } from '@/data/error'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { deleteFile } from '@/lib/minio'
import { formatMessage } from '@/utils/formatMessage'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendTelegramMessage } from '@/lib/telegram'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const body = await req.json()
  const { data: validatedBody } = z
    .object({ image: z.string() })
    .safeParse(body)
  if (!validatedBody) {
    const message = formatMessage(
      '/api/admin/pages/home/image/delete/route.ts DELETE',
      errorInvalidBody
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await deleteFile('home_page', validatedBody.image)
  } catch (e) {
    const message = formatMessage(
      '/api/admin/pages/home/image/delete/route.ts DELETE',
      errorMinio,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    return NextResponse.json({ message: errorMinio }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
