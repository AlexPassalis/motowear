import { errorPostgres } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { getProductTypes } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { ContactPageClient } from '@/app/(user)/contact/client'

export default async function ContactPage() {
  let productTypes
  try {
    productTypes = await getProductTypes()
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <ContactPageClient productTypes={productTypes} />
}
