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
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

export default async function AdminPage() {
  await isSessionRSC()

  const asyncFunctions = [getOrders, getDailySessions, getShipping, getCoupons]
  const resolved = await Promise.allSettled(
    asyncFunctions.map((asyncFunction) => asyncFunction()),
  )
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      const location = `${ERROR.postgres} ${asyncFunctions[index].name}`
      const err = result.reason
      handleError(location, err)

      redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
    }
  })

  const orders = (
    resolved[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof getOrders>>>
  ).value
  const daily_sessions = (
    resolved[1] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getDailySessions>>
    >
  ).value
  const shipping = (
    resolved[2] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getShipping>>
    >
  ).value
  const postgres_coupons = (
    resolved[3] as PromiseFulfilledResult<
      Awaited<ReturnType<typeof getCoupons>>
    >
  ).value

  return (
    <AdminPageClient
      orders={orders}
      daily_sessions={daily_sessions}
      shippingPostgres={shipping}
      postgres_coupons={postgres_coupons}
    />
  )
}
