import { errorInvalidBody, errorMinio, errorPostgres } from '@/data/error'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import { deleteFile } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { brand } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendTelegramMessage } from '@/lib/telegram'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const body = await req.json()
  const { data: validatedBody } = z
    .object({ brand: z.string() })
    .safeParse(body)
  if (!validatedBody) {
    const message = formatMessage(
      '/api/admin/product/brand/delete DELETE',
      errorInvalidBody,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .delete(brand)
      .where(eq(brand.image, validatedBody.brand))
      .execute()
  } catch (err) {
    const message = formatMessage(
      '/api/admin/product/brand/delete DELETE',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await deleteFile('brand', validatedBody.brand)
    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    const message = formatMessage(
      '/api/admin/product/brand/delete DELETE',
      errorMinio,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorMinio }, { status: 500 })
  }
}
