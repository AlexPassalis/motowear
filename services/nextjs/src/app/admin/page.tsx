import { isSessionRSC } from '@/lib/better-auth/isSession'
import { AdminPageClient } from '@/app/admin/client'
import {
  getDailySessions,
  getShipping,
  getOrders,
  getCoupons,
} from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'

export default async function AdminPage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([
    getOrders(),
    getDailySessions(),
    getShipping(),
    getCoupons(),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }
  if (resolved[2].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[2].reason}`)
  }
  if (resolved[3].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[3].reason}`)
  }

  return (
    <AdminPageClient
      orders={resolved[0].value}
      daily_sessions={resolved[1].value}
      shippingPostgres={resolved[2].value}
      postgres_coupons={resolved[3].value}
    />
  )
}
