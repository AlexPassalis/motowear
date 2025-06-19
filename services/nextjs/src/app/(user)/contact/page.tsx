export const dynamic = 'force-dynamic'

import { ContactPageClient } from '@/app/(user)/contact/client'
import {
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '../cache'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Επικοινωνία',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Επικοινωνία | motowear.gr',
    url: '/contact',
  },
  other: {
    'page-type': 'contact',
  },
}

export default async function ContactPage() {
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
    <ContactPageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
      shipping={resolved[2].value}
    />
  )
}
