import { getProductTypes, getVariants } from '@/utils/getPostgres'
import { unstable_cache } from 'next/cache'

export const getProductTypesCached = unstable_cache(
  async () => getProductTypes(),
  ['product_types'],
  {
    tags: ['product_types'],
    revalidate: 3600,
  }
)

export const getVariantsCached = unstable_cache(
  async () => getVariants(),
  ['variants'],
  {
    tags: ['variants'],
    revalidate: 3600,
  }
)
