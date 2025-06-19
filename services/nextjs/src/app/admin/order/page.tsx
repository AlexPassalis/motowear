import { AdminOrderPageClient } from '@/app/admin/order/client/index'
import { errorPostgres } from '@/data/error'
import { ROUTE_ERROR } from '@/data/routes'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { getOrders } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'

export default async function AdminOrderPage() {
  await isSessionRSC()

  let postgres_orders
  try {
    postgres_orders = await getOrders()
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  return <AdminOrderPageClient postgres_orders={postgres_orders} />
}
