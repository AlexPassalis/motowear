import { ErrorPageClient } from '@/app/(user)/error/client'
import { errorPostgres, errorUnexpected } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { getProductTypes } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'

type ErrorPageProps = {
  searchParams: Promise<{ message?: string }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  let productTypes
  let message
  try {
    const resolved = await Promise.all([getProductTypes(), searchParams])
    productTypes = resolved[0]
    message = resolved[1]?.message || errorUnexpected
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <ErrorPageClient productTypes={productTypes} message={message} />
}
