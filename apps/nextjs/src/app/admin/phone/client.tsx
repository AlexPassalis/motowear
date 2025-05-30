'use client'

import { typePhones } from '@/utils/getPostgres'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminPhonePageClientProps = {
  postgres_phones: typePhones
}

export function AdminPhonePageClient({
  postgres_phones,
}: AdminPhonePageClientProps) {
  return (
    <AdminProvider>
      <div className="py-20 px-8 w-full max-w-full">
        {postgres_phones.join(', ')}
      </div>
    </AdminProvider>
  )
}
