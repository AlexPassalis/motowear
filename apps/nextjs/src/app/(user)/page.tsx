import { getProductTypes } from '@/utils/getPostgres'
import { HomePageClient } from '@/app/(user)/client'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { errorPostgres } from '@/data/error'

export default async function HomePage() {
  let productTypes
  try {
    productTypes = await getProductTypes()
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <HomePageClient productTypes={productTypes} />
}
