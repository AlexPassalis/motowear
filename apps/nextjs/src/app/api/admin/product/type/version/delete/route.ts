import { errorBodyInvalid, errorPostgres } from '@/data/zod/error'
import { postgres } from '@/lib/postgres'
import { sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function DELETE(req: NextRequest) {
  const bodyType = z.object({
    productType: z.string(),
    id: z.string(),
  })
  const body = await req.json()
  const { data: validatedBody } = bodyType.safeParse(body)
  if (!validatedBody) {
    return NextResponse.json({ message: errorBodyInvalid }, { status: 400 })
  }

  const { productType, id } = validatedBody
  try {
    await postgres.execute(sql`
      DELETE FROM product."${sql.raw(productType)}"
      WHERE id = ${id}
    `)
    return NextResponse.json({}, { status: 200 })
  } catch (e) {
    console.error(errorPostgres, e)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }
}
