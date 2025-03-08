import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { sql } from 'drizzle-orm'
import { errorBodyInvalid, errorPostgres } from '@/data/zod/error'
import { responseSuccessful } from '@/data/zod/expected'

export async function POST(req: NextRequest) {
  const bodyType = z.object({ newProductType: z.string() })
  const body = await req.json()
  const { data: validatedBody } = bodyType.safeParse(body)
  if (!validatedBody) {
    return NextResponse.json({ message: errorBodyInvalid }, { status: 400 })
  }

  const { newProductType } = validatedBody
  try {
    await postgres.execute(sql`
      CREATE TABLE IF NOT EXISTS product."${sql.raw(newProductType)}" (
        "id" UUID PRIMARY KEY,
        "version" TEXT NOT NULL
      );
    `)
    return NextResponse.json({ message: responseSuccessful }, { status: 200 })
  } catch (e) {
    console.error(errorPostgres, e)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const bodyType = z.object({ deleteProductType: z.string() })
  const body = await req.json()
  const { data: validatedBody } = bodyType.safeParse(body)
  if (!validatedBody) {
    return NextResponse.json({ message: errorBodyInvalid }, { status: 400 })
  }

  const { deleteProductType } = validatedBody
  try {
    await postgres.execute(sql`
      DROP TABLE IF EXISTS product."${sql.raw(deleteProductType)}"
    `)
    return NextResponse.json({ message: responseSuccessful }, { status: 200 })
  } catch (e) {
    console.error(errorPostgres, e)
    return NextResponse.json({ message: errorPostgres }, { status: 500 })
  }
}
