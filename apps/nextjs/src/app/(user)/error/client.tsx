'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { ROUTE_HOME } from '@/data/routes'
import type { Variants } from '@/data/type'
import Link from 'next/link'

type ErrorPageClientProps = {
  product_types: string[]
  all_variants: Variants
  message: string
}

export function ErrorPageClient({
  product_types,
  all_variants,
  message,
}: ErrorPageClientProps) {
  return (
    <HeaderProvider product_types={product_types} all_variants={all_variants}>
      <main className="flex-1 flex items-center justify-center h-screen text-black">
        <div className="flex flex-col items-center gap-4 border border-neutral-300 rounded-lg bg-white px-4 py-2">
          <h1 className="text-3xl">Σφάλμα - 500</h1>
          <p className="text-xl">error: {message}</p>
          <span className="text-lg">
            Μεταβιβάσου στην{' '}
            <Link
              href={ROUTE_HOME}
              className="text-blue-700 hover:underline underline-offset-4 hover:cursor-pointer"
            >
              αρχική σελίδα
            </Link>
          </span>
        </div>
      </main>
    </HeaderProvider>
  )
}
