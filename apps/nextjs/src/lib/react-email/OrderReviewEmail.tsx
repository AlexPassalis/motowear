import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Link,
} from '@react-email/components'
import type { typeOrder } from '@/lib/postgres/data/type'
import { envServer } from '@/env'

interface EmailProps {
  first_name: typeOrder['checkout']['first_name']
  order_id: typeOrder['id']
}

export function OrderReviewEmail({ first_name, order_id }: EmailProps) {
  const previewText = `Ευχαριστούμε πολύ για την αγορά σου!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="cid:motowear_logo"
                width={300}
                height={75}
                alt="Motowear logo"
                className="my-0 mx-auto block"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              <strong>Χαίρεται {first_name},</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              Ευχαριστούμε πολύ για την αγορά σου από το{' '}
              <strong>motowear.gr</strong>! Ελπίζουμε το προϊόν να σου άρεσε και
              να έδεσε ιδανικά με το στυλ σου.
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              Αν έχεις ένα λεπτό, θα μας βοηθούσε πολύ αν άφηνες μια σύντομη
              κριτική για την παραγγελία <strong>#{order_id}</strong>. Η γνώμη
              σου είναι πολύτιμη και μπορεί να βοηθήσει κι άλλους
              μοτοσυκλετιστές να διαλέξουν σωστά.
            </Text>
            <Section className="text-center my-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://${envServer.HOST}/review?order_id=${order_id}`}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontWeight: 'bold',
                }}
              >
                Πάτησε εδώ
              </Link>
            </Section>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              👉 <strong>Πάτησε</strong> το παραπάνω κουμπί για να αφήσεις την
              κριτική σου.{' '}
              <span>
                Ως ευχαριστώ για τη βοήθειά σου, θα σου στείλουμε ένα{' '}
                <strong>εκπτωτικό κουπόνι 15% 🎁</strong> για την επόμενη αγορά
                σου
              </span>
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              Σε ευχαριστούμε που στηρίζεις το <strong>motowear.gr</strong> και
              σου ευχόμαστε ασφαλείς και απολαυστικές βόλτες!
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              Με εκτίμηση, <br />Η ομάδα του <strong>Motowear.gr</strong>.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Για οποιαδήποτε απορία μπορείτε να επικοινωνήσετε μαζί μας στο
              τηλέφωνο{' '}
              <a href="tel:+306939133385" className="text-red-600 underline">
                693 913 3385
              </a>{' '}
              ή στο email{' '}
              <a
                href="mailto:motoweargr@gmail.com"
                className="text-red-600 underline"
              >
                motoweargr@gmail.com
              </a>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

OrderReviewEmail.PreviewProps = {
  first_name: 'Φίλιππος',
  order_id: '1000',
}

export default OrderReviewEmail
