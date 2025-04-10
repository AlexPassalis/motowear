export const dynamic = 'force-dynamic'

import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { errorPostgres } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { getVariantsCached } from '@/app/(user)/cache'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  let all_variants
  try {
    all_variants = await getVariantsCached()
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <CheckoutPageClient all_variants={all_variants} />
}
