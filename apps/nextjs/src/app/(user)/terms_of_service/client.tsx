'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type TermsOfServicePageClientProps = {
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function TermsOfServicePageClient({
  product_types,
  all_variants,
  shipping,
}: TermsOfServicePageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Terms of Use
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Effective Date: January 18, 2025
        </h2>

        <section className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Welcome to MOTOWEAR GR
          </h3>
          <p>
            Welcome to our online store! By using our website, you agree to be
            bound by the following Terms of Service (&ldquo;Terms&rdquo;).
            Please read them carefully before placing an order or using any of
            our services. If you do not agree to these Terms, you should not
            access or use this website.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="general-info" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            1. General Information
          </h3>
          <p>
            1.1 This website is operated by Filippos Chatzikantis. Throughout
            the site, the terms &ldquo;we,&rdquo; &ldquo;us,&rdquo; and
            &ldquo;our&rdquo; refer to Motowear. By accessing or purchasing from
            this website, you engage in our &ldquo;Service&rdquo; and agree to
            be bound by these Terms, including additional policies referenced
            herein.
          </p>
          <p>
            1.2 These Terms apply to all users of the site, including but not
            limited to browsers, customers, merchants, and content contributors.
            By using the website, you confirm that you are at least 18 years old
            or are accessing the website under the supervision of a parent or
            guardian.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="product-info" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            2. Product Information and Usage
          </h3>
          <p>
            2.1 The products sold on this website primarily include T-shirts,
            hoodies, and related apparel featuring motorcycle illustrations of
            brands such as Honda, Yamaha, Suzuki, and Kawasaki. These
            illustrations are artistic depictions and do not include official
            logos or trademarks of the companies.
          </p>
          <p>
            <strong>2.2 Disclaimer:</strong> The products are not officially
            endorsed by or affiliated with the aforementioned companies. They
            are sold purely for artistic and decorative purposes. Any reference
            to brand names is solely descriptive of the motorcycle models
            depicted.
          </p>
          <p>
            2.3 Customers are responsible for ensuring the appropriateness of
            the products for their intended use.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="intellectual-property" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            3. Intellectual Property
          </h3>
          <p>
            3.1 All content on this website, including but not limited to
            images, graphics, and text, is the intellectual property of
            Motowear. Unauthorized use, reproduction, or distribution of any
            content is strictly prohibited.
          </p>
          <p>
            3.2 If you believe that your intellectual property rights have been
            violated, please contact us at{' '}
            <a href="mailto:Motoweargr@gmail.com">Motoweargr@gmail.com</a>
            to resolve the matter.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="orders-payment" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            4. Orders and Payment
          </h3>
          <p>
            4.1 By placing an order, you agree to provide accurate, current, and
            complete information during the checkout process.
          </p>
          <p>
            4.2 We reserve the right to reject or cancel any order at our
            discretion. This includes cases where the product is unavailable,
            there are errors in the product description, or fraudulent activity
            is suspected.
          </p>
          <p>
            4.3 Payments are processed through secure payment gateways. We do
            not store your payment information on our servers.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="refund-policy" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            5. Refund Policy
          </h3>
          <p>
            5.1 Returns or exchanges are accepted within 30 days for defective
            products or incorrect sizing. Customers are responsible for the cost
            of shipping for returns or exchanges that arise from their own
            errors.
          </p>
          <p>
            5.2 For customized or personalized items (e.g., products featuring
            custom designs), customers must cover the shipping costs for both
            returning and reshipping the new product.
          </p>
          <p>5.3 The return/exchange process requires customers to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Use the original shipping address provided in their order.</li>
            <li>
              Include details from the shipping voucher found in the package.
            </li>
            <li>
              Contact us with the shipping number, full name on the order, and
              preference for exchange or refund.
            </li>
          </ul>
          <p>
            5.4 Refunds or exchanges will be processed once we receive the
            returned item. Items must be in their original condition and
            packaging.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="shipping-policy" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            6. Shipping Policy
          </h3>
          <p>6.1 Orders are shipped via ELTA Courier.</p>
          <p>
            6.2 Standard delivery time is 1 to 3 business days. Customized
            products may take 2 to 4 business days.
          </p>
          <p>
            6.3 Shipping delays due to unforeseen circumstances are not our
            responsibility.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="privacy-policy" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            7. Privacy Policy
          </h3>
          <p>
            Please review our{' '}
            <a href="/privacy_policy" className="text-red-600 hover:underline">
              Privacy Policy
            </a>{' '}
            for details on how we collect, use, and protect your personal data.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="limitation-liability" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            8. Limitation of Liability
          </h3>
          <p>
            8.1 We are not responsible for any direct, indirect, incidental, or
            consequential damages resulting from the use of our website or
            products.
          </p>
          <p>
            8.2 In jurisdictions that do not allow limitations on liability, our
            liability will be limited to the maximum extent permitted by law.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="governing-law" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            9. Governing Law
          </h3>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of Greece. Any disputes shall be subject to the exclusive
            jurisdiction of the courts of Greece.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="amendments" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            10. Amendments
          </h3>
          <p>
            We reserve the right to update these Terms at any time. Continued
            use of the website after modifications constitutes acceptance of the
            revised Terms.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="contact-info" className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            11. Contact Information
          </h3>
          <p>
            For questions about these Terms or any issues related to your order,
            please contact us at:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <strong>Email:</strong>{' '}
              <a
                href="mailto:motoweargr@gmail.com"
                className="text-red-600 hover:underline"
              >
                motoweargr@gmail.com
              </a>
            </li>
            <li>
              <strong>Phone:</strong>{' '}
              <a
                href="tel:+306939133385"
                className="text-red-600 hover:underline"
              >
                6939133385
              </a>
            </li>
            <li>
              <strong>Address:</strong> Theologos Rhodes 85101, Greece
            </li>
          </ul>
        </section>
      </main>
    </HeaderProvider>
  )
}
