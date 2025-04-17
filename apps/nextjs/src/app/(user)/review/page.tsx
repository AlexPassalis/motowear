export const dynamic = 'force-dynamic'

import { ReviewPageClient } from '@/app/(user)/review/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getOrder } from '@/utils/getPostgres'

type ReviewPageProps = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolved = await Promise.allSettled([
    searchParams,
    getProductTypesCached(),
    getVariantsCached(),
    getShippingCached(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }

  if (!resolved[0].value?.order_id) {
    return notFound()
  }

  let array
  try {
    array = await getOrder(resolved[0].value.order_id)
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  if (array.length !== 1) {
    return notFound()
  }

  return (
    <ReviewPageClient
      order={array[0]}
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      shipping={resolved[3].value}
    />
  )
}
