import { NextResponse } from 'next/server'
import { envServer } from '@/env'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No content
    headers: {
      'Access-Control-Allow-Origin': `https://${envServer.HOST}`,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '600',
    },
  })
}
