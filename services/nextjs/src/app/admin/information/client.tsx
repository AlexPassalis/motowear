'use client'

import type { typeOrder } from '@/lib/postgres/data/type'
import type { typeEmails } from '@/utils/getPostgres'

import { AdminProvider } from '@/app/admin/components/AdminProvider'

type typeCustomerDetails = {
  first_name: typeOrder['checkout']['first_name']
  last_name: typeOrder['checkout']['last_name']
  email: typeOrder['checkout']['email']
  phone?: typeOrder['checkout']['phone']
}[]

type AdminInformationPageClientProps = {
  customerDetails: typeCustomerDetails
  nonCustomerEmails: typeEmails
}

export function AdminInformationPageClient({
  customerDetails,
  nonCustomerEmails,
}: AdminInformationPageClientProps) {
  return (
    <AdminProvider>
      <main className="py-20 px-8 w-full max-w-full grid grid-cols-1 gap-96">
        <section>
          <h2 className="text-lg font-semibold">
            Customers ({customerDetails.length})
          </h2>
          <ul className="mt-2 divide-y">
            {customerDetails.length === 0 && (
              <li className="py-2 italic text-gray-500">None</li>
            )}
            {customerDetails.map(({ first_name, last_name, email, phone }) => (
              <li key={email} className="py-2">
                {first_name},{last_name},{email}
                {phone && `,${phone}`}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            Non-customers ({nonCustomerEmails.length})
          </h2>
          <ul className="mt-2 divide-y">
            {nonCustomerEmails.length === 0 && (
              <li className="py-2 italic text-gray-500">None</li>
            )}
            {nonCustomerEmails.map((r) => (
              <li key={r.email} className="py-2">
                {r.email}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AdminProvider>
  )
}
