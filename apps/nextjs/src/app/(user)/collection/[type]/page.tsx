import { ProductRow } from '@/data/types'
import { DatabaseError } from 'pg'
import { postgres } from '@/lib/postgres'
import { notFound, redirect } from 'next/navigation'
import { v4 as id } from 'uuid'
import { formatMessage } from '@/utils/formatMessage'
import { errorPostgres } from '@/data/error'
import { sendTelegramMessage } from '@/lib/telegram'
import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'
import { getProductTypes } from '@/utils/getPostgres'
import { ROUTE_ERROR } from '@/data/routes'

type ProductPageProps = {
  params: Promise<{ type: string }>
}

export default async function CollectionPage({ params }: ProductPageProps) {
  const [resolvedParams, productTypes] = await Promise.all([
    params,
    getProductTypes(),
  ])
  const paramsType = decodeURIComponent(resolvedParams.type)

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
        '@/app/(user)/collection/[type]/page.tsx',
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

  return (
    <CollectionPageClient
      productTypes={productTypes}
      paramsType={paramsType}
      postgresVersions={postgresVersions}
      uniqueBrands={uniqueBrands}
      uniqueVersions={uniqueVersions}
    />
  )
}
