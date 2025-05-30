import * as React from 'react'
import type { typeCart, typeEmail } from '@/lib/postgres/data/type'
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Link,
} from '@react-email/components'
import { envServer } from '@/env'

interface AbandonCartEmailProps {
  email: typeEmail
  cart: typeCart
}

export function AbandonCartEmail({ email, cart }: AbandonCartEmailProps) {
  const previewText = `Άσε το γκάζι... αλλά όχι την παραγγελία σου!`

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
              Εδώ στα κεντρικά της Motowear, μόλις γυρίσαμε από μια τρελή
              διαδρομή…
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Λίγες στροφές, λίγες σούζες, και φυσικά… μια πολύ σημαντική
              δουλειά να γίνει.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Αλλά πριν βάλουμε κράνη ξανά …
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Πρόσεξα κάτι: «ΔΕΝ ΕΧΕΙΣ ΟΛΟΚΛΗΡΩΣΕΙ ΤΗΝ ΠΑΡΑΓΓΕΛΙΑ ΠΟΥ
              ΞΕΚΙΝΗΣΕΣ»...
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
              Σου θυμίζουν κάτι;
            </Text>
            <Section>
              {cart.map((product, index) => {
                const tight = { margin: '4px 0' } as const
                return (
                  <Container
                    key={index}
                    style={{
                      marginBottom: '8px',
                      borderRadius: '0.5rem',
                      border: '1px solid #eaeaea',
                      overflow: 'hidden',
                    }}
                  >
                    <Row>
                      <Column
                        className="w-1/2"
                        style={{ verticalAlign: 'center' }}
                      >
                        <Img
                          src={`cid:item-${index}`}
                          alt={`${product.product_type} ${product.image}`}
                          style={{
                            display: 'block',
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      </Column>
                      <Column className="w-1/2 p-2 relative">
                        <Text style={tight}>{product.product_type}</Text>
                        <Text style={tight}>{product.name}</Text>
                        {product.color && (
                          <div style={tight} className="flex items-center">
                            <Text className="mr-1" style={{ margin: 0 }}>
                              Χρώμα:
                            </Text>
                            <span
                              style={{ backgroundColor: product.color }}
                              className="ml-1 inline-block w-4 h-4 rounded-full"
                            />
                          </div>
                        )}
                        {product.size && (
                          <Text style={tight}>Μέγεθος: {product.size}</Text>
                        )}
                      </Column>
                    </Row>
                  </Container>
                )
              })}
            </Section>
            <Section className="text-center my-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://${envServer.HOST}/checkout?abandon_cart=true`}
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
                ΠΗΓΑΙΝΕ ΜΕ ΣΤΟ ΚΑΛΑΘΙ ΜΟΥ
              </Link>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Είμαστε έτοιμοι να φτιάξουμε την παραγγελία σου όσο πιο γρήγορα
              γίνεται, ώστε να τα έχεις στα χέρια σου πριν το επόμενο ride!
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Οπότε, πάτα στο παραπάνω κουμπί για να γυρίσεις στο καλάθι σου και
              να ολοκληρώσεις την παραγγελία σου.
            </Text>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Α, και που ‘σαι… Δεν μπορούμε να κρατήσουμε τα προϊόντα στο καλάθι
              σου για πάντα. Οι υπόλοιποι riders ψάχνουν ακριβώς τα ίδια, οπότε
              καλύτερα να κινηθείς γρήγορα!
            </Text>
            <Section className="text-center my-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://${envServer.HOST}`}
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
                ΕΠΙΣΚΕΨΟΥ ΤΟ ΚΑΤΑΣΤΗΜΑ
              </Link>
            </Section>
            <Text
              style={{
                fontFamily: 'Proxima Nova, Arial, Helvetica, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
              }}
              className="text-black text-[14px] mt-8 mb-8"
            >
              Υ.Γ. Αν έχεις κάποια απορία ή χρειάζεσαι βοήθεια με την παραγγελία
              σου, απλά απάντησε σε αυτό το email.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px]">
              Για οποιαδήποτε απορία σχετικά με την παραγγελία σας, μπορείτε να
              επικοινωνήσετε μαζί μας στο τηλέφωνο{' '}
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

AbandonCartEmail.PreviewProps = {
  email: 'alexpassalis9@gmail.com',
  cart: [
    {
      product_type: 'Μπλουζάκι',
      name: 'Classic Tee',
      color: 'black',
      size: 'M',
      price: 19.99,
      quantity: 2,
      image: 'classic-tee.jpg',
    },
    {
      product_type: 'Φούτερ',
      name: 'Sport Hoodie',
      color: 'red',
      size: 'L',
      price: 39.99,
      quantity: 1,
      image: 'sport-hoodie.jpg',
    },
  ],
}

export default AbandonCartEmail
