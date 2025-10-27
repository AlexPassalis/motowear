import * as React from 'react'
import type { typeEmail } from '@/lib/postgres/data/type'
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
import { envServer } from '@/envServer'

interface MistakeEmailProps {
  email: typeEmail
}

export function MistakeEmail({ email }: MistakeEmailProps) {
  const previewText = `Σχετικά με το προηγούμενο email`

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
                alt="motowear.gr"
                className="my-0 mx-auto block"
              />
            </Section>
            <Heading
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
              }}
              className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0"
            >
              {previewText}
            </Heading>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Το προηγούμενο email που λάβατε στάλθηκε αυτόματα από λάθος του
              συστήματος.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Παρακαλώ όπως το αγνοήσετε.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Ευχαριστούμε για την κατανόηση!
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Φιλικά,
              <br />Η ομάδα της Motowear
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px]">
              Για οποιαδήποτε απορία σχετικά με την παραγγελία σας, μπορείτε να
              επικοινωνήσετε μαζί μας στο τηλέφωνο{' '}
              <a href="tel:+306939133385" className="text-red-600 underline">
                693 913 3385
              </a>{' '}
              ή στο email{' '}
              <a
                href="mailto:contact@motowear.gr"
                className="text-red-600 underline"
              >
                contact@motowear.gr
              </a>
              .
            </Text>
            <Section style={{ textAlign: 'right', marginTop: '16px' }}>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://${envServer.HOST}/unsubscribe?email=${email}`}
                className="text-[12px] text-red-600 underline"
              >
                Unsubscribe
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

MistakeEmail.PreviewProps = {
  email: 'alexpassalis9@gmail.com',
}

export default MistakeEmail
