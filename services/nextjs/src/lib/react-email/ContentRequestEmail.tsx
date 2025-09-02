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
import { envServer } from '@/env'

interface ContentRequestEmailProps {
  email: typeEmail
}

export function ContentRequestEmail({ email }: ContentRequestEmailProps) {
  const instagramLink = 'https://www.instagram.com/motowear.gr/'
  const facebookLink =
    'https://www.facebook.com/p/Moto-Wear-GR-100087815463903/'
  const unsubscribeLink = `https://${envServer.HOST}/unsubscribe?email=${email}`

  const previewText = `Το δέμα σου ήρθε... 🎉`

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
              Αν μας στείλεις μια φώτο (ή ανεβάσεις story με tag @motowear.gr),
              θα σε ανεβάσουμε στο{' '}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={instagramLink}
                className="text-[#E4405F]"
              >
                Instagram
              </Link>{' '}
              &{' '}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={facebookLink}
                className="text-[#1877F2]"
              >
                Facebook
              </Link>{' '}
              μας.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Και ναι — θα σου δώσουμε και κωδικό -20% για την επόμενη φορά. 😉
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Τα βήματα είναι απλά: 🔥
            </Text>
            <ol>
              <li
                style={{
                  fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                  fontSize: '18px',
                  lineHeight: '24px',
                }}
                className="mb-4"
              >
                Βγάλε μια φωτογραφία ή βίντεο με κάποιο απο τα προϊόντα μας πάνω
                στη μηχανή σου.
              </li>
              <li
                style={{
                  fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                  fontSize: '18px',
                  lineHeight: '24px',
                }}
              >
                Στείλ&apos;τη μας στο @motowear.gr ή ανέβασε story με tag.
              </li>
            </ol>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-4"
            >
              Εμείς: <br /> Θα σε ανεβάσουμε στο Instagram & Facebook μας
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-4 mb-8"
            >
              Και θα σου δώσουμε κωδικό έκπτωσης -20% για την επόμενη αγορά σου.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Σε ευχαριστούμε για την εμπιστοσύνη σου! 🙏
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-4"
            >
              Τα λέμε στο δρόμο, 😉
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-4 mb-8"
            >
              Η ομάδα της Motowear. 🚀
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px]">
              Για οποιαδήποτε απορία, μπορείτε να επικοινωνήσετε μαζί μας στο
              τηλέφωνο{' '}
              <a href="tel:+306939133385" className="text-red-600 underline">
                693 913 3385
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
                href={unsubscribeLink}
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

ContentRequestEmail.PreviewProps = {
  email: 'alexpassalis9@gmail.com',
}

export default ContentRequestEmail
