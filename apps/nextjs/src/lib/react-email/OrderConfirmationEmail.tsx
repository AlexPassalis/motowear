import * as React from 'react'
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
} from '@react-email/components'
import type {
  typeCart,
  typeCheckout,
  typeOrder,
} from '@/lib/postgres/data/type'

interface EmailProps {
  order_id: typeOrder['id']
  cart: typeCart
  checkout: typeCheckout
}

export function OrderConfirmationEmail({
  order_id,
  cart,
  checkout,
}: EmailProps) {
  const previewText = `Ευχαριστούμε για την αγορά σας!`

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
              Ετοιμάζουμε την παραγγελία σας για αποστολή.
              <br />
              Θα σας ειδοποιήσουμε όταν αποσταλεί.
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mb-4">
              <strong>Αριθμός παραγγελίας:</strong>{' '}
              <span className="underline text-red-600">#{order_id}</span>
            </Text>
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
            <Section>
              <Text className="text-black text-[14px] leading-[24px] font-bold">
                Στοιχεία Αποστολής:
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                {checkout.first_name} {checkout.last_name}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                {checkout.address}
                {checkout.extra ? `, ${checkout.extra}` : ''}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                {checkout.post_code}, {checkout.city}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                {checkout.country}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                Τηλέφωνο: {checkout.phone}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-0">
                Email: {checkout.email}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] mb-4">
                Μέθοδος πληρωμής: {checkout.payment_method}
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
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
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

OrderConfirmationEmail.PreviewProps = {
  order_id: '1000',
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
  checkout: {
    email: 'customer@example.com',
    receive_email: true,
    country: 'Ελλάδα',
    first_name: 'Γιώργος',
    last_name: 'Παπαδόπουλος',
    address: 'Οδός Ερμού 123',
    extra: 'Διαμ. 5',
    post_code: '12345',
    city: 'Αθήνα',
    phone: 6946327759,
    receive_phone: true,
    payment_method: 'Αντικαταβολή',
  },
}

export default OrderConfirmationEmail
