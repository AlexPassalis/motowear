import { ROUTE_ERROR } from '@/data/routes'
import { getProductTypesCached, getVariantsCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'
import { ContactPageClient } from '@/app/(user)/contact/client'

export default async function ContactPage() {
  const resolved = await Promise.allSettled([
    getProductTypesCached(),
    getVariantsCached(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }

  return (
    <ContactPageClient
      product_types={resolved[0].value}
      all_variants={resolved[1].value}
    />
  )
}
