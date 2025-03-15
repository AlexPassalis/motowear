import { ProductRow } from '@/data/types'
import { postgres } from '@/lib/postgres'
import { ProductPageClient } from '@/app/(user)/product/[type]/client'
import { getProductTypes } from '@/utils/getPostgres'

type ProductPageProps = {
  params: Promise<{
    type: string
  }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [resolvedParams, resolvedSearchParams, productTypes] =
    await Promise.all([params, searchParams, getProductTypes()])
  const type = decodeURIComponent(resolvedParams.type)
  const { rows: tableRows }: { rows: ProductRow[] } = await postgres.execute(
    `SELECT * FROM product."${type}"`
  )

  const uniqueBrands = Array.from(
    new Set(
      tableRows.map(row => row.brand).filter((b): b is string => b !== null)
    )
  )
  const uniqueVersions = Array.from(new Set(tableRows.map(row => row.version)))

  const version = resolvedSearchParams['version']
    ? decodeURIComponent(resolvedSearchParams['version'])
    : undefined
  const brand = resolvedSearchParams['brand']
    ? decodeURIComponent(resolvedSearchParams['brand'])
    : undefined
  const color = resolvedSearchParams['color']
    ? decodeURIComponent(resolvedSearchParams['color'])
    : undefined
  const size = resolvedSearchParams['size']
    ? decodeURIComponent(resolvedSearchParams['size'])
    : undefined

  return (
    <ProductPageClient
      productTypes={productTypes}
      type={type}
      uniqueBrands={uniqueBrands}
      uniqueVersions={uniqueVersions}
      defaultVersions={tableRows}
      defaultVersion={version}
    />
  )
}
