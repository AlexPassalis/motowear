export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getCustomerDetails, getEmails, getPhones } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminInformationPageClient } from '@/app/admin/information/client'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { errorPostgres } from '@/data/error'

export default async function AdminInformationPage() {
  await isSessionRSC()

  const resolved = await Promise.allSettled([getEmails(), getPhones()])
  if (resolved[0].status === 'rejected' || resolved[1].status === 'rejected') {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  const emails = resolved[0].value
  const customerEmails = emails.filter((obj) => obj.customer)
  const nonCustomerEmails = emails.filter((obj) => !obj.customer)

  let customerDetails
  try {
    customerDetails = await Promise.all(
      customerEmails.map(({ email }) => getCustomerDetails(email)),
    )
    customerDetails = customerDetails.filter((details) => details) // filter out all falsy (undefined, because the order was deleted) values
  } catch {
    redirect(`${ROUTE_ERROR}?message=${errorPostgres}`)
  }

  const customerPhones = resolved[1].value
  customerDetails = customerDetails.map((obj) => {
    return {
      first_name: obj.checkout.first_name,
      last_name: obj.checkout.last_name,
      email: obj.checkout.email,
      ...(customerPhones.includes(obj.checkout.phone)
        ? { phone: obj.checkout.phone }
        : {}),
    }
  })

  return (
    <AdminInformationPageClient
      customerDetails={customerDetails}
      nonCustomerEmails={nonCustomerEmails}
    />
  )
}
