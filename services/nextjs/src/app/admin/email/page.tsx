export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getEmails } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminEmailPageClient } from '@/app/admin/email/client'

export default async function AdminEmailPage() {
  let postgres_emails
  try {
    postgres_emails = await getEmails()
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  return <AdminEmailPageClient postgres_emails={postgres_emails} />
}
