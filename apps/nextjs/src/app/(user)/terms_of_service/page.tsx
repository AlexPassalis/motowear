export const dynamic = 'force-dynamic'

import { TermsOfServicePageClient } from '@/app/(user)/terms_of_service/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms_of_service' },
  openGraph: {
    title: 'Terms of Service | motowear.gr',
    url: '/terms_of_service',
  },
  other: {
    'page-type': 'terms_of_service',
  },
}

export default async function TermsOfServicePage() {
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
    <TermsOfServicePageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
      shipping={resolved[2].value}
    />
  )
}
