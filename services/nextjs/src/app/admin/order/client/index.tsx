'use client'

import classes from '@/css/TableSelection.module.css'
import cx from 'clsx'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

import type { typeOrder } from '@/lib/postgres/data/type'
import { zodOrder } from '@/lib/postgres/data/zod'

import { errorUnexpected } from '@/data/error'
import { envClient, envServer } from '@/env'
import { order } from '@/lib/postgres/schema'
import {
  Button,
  Checkbox,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Table,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import axios from 'axios'
import Link from 'next/link'
import { Fragment, useMemo, useState } from 'react'
import { formatInTimeZone } from 'date-fns-tz'
import { z } from 'zod'
import { AdminProvider } from '@/app/admin/components/AdminProvider'

type AdminOrderPageClientProps = {
  postgres_orders: typeOrder[]
}

export function AdminOrderPageClient({
  postgres_orders,
}: AdminOrderPageClientProps) {
  const [onRequest, setOnRequest] = useState(false)
  const [orders, setOrders] = useState(postgres_orders)

  const paginationPageSize = 25
  const [pageNumber, setPageNumber] = useState(1)
  const [showUnfulfilledOnly, setShowUnfulfilledOnly] = useState(false)

  const visibleOrders = useMemo(() => {
    return orders.slice(
      (pageNumber - 1) * paginationPageSize,
      pageNumber * paginationPageSize,
    )
  }, [orders, pageNumber])

  const [modalState, setModalState] = useState<{
    type: '' | 'Checkout' | 'Cart' | 'Delete'
    id: number
  }>({
    type: '',
    id: 0,
  })
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false)
  const modalOrder = orders.find((order) => order.id === modalState.id)

  const [selection, setSelection] = useState<typeOrder[]>([])

  return (
    <AdminProvider>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalState({ type: '', id: 0 })
          closeModal()
        }}
        title={modalState.type}
        centered
      >
        <>
          {modalState.type === 'Checkout' && modalOrder && (
            <div className="flex flex-col gap-2 border-2 border-[var(--mantine-border)] rounded-lg p-2">
              <div className="flex justify-between items-center">
                <a href={`mailto:${modalOrder.checkout.email}`}>
                  <h1 className="text-blue-700">email</h1>
                </a>
                <TextInput
                  value={modalOrder.checkout.email}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              email: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>receive_email</h1>
                <Select
                  data={['true', 'false']}
                  value={modalOrder.checkout.receive_email.toString()}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              receive_email: e === 'true' ? true : false,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  allowDeselect={false}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>country</h1>
                <Select
                  data={['Ελλάδα', 'Κύπρος']}
                  value={modalOrder.checkout.country.toString()}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              country: e === 'Κύπρος' ? 'Κύπρος' : 'Ελλάδα',
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  allowDeselect={false}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>first_name</h1>
                <TextInput
                  value={modalOrder.checkout.first_name}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              first_name: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>last_name</h1>
                <TextInput
                  value={modalOrder.checkout.last_name}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              last_name: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>address</h1>
                <TextInput
                  value={modalOrder.checkout.address}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              address: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>extra</h1>
                <TextInput
                  value={modalOrder.checkout.extra}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              extra: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>post_code</h1>
                <TextInput
                  value={modalOrder.checkout.post_code}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              post_code: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>city</h1>
                <TextInput
                  value={modalOrder.checkout.city}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              city: e.target.value,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <a href={`tel:${modalOrder.checkout.phone}`}>
                  <h1 className="text-blue-700">phone</h1>
                </a>
                <NumberInput
                  value={modalOrder.checkout.phone}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              phone: String(e),
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>receive_phone</h1>
                <Select
                  data={['true', 'false']}
                  value={modalOrder.checkout.receive_phone.toString()}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              receive_phone: e === 'true' ? true : false,
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  allowDeselect={false}
                  classNames={{ input: '!text-center' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <h1>payment_method</h1>
                <Select
                  data={['Κάρτα', 'Αντικαταβολή']}
                  value={modalOrder.checkout.payment_method.toString()}
                  onChange={(e) => {
                    setOrders((prev) =>
                      prev.map((order) => {
                        if (order.id === modalState.id) {
                          return {
                            ...order,
                            checkout: {
                              ...order.checkout,
                              payment_method:
                                e === 'Κάρτα' ? 'Κάρτα' : 'Αντικαταβολή',
                            },
                          }
                        }
                        return order
                      }),
                    )
                  }}
                  allowDeselect={false}
                  classNames={{ input: '!text-center' }}
                />
              </div>
            </div>
          )}

          {modalState.type === 'Cart' && modalOrder && (
            <div>
              {orders
                .find((order) => order.id === modalState.id)!
                .cart.map((_, index, array) => (
                  <Fragment key={index}>
                    <div className="flex flex-col gap-2 border-2 border-[var(--mantine-border)] rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <h1>product_type</h1>
                        <TextInput
                          value={modalOrder.cart[index].product_type}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              product_type: e.target.value,
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h1>variant</h1>
                        <TextInput
                          value={modalOrder.cart[index].name}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              name: e.target.value,
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h1>color</h1>
                        <TextInput
                          value={modalOrder.cart[index].color}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              color: e.target.value,
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h1>size</h1>
                        <TextInput
                          value={modalOrder.cart[index].size}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              size: e.target.value,
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h1>price</h1>
                        <NumberInput
                          min={0}
                          max={9999.99}
                          suffix="€"
                          value={modalOrder.cart[index].price}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              price: Number(e),
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h1>quantity</h1>
                        <NumberInput
                          min={0}
                          max={9999.99}
                          value={modalOrder.cart[index].quantity}
                          onChange={(e) => {
                            setOrders((prev) =>
                              prev.map((order) => {
                                if (order.id === modalState.id) {
                                  return {
                                    ...order,
                                    cart: order.cart.map(
                                      (cartItem, cartIndex) =>
                                        cartIndex === index
                                          ? {
                                              ...cartItem,
                                              quantity: Number(e),
                                            }
                                          : cartItem,
                                    ),
                                  }
                                }
                                return order
                              }),
                            )
                          }}
                          classNames={{ input: '!text-center' }}
                        />
                      </div>
                    </div>
                    {index !== array.length - 1 && (
                      <hr className="w-full border-t-2 border-[var(--mantine-border)] my-2" />
                    )}
                  </Fragment>
                ))}
            </div>
          )}

          {modalState.type === 'Delete' && (
            <div className="flex flex-col">
              <h1>You are about to delete order with id: {modalState.id}</h1>
              <h2>Click the delete button to delete.</h2>
              <Button
                onClick={async () => {
                  setOnRequest(true)
                  try {
                    const res = await axios.delete(
                      `${envClient.API_ADMIN_URL}/order`,
                      {
                        data: {
                          id: modalState.id,
                        },
                      },
                    )
                    if (res.status === 200) {
                      window.location.reload()
                    } else {
                      alert(
                        `Error deleting ${order.id}: ${
                          res.data?.message || errorUnexpected
                        }`,
                      )
                      console.error(res)
                    }
                  } catch (e) {
                    alert(`Error deleting ${order.id}`)
                    console.error(e)
                  }
                  setOnRequest(false)
                }}
                type="button"
                disabled={onRequest}
                color="red"
                mt="lg"
                className="mx-auto"
              >
                {onRequest ? 'Wait ...' : 'Delete'}
              </Button>
            </div>
          )}
        </>
      </Modal>
      <div className="border border-[var(--mantine-border)] rounded-lg bg-white m-4 overflow-x-auto">
        <Table miw={700}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: 'none' }}>
              <Table.Th
                colSpan={15}
                style={{ textAlign: 'center' }}
                className="text-2xl font-bold"
              >
                Orders
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              <Table.Th />
              <Table.Th style={{ textAlign: 'center' }}>Id</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Order Date</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Checkout</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Cart</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Coupon</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Total</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>
                Shipping Expense
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>
                Shipping Surcharge
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Order Code</Table.Th>
              <Table.Th
                onClick={() => {
                  if (!showUnfulfilledOnly) {
                    setOrders(
                      postgres_orders.filter((order) => !order.date_fulfilled),
                    )
                    setPageNumber(1)
                    setShowUnfulfilledOnly(true)
                  }
                }}
                style={{ textAlign: 'center' }}
                className="text-blue-700 hover:cursor-pointer"
              >
                Date Fulfilled
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>
                Tracking Number
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>
                Fulfilled Email
              </Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Review Email</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleOrders.map((order) => (
              <Table.Tr
                key={order.id}
                className={cx({
                  [classes.rowSelected]: selection.some(
                    (ord) => ord.id === order.id,
                  ),
                })}
                style={{
                  background: `${order.date_fulfilled ? 'PaleGreen' : 'White'}`,
                }}
              >
                <Table.Td>
                  <Checkbox
                    checked={selection.some((ord) => ord.id === order.id)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelection((prev) => [
                            ...prev,
                            orders.find((ord) => ord.id === order.id)!,
                          ])
                        : setSelection((prev) =>
                            prev.filter((ord) => ord.id !== order.id),
                          )
                    }
                  />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {order.id}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {formatInTimeZone(
                    order.order_date,
                    'UTC',
                    'dd/MM/yyyy HH:mm:ss',
                  )}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => {
                      setModalState({ type: 'Checkout', id: order.id })
                      openModal()
                    }}
                  >
                    Info
                  </Button>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => {
                      setModalState({ type: 'Cart', id: order.id })
                      openModal()
                    }}
                  >
                    Info
                  </Button>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {order?.coupon
                    ? order.coupon.coupon_code === 'FREEMPRELOK'
                      ? 'MPRELOK'
                      : order.coupon.percentage
                      ? `${order.coupon.percentage * 100}%`
                      : `-${order.coupon.fixed}`
                    : '-'}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {order.total}€
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {order.shippping_expense
                    ? `${order.shippping_expense}€`
                    : '-'}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {order.shipping_surcharge
                    ? `${order.shipping_surcharge}€`
                    : '-'}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {order?.order_code ? order.order_code : '-'}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.date_fulfilled
                    ? formatInTimeZone(
                        order.date_fulfilled,
                        'UTC',
                        'dd/MM/yyyy HH:mm:ss',
                      )
                    : '-'}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    color: `${order.tracking_number ? 'blue' : 'black'}`,
                  }}
                >
                  {order.tracking_number ? (
                    <Link
                      href={`${envServer.ELTA_COURIER_URL}${order.tracking_number}`}
                    >
                      {order.tracking_number}
                    </Link>
                  ) : (
                    '-'
                  )}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.fulfilled_email ? 'send' : 'not-send'}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {order.review_email ? 'send' : 'not-send'}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Button
                    onClick={async () => {
                      setModalState({ type: 'Delete', id: order.id })
                      openModal()
                    }}
                    type="button"
                    disabled={onRequest}
                    color="red"
                  >
                    {onRequest ? 'Wait ...' : 'Delete'}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={15} style={{ textAlign: 'center' }}>
                <div
                  style={{ display: 'inline-block', marginBottom: '0.5rem' }}
                >
                  <Button
                    onClick={async () => {
                      const { data: validatedOrders } = z
                        .array(zodOrder)
                        .safeParse(orders)

                      if (!validatedOrders) {
                        alert('Invalid orders format')
                        return
                      }

                      setOnRequest(true)
                      try {
                        const res = await axios.post(
                          `${envClient.API_ADMIN_URL}/order`,
                          {
                            orders: validatedOrders,
                          },
                        )
                        if (res.status === 200) {
                          window.location.reload()
                        } else {
                          alert(
                            `Error creating New Orders: ${
                              res.data?.message || errorUnexpected
                            }`,
                          )
                          console.error(res)
                        }
                      } catch (e) {
                        alert('Error creating New Orders')
                        console.error(e)
                      }
                      setOnRequest(false)
                    }}
                    type="button"
                    disabled={
                      JSON.stringify(orders) ===
                        JSON.stringify(postgres_orders) ||
                      onRequest ||
                      showUnfulfilledOnly
                    }
                    color="green"
                    mr="md"
                  >
                    {onRequest ? 'Wait ...' : 'Apply changes'}
                  </Button>
                  <Button
                    onClick={async () => {
                      const grouped: Record<
                        string,
                        ({ orderId: number } & typeOrder['cart'][number])[]
                      > = {}
                      for (const { id, cart } of selection) {
                        for (const item of cart)
                          (grouped[item.product_type] ||= []).push({
                            orderId: id,
                            ...item,
                          })
                      }

                      const pdfDoc = await PDFDocument.create()
                      pdfDoc.registerFontkit(fontkit)
                      const fontBytes = await fetch(
                        '/fonts/NotoSans-Regular.ttf',
                      ).then((r) => r.arrayBuffer())
                      const greekFont = await pdfDoc.embedFont(fontBytes, {
                        subset: false,
                      })

                      const fontSize = 12
                      const lineHeight = fontSize * 1.3
                      const margin = 40
                      const headingSize = 26
                      const groupGap = lineHeight * 2

                      let page = pdfDoc.addPage()
                      let y = page.getSize().height - margin

                      const drawHeading = (title: string) => {
                        page.drawText(title, {
                          x: margin,
                          y,
                          size: headingSize,
                          font: greekFont,
                          color: rgb(0, 0, 0.6),
                        })
                        const w = greekFont.widthOfTextAtSize(
                          title,
                          headingSize,
                        )
                        page.drawLine({
                          start: { x: margin, y: y - 2 },
                          end: { x: margin + w, y: y - 2 },
                          thickness: 1,
                          color: rgb(0, 0, 0.6),
                        })
                        y -= (headingSize + lineHeight) * 0.5
                      }

                      for (const [type, items] of Object.entries(grouped)) {
                        if (y < margin + headingSize) {
                          page = pdfDoc.addPage()
                          y = page.getSize().height - margin
                        }
                        drawHeading(type)

                        for (const {
                          orderId,
                          size,
                          color,
                          name,
                          quantity,
                        } of items) {
                          if (y < margin + lineHeight) {
                            page = pdfDoc.addPage()
                            y = page.getSize().height - margin
                            drawHeading(type)
                          }

                          const line = [
                            orderId.toString().padEnd(5),
                            size.padEnd(6),
                            color.padEnd(7),
                            `x${quantity.toString().padEnd(3)}`,
                            name,
                          ].join(' ')

                          page.drawText(line, {
                            x: margin,
                            y,
                            size: fontSize,
                            font: greekFont,
                          })
                          y -= lineHeight
                        }

                        y -= groupGap
                      }

                      const blobUrl = URL.createObjectURL(
                        new Blob([await pdfDoc.save()], {
                          type: 'application/pdf',
                        }),
                      )
                      window.open(blobUrl, '_blank')
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
                    }}
                    type="button"
                    disabled={selection.length < 1 || onRequest}
                    color="blue"
                  >
                    {onRequest ? 'Wait ...' : 'Packing slips'}
                  </Button>
                </div>
                <Pagination
                  total={Math.ceil(orders.length / paginationPageSize)}
                  value={pageNumber}
                  onChange={(pageNumber) => setPageNumber(pageNumber)}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                />
              </Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </div>
    </AdminProvider>
  )
}
