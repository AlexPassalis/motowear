import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { eq } from 'drizzle-orm'
import {
  errorInvalidBody,
  errorMinio,
  errorPostgres,
  errorTypesense,
} from '@/data/error'
import { headers } from 'next/headers'
import { deleteTypeImages } from '@/lib/minio'
import { deleteTypesense } from '@/lib/typesense/server'
import { product_pages } from '@/lib/postgres/schema'
import { formatMessage } from '@/utils/formatMessage'
import { sendTelegramMessage } from '@/lib/telegram'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const { error: err, data: validatedBody } = z
    .object({ product_type: z.string() })
    .safeParse(await req.json())

  if (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/delete/route.ts DELETE',
      errorInvalidBody,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorInvalidBody }, { status: 400 })
  }

  try {
    await postgres
      .delete(product_pages)
      .where(eq(product_pages.product_type, validatedBody.product_type))
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/delete/route.ts DELETE product_pages',
      errorPostgres,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }

  try {
    await deleteTypesense(validatedBody.product_type)
  } catch {
    const message = formatMessage(
      '@/app/api/product/product_type/delete/route.ts DELETE typesense',
      errorTypesense,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorTypesense }, { status: 500 })
  }

  try {
    await deleteTypeImages(validatedBody.product_type)
  } catch (err) {
    const message = formatMessage(
      '@/app/api/product/product_type/delete/route.ts DELETE minio',
      errorMinio,
      err,
    )
    console.error(message)
    await sendTelegramMessage('ERROR', message)

    return NextResponse.json({ message: errorMinio }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
