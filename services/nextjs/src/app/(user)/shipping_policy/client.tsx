'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type ShippingPolicyPageClientProps = {
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function ShippingPolicyPageClient({
  product_types,
  all_variants,
  shipping,
}: ShippingPolicyPageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Πολιτική Αποστολών
        </h1>

        <section className="mb-8">
          <p className="mb-4">
            Οι παραγγελίες αποστέλλονται με την <strong>ELTA Courier</strong> με
            την οποία συνεργαζόμαστε.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Χρόνος Παράδοσης
          </h2>
          <p className="mb-4">
            Ο χρόνος παράδοσης είναι 1 έως 3 εργάσιμες ημέρες. Εξαιρούνται τα
            εξατομικευμένα ρούχα (π.χ. με προσθήκη custom σχεδίου), τα οποία
            παραδίδονται σε 2 έως 4 εργάσιμες ημέρες.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Επικοινωνία
          </h2>
          <p className="mb-4">
            Για αναζήτηση αποστολής ή άλλες ερωτήσεις, μην διστάσετε να μας
            ενημερώσετε μέσω email{' '}
            <a
              href="mailto:contact@motowear.gr"
              className="text-red-600 hover:underline"
            >
              contact@motowear.gr
            </a>{' '}
            ή τηλεφωνικώς{' '}
            <a
              href="tel:+306939133385"
              className="text-red-600 hover:underline"
            >
              693 913 3385
            </a>
            .
          </p>
        </section>
      </main>
    </HeaderProvider>
  )
}
