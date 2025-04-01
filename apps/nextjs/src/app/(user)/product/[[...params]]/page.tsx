import { ProductRow } from '@/data/types'
import { DatabaseError } from 'pg'
import { postgres } from '@/lib/postgres'
import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import { getProductTypes } from '@/utils/getPostgres'
import { notFound, redirect } from 'next/navigation'
import { v4 as id } from 'uuid'
import { formatMessage } from '@/utils/formatMessage'
import { errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { ROUTE_ERROR } from '@/data/routes'

type ProductPageProps = {
  params: Promise<{ params?: [type: string, version?: string] }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  let resolvedParams
  let productTypes
  try {
    const resolved = await Promise.all([params, getProductTypes()])
    resolvedParams = resolved[0]
    productTypes = resolved[1]
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  if (!resolvedParams || Object.keys(resolvedParams).length < 1) {
    return notFound()
  }

  const paramsType = decodeURIComponent(resolvedParams.params![0])

  let postgresVersions: ProductRow[]
  try {
    const { rows }: { rows: ProductRow[] } = await postgres.execute(
      `SELECT * FROM product."${paramsType}"`
    )
    postgresVersions = rows
  } catch (e) {
    if (e instanceof DatabaseError && e.code === '42P01') {
      return notFound()
    } else {
      const message = formatMessage(
        id(),
        '@/app/(user)/product/[[...params]]/page.tsx',
        errorPostgres,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
    }
  }

  const uniqueBrands = Array.from(
    new Set(
      postgresVersions
        .map(row => row.brand)
        .filter((b): b is string => b !== null)
    )
  )
  const uniqueVersions = Array.from(
    new Set(postgresVersions.map(row => row.version))
  )

  const paramsVersion = resolvedParams.params![1]
    ? uniqueVersions.find(
        v => v === decodeURIComponent(resolvedParams.params![1]!)
      )
    : undefined

  return (
    <ProductPageClient
      productTypes={productTypes}
      paramsType={paramsType}
      paramsVersion={paramsVersion}
      postgresVersions={postgresVersions}
      uniqueBrands={uniqueBrands}
      uniqueVersions={uniqueVersions}
    />
  )
}
