// import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  // getPagesCached,
  getProductTypesCached,
  getShippingCached,
  getVariantsCached,
} from '@/app/(user)/cache'
import { ROUTE_ERROR } from '@/data/routes'
// import { errorPostgres } from '@/data/error'
// import { envServer } from '@/env'

import { CollectionPageClient } from '@/app/(user)/collection/[type]/client'

type typeParams = { type?: string }
type ProductPageProps = {
  params: Promise<typeParams>
}

// export async function generateMetadata({
//   params,
// }: ProductPageProps): Promise<Metadata> {
//   const resolvedParams = await params
//   if (!resolvedParams?.type) {
//     notFound()
//   }
//   const paramsProduct_type = resolvedParams.type

//   const resolved = await Promise.allSettled([
//     getPagesCached(),
//     getVariantsCached(),
//   ])
//   if (resolved[0].status === 'rejected') {
//     console.error(resolved[0].reason)
//     redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
//   }
//   if (resolved[1].status === 'rejected') {
//     console.error(resolved[1].reason)
//     redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
//   }

//   const description = resolved[0].value.find(
//     (page) => page.product_type === paramsProduct_type,
//   )!.product_description
//   const canonical = `/collection/${decodeURIComponent(paramsProduct_type)}`

//   const firstProductImageFileName = resolved[1].value
//     .filter((variant) => variant.product_type === paramsProduct_type)
//     .filter(
//       (variant, index, self) =>
//         self.findIndex(
//           (v) => v.name === variant.name && v.color === variant.color,
//         ) === index,
//     )
//     .map((variant) => {
//       return {
//         name: variant.name,
//         color: variant.color,
//         brand: variant.brand,
//         image: variant.images[0],
//       }
//     })
//     .sort((a, b) => a.name.localeCompare(b.name))[0].image

//   const firstProductImageUrl = `${
//     envServer.MINIO_PUBLIC_URL
//   }/${decodeURIComponent(paramsProduct_type)}/${decodeURIComponent(
//     firstProductImageFileName,
//   )}`

//   return {
//     title: paramsProduct_type,
//     description: description,
//     alternates: { canonical: canonical },
//     openGraph: {
//       url: canonical,
//       title: paramsProduct_type,
//       description: description,
//       images: [
//         {
//           url: firstProductImageUrl,
//           width: 1200,
//           height: 630,
//           alt: paramsProduct_type,
//         },
//       ],
//     },
//     robots: { index: true, follow: true },
//   }
// }

export default async function CollectionPage({ params }: ProductPageProps) {
  const resolved = await Promise.allSettled([
    params,
    getProductTypesCached(),
    getVariantsCached(),
    getShippingCached(),
  ])
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }

  const resolvedParams = (resolved[0] as PromiseFulfilledResult<typeParams>)
    .value
  if (!resolvedParams?.type) {
    notFound()
  }
  const paramsProduct_type = decodeURIComponent(resolvedParams.type)

  const postgresVariants = resolved[2].value.filter(
    (variant) => variant.product_type === paramsProduct_type,
  )

  if (
    !postgresVariants.find(
      (variant) => variant.product_type === paramsProduct_type,
    )
  ) {
    notFound()
  }

  const uniqueVariants = postgresVariants
    .filter(
      (variant, index, self) =>
        self.findIndex(
          (v) => v.name === variant.name && v.color === variant.color,
        ) === index,
    )
    .map((variant) => {
      return {
        name: variant.name,
        color: variant.color,
        brand: variant.brand,
        image: variant.images[0],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const uniqueBrands = uniqueVariants
    .map((variant) => variant.brand)
    .filter(Boolean) // remove empty strings ('')
    .filter(
      (item, index, self) =>
        index === self.findIndex((other) => other === item),
    )

  return (
    <CollectionPageClient
      paramsProduct_type={paramsProduct_type}
      product_types={resolved[1].value}
      all_variants={resolved[2].value}
      shipping={resolved[3].value}
      uniqueVariants={uniqueVariants}
      uniqueBrands={uniqueBrands}
    />
  )
}
