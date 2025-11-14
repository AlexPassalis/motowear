import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { deleteTypeImages } from '@/lib/minio'
import { deleteTypesense } from '@/lib/typesense/server'
import { product_pages } from '@/lib/postgres/schema'
import { handleError } from '@/utils/error/handleError'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ product_type: z.string() })
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
    await postgres
      .delete(product_pages)
      .where(eq(product_pages.product_type, validatedBody.product_type))
  } catch (err) {
    const location = 'DELETE POSTGRES delete product_pages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await deleteTypesense(validatedBody.product_type)
  } catch (err) {
    const location = 'DELETE TYPESENSE deleteTypesense'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await deleteTypeImages(validatedBody.product_type)
  } catch (err) {
    const location = 'DELETE MINIO deleteTypeImages'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
