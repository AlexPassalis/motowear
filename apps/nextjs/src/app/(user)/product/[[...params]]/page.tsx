import { ProductRow } from '@/data/types'
import { DatabaseError } from 'pg'
import { postgres } from '@/lib/postgres'
import { ProductPageClient } from '@/app/(user)/product/[[...params]]/client'
import { getProductTypes } from '@/utils/getPostgres'
import { notFound } from 'next/navigation'
import { v4 as id } from 'uuid'
import { formatMessage } from '@/utils/formatMessage'
import { errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'

type ProductPageProps = {
  params: Promise<{ params?: [type: string, version?: string] }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [resolvedParams, productTypes] = await Promise.all([
    params,
    getProductTypes(),
  ])

  if (!resolvedParams || Object.keys(resolvedParams).length === 0) {
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
        '/product/[[...params]]',
        errorPostgres,
        e
      )
      console.error(message)
      sendTelegramMessage('ERROR', message)
      throw e
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

  const searchParamsVersion = resolvedParams.params![1]
    ? uniqueVersions.find(
        v => v === decodeURIComponent(resolvedParams.params![1]!)
      )
    : undefined

  return (
    <ProductPageClient
      paramsType={paramsType}
      searchParamsVersion={searchParamsVersion}
      productTypes={productTypes}
      postgresVersions={postgresVersions}
      uniqueBrands={uniqueBrands}
      uniqueVersions={uniqueVersions}
    />
  )
}
