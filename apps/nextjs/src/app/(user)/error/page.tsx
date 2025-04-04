import { ErrorPageClient } from '@/app/(user)/error/client'
import { errorPostgres, errorUnexpected } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { getVariantsCached, getProductTypesCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'

type ErrorPageProps = {
  searchParams: Promise<{ message?: string }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const resolved = await Promise.allSettled([
    searchParams,
    getProductTypesCached(),
    getVariantsCached(),
  ])
  if (resolved[1].status === 'rejected' || resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  const resolvedSearchParams = (
    resolved[0] as PromiseFulfilledResult<{ message?: string }>
  ).value
  const message = resolvedSearchParams?.message || errorUnexpected

  return (
    <ErrorPageClient
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      message={message}
    />
  )
}
