export const dynamic = 'force-dynamic'

import { UnsubscribePageClient } from '@/app/(user)/unsubscribe/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { notFound, redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { unsubscribe } from '@/utils/getPostgres'

type ReviewPageProps = {
  searchParams: Promise<{ email?: string }>
}

export default async function UnsubscribePage({
  searchParams,
}: ReviewPageProps) {
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

  if (!resolved[0].value?.email) {
    return notFound()
  }

  let deletedCount
  try {
    deletedCount = await unsubscribe(resolved[0].value.email)
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  if (deletedCount.rowCount !== 1) {
    return notFound()
  }

  return (
    <UnsubscribePageClient
      email={resolved[0].value.email}
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      shipping={resolved[3].value}
    />
  )
}
