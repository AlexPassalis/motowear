import { isSessionAPI } from '@/lib/better-auth/isSession'
import { deleteFile } from '@/lib/minio'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleError } from '@/utils/error/handleError'

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

  const requestBodySchema = z.object({ image: z.string() })
  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await deleteFile('home_page', validatedBody.image)
  } catch (err) {
    const location = 'DELETE MINIO deleteFile'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
