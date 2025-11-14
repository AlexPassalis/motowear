import { prometheus } from '@/lib/prometheus/index'
import { NextResponse } from 'next/server'

export async function GET() {
  const metrics = await prometheus.metrics()

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': prometheus.contentType,
    },
  })
}
