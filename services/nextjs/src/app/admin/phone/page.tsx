export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getPhones } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminPhonePageClient } from '@/app/admin/phone/client'
import { isSessionRSC } from '@/lib/better-auth/isSession'

export default async function AdminEmailPage() {
  await isSessionRSC()

  let postgres_phones
  try {
    postgres_phones = await getPhones()
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  return <AdminPhonePageClient postgres_phones={postgres_phones} />
}
