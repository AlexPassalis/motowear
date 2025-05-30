'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type ContactPageClientProps = {
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function ContactPageClient({
  product_types,
  all_variants,
  shipping,
}: ContactPageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Επικοινωνία
        </h1>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Τηλέφωνο Υποστήριξης Πελατών
          </h2>
          <p className="mb-2">
            <a
              href="tel:+306939133385"
              className="text-red-600 hover:underline"
            >
              693 913 3385
            </a>
          </p>
          <p className="text-gray-600">Ώρες λειτουργίας: 10:00 – 19:00.</p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Email Υποστήριξης Πελατών
          </h2>
          <p className="mb-2">
            <a
              href="mailto:motoweargr@gmail.com"
              className="text-red-600 hover:underline"
            >
              motoweargr@gmail.com
            </a>
          </p>
          <p className="text-gray-600">
            Κάντε μας email για οποιοδήποτε θέμα και θα σας απαντήσουμε εντός 24
            ωρών.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Instagram
          </h2>
          <p className="mb-2">
            <a
              href="https://instagram.com/motowear.gr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              @motowear.gr
            </a>
          </p>
          <p className="text-gray-600">
            Απαντάμε σε όλα τα μηνύματα στο Instagram.
          </p>
        </section>
      </main>
    </HeaderProvider>
  )
}
