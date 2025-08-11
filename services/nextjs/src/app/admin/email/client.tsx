'use client'

import type { typeCustomerDetails, typeEmails } from '@/utils/getPostgres'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminEmailPageClientProps = {
  customerDetails: typeCustomerDetails[]
  nonCustomerEmails: typeEmails
}

export function AdminEmailPageClient({
  customerDetails,
  nonCustomerEmails,
}: AdminEmailPageClientProps) {
  return (
    <AdminProvider>
      <main className="py-20 px-8 w-full max-w-full grid grid-cols-1 gap-6">
        <section>
          <h2 className="text-lg font-semibold">
            Customers ({customerDetails.length})
          </h2>
          <ul className="mt-2 divide-y">
            {customerDetails.length === 0 && (
              <li className="py-2 italic text-gray-500">None</li>
            )}
            {customerDetails.map(({ checkout }) => (
              <li key={checkout.email} className="py-2">
                {checkout.email} {checkout.first_name} {checkout.last_name}
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
