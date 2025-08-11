export const dynamic = 'force-dynamic'

import { getHomePage } from '@/utils/getPostgres'
import { AdminHomePageClient } from '@/app/admin/home/client/index'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getFileNames } from '@/lib/minio'
import { isSessionRSC } from '@/lib/better-auth/isSession'

export default async function AdminHomePage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([
    getHomePage(),
    getFileNames('home_page'),
  ])
  if (resolved[0].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[0].reason}`)
  }
  if (resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${resolved[1].reason}`)
  }

  return (
    <AdminHomePageClient
      home_page={resolved[0].value}
      imagesHomePageMinio={resolved[1].value}
    />
  )
}
