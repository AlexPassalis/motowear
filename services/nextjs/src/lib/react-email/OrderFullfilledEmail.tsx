import * as React from 'react'
import type { typeOrder, typeCart } from '@/lib/postgres/data/type'
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
import { envClient } from '@/envClient'

interface EmailProps {
  tracking_number: typeOrder['tracking_number']
  order_id: typeOrder['id']
  total: typeOrder['total']
  einvoice_link: typeOrder['einvoice_link']
  cart: typeCart
  box_now_locker_id: typeOrder['checkout']['box_now_locker_id']
}

export function OrderFullfilledEmail({
  tracking_number,
  order_id,
  total,
  einvoice_link,
  cart,
  box_now_locker_id,
}: EmailProps) {
  const previewText = `Η παραγγελία σας βρίσκεται καθ' οδόν!`

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
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              Παρακολουθήστε την αποστολή για να δείτε την κατάσταση παράδοσης
              της.
            </Text>
            <Section className="text-center my-4">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`${
                  box_now_locker_id
                    ? envClient.BOX_NOW_URL
                    : envClient.ELTA_COURIER_URL
                }${tracking_number}`}
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
                Παρακολούθηση Αποστολής
              </Link>
            </Section>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              <strong>Αριθμός παρακολούθησης:</strong>{' '}
              <span className="underline text-red-600">{tracking_number}</span>
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              <strong>Αριθμός παραγγελίας:</strong>{' '}
              <span className="underline text-red-600">#{order_id}</span>
            </Text>
            <Text className="text-black text-[14px] leading-[24px] font-bold mb-4">
              Σύνολο: <span className="font-normal">{total}€</span>
            </Text>
            {einvoice_link && (
              <Text className="text-black text-[14px] leading-[24px] font-bold mb-4">
                Απόδειξη πελάτη:{' '}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={einvoice_link}
                  className="font-normal underline text-blue-600"
                >
                  ProsvasisGo
                </Link>
              </Text>
            )}
            <Text className="text-black text-[14px] leading-[24px] font-bold mb-4">
              Σύνοψη παραγγελίας:
            </Text>
            <Section>
              {cart.map((product, index) => {
                const total = (product.price * product.quantity).toFixed(2)
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
                        className="w-1/3"
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
                      <Column className="w-2/3 p-2 relative">
                        <Text style={tight}>{product.product_type}</Text>
                        <Text style={tight}>{product.name}</Text>
                        {product.color && (
                          <Text className="mr-1" style={{ margin: 0 }}>
                            Χρώμα: {product.color}
                          </Text>
                        )}
                        {product.size && (
                          <Text style={tight}>Μέγεθος: {product.size}</Text>
                        )}
                        <Text style={tight} className="text-[14px]">
                          Ποσότητα: {product.quantity}
                        </Text>
                        <Text style={tight}>Σύνολο: {total}€</Text>
                      </Column>
                    </Row>
                  </Container>
                )
              })}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Για οποιαδήποτε απορία σχετικά με την παραγγελία σας, μπορείτε να
              επικοινωνήσετε μαζί μας στο τηλέφωνο{' '}
              <a
                href={`tel:+30${envClient.MOTOWEAR_PHONE_NUMBER}`}
                className="text-red-600 underline"
              >
                {envClient.MOTOWEAR_PHONE_NUMBER}
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
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

OrderFullfilledEmail.PreviewProps = {
  tracking_number: '123456789',
  order_id: '1000',
  total: 68.98,
  einvoice_link:
    'https://go-einvoicing.prosvasis.com/v/EL054600895-3087881-0050BB813F9E0E8EF641C0D41A49D3F39F2FE896-99FBD88BD9694A519D91F3C99F89E7AD',
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

export default OrderFullfilledEmail
