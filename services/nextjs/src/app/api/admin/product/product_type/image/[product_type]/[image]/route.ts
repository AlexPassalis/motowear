import { errorAxios, errorInvalidParams, errorMinio } from '@/data/error'
import { envServer } from '@/env'
import { isSessionAPI } from '@/lib/better-auth/isSession'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(
  req: NextRequest,
  route: { params: Promise<{ product_type: string; image: string }> }
) {
  await isSessionAPI(await headers())
  const resolvedParams = await route.params

  const { data: validatedParams } = z
    .object({ product_type: z.string(), image: z.string() })
    .safeParse(resolvedParams)
  if (!validatedParams) {
    return NextResponse.json({ message: errorInvalidParams }, { status: 400 })
  }

  try {
    const res = await axios.get(
      `${envServer.MINIO_PRODUCT_URL}/${validatedParams.product_type}/${validatedParams.image}`,
      { responseType: 'arraybuffer' }
    )
    if (res.status === 200) {
      return new NextResponse(res.data, {
        status: 200,
        headers: {
          'Content-Type': res.headers['content-type'],
        },
      })
    } else {
      return NextResponse.json({ message: errorMinio }, { status: 400 })
    }
  } catch (e) {
    console.error(errorMinio, e)
    return NextResponse.json({ message: errorAxios }, { status: 500 })
  }
}
