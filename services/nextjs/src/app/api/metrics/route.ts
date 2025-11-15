import { ERROR } from '@/data/magic'
import { prometheus } from '@/lib/prometheus/index'
import { handleError } from '@/utils/error/handleError'
import { NextResponse } from 'next/server'

export async function GET() {
  let metrics
  try {
    metrics = await prometheus.metrics()
  } catch (err) {
    const location = `GET ${ERROR.prometheus} metrics`
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': prometheus.contentType,
    },
  })
}
