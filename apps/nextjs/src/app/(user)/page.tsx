export const dynamic = 'force-dynamic'

import { getProductTypes } from '@/utils/getPostgres'
import { HomePageClient } from '@/app/client'

export default async function HomePage() {
  const productTypes = await getProductTypes()

  return <HomePageClient productTypes={productTypes} />
}
