export const dynamic = 'force-dynamic'

import { ReturnPolicyPageClient } from '@/app/(user)/return_policy/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Πολιτική Επιστροφών & Αλλαγών',
  alternates: { canonical: '/return_policy' },
  openGraph: {
    title: 'Πολιτική Επιστροφών & Αλλαγών | motowear.gr',
    url: '/return_policy',
  },
  other: {
    'page-type': 'return_policy',
  },
}

export default async function ReturnPolicyPage() {
  const resolved = await Promise.allSettled([
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

  return (
    <ReturnPolicyPageClient
      product_types={resolved[0].value}
      shipping={resolved[2].value}
    />
  )
}
