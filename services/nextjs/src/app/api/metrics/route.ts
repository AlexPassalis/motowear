import { NextResponse } from 'next/server'

export async function GET() {
  const metrics = await register.metrics()

  return new NextResponse(metrics, {
    status: 200,
  })
}
