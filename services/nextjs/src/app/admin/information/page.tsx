export const dynamic = 'force-dynamic'

import { ROUTE_ERROR } from '@/data/routes'
import { getCustomerDetails, getEmails, getPhones } from '@/utils/getPostgres'
import { redirect } from 'next/navigation'
import { AdminInformationPageClient } from '@/app/admin/information/client'
import { isSessionRSC } from '@/lib/better-auth/isSession'
import { handleError } from '@/utils/error/handleError'
import { ERROR } from '@/data/magic'

export default async function AdminInformationPage() {
  await isSessionRSC()

  const asyncFunctions = [getEmails, getPhones]
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

  const emails = (
    resolved[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof getEmails>>>
  ).value
  const customer_phones = (
    resolved[1] as PromiseFulfilledResult<Awaited<ReturnType<typeof getPhones>>>
  ).value
  const customerEmails = emails.filter((obj) => obj.customer)
  const nonCustomerEmails = emails.filter((obj) => !obj.customer)

  let customerDetails
  try {
    customerDetails = await Promise.all(
      customerEmails.map(({ email }) => getCustomerDetails(email)),
    )
    customerDetails = customerDetails.filter((details) => details !== undefined) // filter out all falsy (undefined, because the order was deleted) values
  } catch (err) {
    const location = `${ERROR.postgres} getCustomerDetails`
    handleError(location, err)

    redirect(`${ROUTE_ERROR}?message=${ERROR.postgres}`)
  }

  const customerPhones = customer_phones
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
