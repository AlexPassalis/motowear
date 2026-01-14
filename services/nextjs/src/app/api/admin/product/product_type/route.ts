import { isSessionAPI } from '@/lib/better-auth/isSession'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { postgres } from '@/lib/postgres/index'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { deleteTypeImages } from '@/lib/minio'
import { updateTypesense } from '@/lib/typesense/server'
import { product_pages, collection } from '@/lib/postgres/schema'
import { redis } from '@/lib/redis/index'
import { handleError } from '@/utils/error/handleError'
import {
  getHomePageVariants,
  getPages,
  getProductTypes,
} from '@/utils/getPostgres'

export { OPTIONS } from '@/utils/OPTIONS'

export async function POST(req: NextRequest) {
  await isSessionAPI(await headers())

  let requestBody
  try {
    requestBody = await req.json()
  } catch (err) {
    const location = 'POST parse request body'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 400 })
  }

  const requestBodySchema = z.object({ product_type: z.string() })
  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'POST ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  try {
    await postgres.insert(product_pages).values({
      product_type: validatedBody.product_type,
      size_chart: '',
      product_description: '',
      faq: [],
      carousel: [],
      upsell: '',
    })
  } catch (err) {
    const location = 'POST POSTGRES insert product_pages'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await postgres.insert(collection).values({
      name: validatedBody.product_type,
    })
  } catch (err) {
    const location = 'POST POSTGRES insert collection'
    handleError(location, err)

    try {
      await postgres
        .delete(product_pages)
        .where(sql`product_type = ${validatedBody.product_type}`)
    } catch (cleanup_err) {
      const cleanup_location = 'POST POSTGRES cleanup product_pages after collection failure'
      handleError(cleanup_location, cleanup_err)
    }

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let product_types_postgres
  let pages_postgres
  try {
    product_types_postgres = await getProductTypes()
    pages_postgres = await getPages()
  } catch (err) {
    const location = 'POST GET postgresql caches'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set(
      'product_types',
      JSON.stringify(product_types_postgres),
      'EX',
      3600,
    )
    await redis.set('pages', JSON.stringify(pages_postgres), 'EX', 3600)
  } catch (err) {
    const location = 'POST REDIS set product_types/pages'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await updateTypesense(validatedBody.product_type)
  } catch (err) {
    const location = 'POST TYPESENSE updateTypesense'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}

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

  const requestBodySchema = z.object({ productType: z.string() })
  const { error, data: validatedBody } =
    requestBodySchema.safeParse(requestBody)
  if (error) {
    const err = JSON.stringify(error.issues)
    const location = 'DELETE ZOD request body'
    handleError(location, err)

    return NextResponse.json({ err }, { status: 400 })
  }

  const { productType } = validatedBody
  try {
    await postgres.execute(sql`
      DROP TABLE IF EXISTS product."${sql.raw(productType)}"
    `)
  } catch (err) {
    const location = 'DELETE POSTGRES drop table'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await deleteTypeImages(`${productType}`)
  } catch (err) {
    const location = 'DELETE MINIO deleteTypeImages'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await updateTypesense(productType)
  } catch (err) {
    const location = 'DELETE TYPESENSE updateTypesense'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  let product_types
  let pages
  let home_page_variants
  try {
    product_types = await getProductTypes()
    pages = await getPages()
    home_page_variants = await getHomePageVariants()
  } catch (err) {
    const location = 'DELETE GET postgresql caches'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  try {
    await redis.set('product_types', JSON.stringify(product_types), 'EX', 3600)
    await redis.set('pages', JSON.stringify(pages), 'EX', 3600)
    await redis.set(
      'home_page_variants',
      JSON.stringify(home_page_variants),
      'EX',
      3600,
    )
  } catch (err) {
    const location = 'DELETE REDIS set caches'
    handleError(location, err)

    return NextResponse.json({ err: location }, { status: 500 })
  }

  return NextResponse.json({}, { status: 200 })
}
