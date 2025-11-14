import { isSessionAPI } from '@/lib/better-auth/isSession'
import { deleteFile } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { brand } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleError } from '@/utils/error/handleError'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({ brand: z.string() })
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
      .delete(brand)
      .where(eq(brand.image, validatedBody.brand))
      .execute()
  } catch (err) {
    const location = 'DELETE POSTGRES delete brand'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await deleteFile('brand', validatedBody.brand)
    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    const location = 'DELETE MINIO deleteFile brand'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }
}
