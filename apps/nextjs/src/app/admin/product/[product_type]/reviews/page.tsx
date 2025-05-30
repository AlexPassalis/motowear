import { errorPostgres } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { redirect } from 'next/navigation'
import { AdminProductProductTypeReviewsClientPage } from '@/app/admin/product/[product_type]/reviews/client/index'
import { getProductReviews } from '@/utils/getPostgres'

type AdminProductProductTypeReviewsPageProps = {
  params: Promise<{ product_type: string }>
}

export default async function AdminProductProductTypeReviewsPage({
  params,
}: AdminProductProductTypeReviewsPageProps) {
  await isSessionRSC()

  const resolvedParams = await params
  const productType = decodeURIComponent(resolvedParams.product_type)

  let product_reviews
  try {
    product_reviews = await getProductReviews(productType)
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return (
    <AdminProductProductTypeReviewsClientPage
      product_type={productType}
      product_reviews={product_reviews}
    />
  )
}
