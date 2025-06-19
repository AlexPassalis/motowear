export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getPhones } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminPhonePageClient } from '@/app/admin/phone/client'

export default async function AdminEmailPage() {
  let postgres_phones
  try {
    postgres_phones = await getPhones()
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  return <AdminPhonePageClient postgres_phones={postgres_phones} />
}
