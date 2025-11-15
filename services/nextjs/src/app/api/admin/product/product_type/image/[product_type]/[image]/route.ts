import { handleError } from '@/utils/error/handleError'
import { envServer } from '@/envServer'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  route: { params: Promise<{ product_type: string; image: string }> },
) {
  await isSessionAPI(await headers())
  const resolvedParams = await route.params

  const requestBodySchema = z.object({
    product_type: z.string(),
    image: z.string(),
  })
  const requestBody = resolvedParams

  const { error, data: validatedParams } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'GET ZOD request params'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    const res = await axios.get(
      `${envServer.MINIO_PRODUCT_URL}/${validatedParams.product_type}/${validatedParams.image}`,
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
      const err = `status ${res.status}`
      const location = 'GET MINIO fetch image'
      handleError(location, err)

      return NextResponse.json({ err: location }, { status: 400 })
    }
  } catch (err) {
    const location = 'GET AXIOS get product image'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }
}
