import { envServer } from '@/envServer'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleError } from '@/utils/error/handleError'

export async function GET(
  req: NextRequest,
  route: { params: Promise<{ image: string }> },
) {
  await isSessionAPI(await headers())
  const resolvedParams = await route.params

  const requestBodySchema = z.object({ image: z.string() })
  const requestBody = resolvedParams

  const { error, data: validatedParams } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'GET ZOD request params'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 400 })
  }

  try {
    const res = await axios.get(
      `${envServer.MINIO_PRODUCT_URL}/home_page/${validatedParams.image}`,
      { responseType: 'arraybuffer' },
    )
    if (res.status === 200) {
      return new NextResponse(res.data, {
        status: 200,
        headers: {
          'Content-Type': res.headers['content-type'],
        },
      })
    } else {
      const location = 'GET MINIO fetch image'
      await handleError(location, `status ${res.status}`)

      return NextResponse.json({ err: location }, { status: 400 })
    }
  } catch (err) {
    const location = 'GET AXIOS get home_page image'
    await handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }
}
