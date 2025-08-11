export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getCustomerDetails, getEmails } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminEmailPageClient } from '@/app/admin/email/client'
import { isSessionRSC } from '@/lib/better-auth/isSession'

export default async function AdminEmailPage() {
  await isSessionRSC()

  let postgres_emails
  try {
    postgres_emails = await getEmails()
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }

  const customerEmails = postgres_emails.filter((r) => r.customer)
  const nonCustomerEmails = postgres_emails.filter((r) => !r.customer)

  let customerDetails
  try {
    customerDetails = await Promise.all(
      customerEmails.map((r) => getCustomerDetails(r.email)),
    )
  } catch (err) {
    redirect(`${ROUTE_ERROR}?message=${err}`)
  }
  return (
    <AdminEmailPageClient
      customerDetails={customerDetails}
      nonCustomerEmails={nonCustomerEmails}
    />
  )
}
