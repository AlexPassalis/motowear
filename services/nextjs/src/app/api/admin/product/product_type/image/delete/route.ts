import { isSessionAPI } from '@/lib/better-auth/isSession'
import { deleteFile } from '@/lib/minio'
import { handleError } from '@/utils/error/handleError'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function DELETE(req: NextRequest) {
  await isSessionAPI(await headers())

  const requestBodySchema = z.object({
    product_type: z.string(),
    image: z.string(),
  })
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
    await deleteFile(validatedBody.product_type, validatedBody.image)
    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    const location = 'DELETE MINIO deleteFile'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }
}
