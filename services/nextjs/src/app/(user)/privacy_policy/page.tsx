export const dynamic = 'force-dynamic'

import { PrivacyPolicyPageClient } from '@/app/(user)/privacy_policy/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου',
  alternates: { canonical: '/privacy_policy' },
  openGraph: {
    title: 'Πολιτική Απορρήτου | motowear.gr',
    url: '/privacy_policy',
  },
  other: {
    'page-type': 'privacy_policy',
  },
}

export default async function PrivacyPolicyPage() {
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
    <PrivacyPolicyPageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
      shipping={resolved[2].value}
    />
  )
}
