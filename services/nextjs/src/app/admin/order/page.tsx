import { AdminOrderPageClient } from '@/app/admin/order/client/index'
import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { get_custom_order_images } from '@/lib/minio'
import { getOrders, getUniqueVariantNames } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'

export default async function AdminOrderPage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([
    getOrders(),
    getUniqueVariantNames(),
    get_custom_order_images(),
  ])
  if (resolved[0].status === 'rejected') {
    console.error(resolved[0].reason)
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  if (resolved[1].status === 'rejected') {
    console.error(resolved[1].reason)
    redirect(`${ROUTE_ERROR}?message=POSTGRES`)
  }
  if (resolved[2].status === 'rejected') {
    console.error(resolved[2].reason)
    redirect(`${ROUTE_ERROR}?message=MINIO`)
  }

  return (
    <AdminOrderPageClient
      postgres_orders={resolved[0].value}
      postgres_unique_variant_names={resolved[1].value}
      custom_order_images={resolved[2].value}
    />
  )
}
