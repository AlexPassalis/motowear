import { ROUTE_NOT_FOUND } from '@/data/routes'
import { ProductRow } from '@/data/types'
import { postgres } from '@/lib/postgres'
import { redirect } from 'next/navigation'
import { ProductPageClient } from '@/app/product/[type]/client'

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
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const type = decodeURIComponent(resolvedParams.type)

  const { rows: tableRows }: { rows: ProductRow[] } = await postgres.execute(
    `SELECT * FROM product."${type}"`
  )
  const version = resolvedSearchParams['version']
    ? decodeURIComponent(resolvedSearchParams['version'])
    : undefined

  const uniqueBrands = Array.from(
    new Set(
      tableRows.map(row => row.brand).filter((b): b is string => b !== null)
    )
  )

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
      type={type}
      productVersions={tableRows}
      defaultVersion={version}
      brands={uniqueBrands}
      defaultBrand={brand}
      defaultColor={color}
      defaultSize={size}
    />
  )
}
