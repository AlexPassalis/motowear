import { CheckoutPageClient } from '@/app/(user)/checkout/client'
import { errorPostgres } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { getAllVariantsCached } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  let all_variants
  try {
    all_variants = await getAllVariantsCached()
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <CheckoutPageClient all_variants={all_variants} />
}
