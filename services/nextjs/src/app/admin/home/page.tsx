export const dynamic = 'force-dynamic'

import { getHomePage } from '@/utils/getPostgres'
import { AdminHomePageClient } from '@/app/admin/home/client/index'
import { redirect } from 'next/navigation'
import { ROUTE_ERROR } from '@/data/routes'
import { getFileNames } from '@/lib/minio'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export default async function AdminHomePage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([
    getHomePage(),
    getFileNames('home_page'),
  ])
  resolved.forEach((result, index) => {
    if (result.status === 'rejected') {
      const err = result.reason
      if (index === 0) {
        const location = `${ERROR.postgres} getHomePage`
        handleError(location, err)
        redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
      } else {
        const location = `${ERROR.minio} getFileNames`
        handleError(location, err)
        redirect(`${ROUTE_ERROR}?message=${ERROR.minio}`)
      }
    }
  })

  const home_page = (
    resolved[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof getHomePage>>>
  ).value
  const images_home_page_minio = (
    resolved[1] as PromiseFulfilledResult<Awaited<ReturnType<typeof getFileNames>>>
  ).value

  return (
    <AdminHomePageClient
      home_page={home_page}
      imagesHomePageMinio={images_home_page_minio}
    />
  )
}
