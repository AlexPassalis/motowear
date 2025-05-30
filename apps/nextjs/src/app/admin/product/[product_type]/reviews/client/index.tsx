'use client'

import { typeReview } from '@/lib/postgres/data/type'
import { useState } from 'react'
import { ProductReviewsTable } from '@/app/admin/product/[product_type]/reviews/client/ProductReviewsTable'

type AdminProductProductTypeReviewsClientPageProps = {
  product_type: string
  product_reviews: typeReview[]
}

export function AdminProductProductTypeReviewsClientPage({
  product_type,
  product_reviews,
}: AdminProductProductTypeReviewsClientPageProps) {
  const [onRequest, setOnRequest] = useState(false)

  return (
    <ProductReviewsTable
      product_type={product_type}
      product_reviews={product_reviews}
      onRequest={onRequest}
      setOnRequest={setOnRequest}
    />
  )
}
