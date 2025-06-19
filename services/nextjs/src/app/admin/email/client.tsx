'use client'

import { typeEmails } from '@/utils/getPostgres'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminEmailPageClientProps = {
  postgres_emails: typeEmails
}

export function AdminEmailPageClient({
  postgres_emails,
}: AdminEmailPageClientProps) {
  return (
    <AdminProvider>
      <div className="py-20 px-8 w-full max-w-full">
        {postgres_emails.join(', ')}
      </div>
    </AdminProvider>
  )
}
