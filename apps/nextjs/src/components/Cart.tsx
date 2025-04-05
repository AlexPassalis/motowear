import { envClient } from '@/env'
import { Button, Image, UnstyledButton } from '@mantine/core'
import NextImage from 'next/image'
import { Dispatch, SetStateAction } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { FaTrashCan } from 'react-icons/fa6'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'
import Link from 'next/link'
import { ROUTE_CHECKOUT, ROUTE_PRODUCT } from '@/data/routes'
import { LocalStorageCartItem } from '@/data/type'

type CartProps = {
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  cart: LocalStorageCartItem[]
  setCart: Dispatch<SetStateAction<LocalStorageCartItem[]>>
}

export function Cart({ cart, setCart, isCartOpen, setIsCartOpen }: CartProps) {
  return (
    <section
      className={`z-20 fixed top-0 right-0 w-3/4 max-w-[365px] h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full p-4 min-h-0">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 mb-2 border-gray-200">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl">
            Καλάθι ({cart.length})
          </h1>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex ml-auto justify-center items-center h-10 w-10 rounded-md border border-gray-200 transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        {cart.length < 1 ? (
          <h1 className="text-2xl">Το καλάθι σου είναι άδειο.</h1>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {cart.map((product, index) => (
              <div
                key={index}
                className="flex w-full h-36 p-1 mb-2 rounded-lg border border-gray-200"
              >
                <Link
                  href={`${ROUTE_PRODUCT}/${product.procuct_type}/${product.variant}`}
                  className="relative w-1/3 h-full"
                >
                  <Image
                    component={NextImage}
                    src={`${envClient.MINIO_PRODUCT_URL}/${product.procuct_type}/${product.image}`}
                    alt={`${product.procuct_type}/${product.variant}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="auto"
                  />
                </Link>
                <div className="relative w-2/3 flex flex-col justify-center gap-0.5 p-1 pl-4">
                  <FaTrashCan
                    onClick={() =>
                      setCart(prev => prev.filter((_, i) => i !== index))
                    }
                    className="absolute top-1 right-1 hover:cursor-pointer"
                  />
                  <h1>{product.procuct_type}</h1>
                  <h1>{product.variant}</h1>
                  {product?.color && (
                    <div className="flex gap-1">
                      <h2>Χρώμα: </h2>
                      <div
                        style={{ backgroundColor: product.color }}
                        className="w-6 h-6 rounded-full"
                      />
                    </div>
                  )}
                  {product?.size && (
                    <div className="flex gap-1">
                      <h2>Μέγεθος: </h2>
                      <p>{product.size}</p>
                    </div>
                  )}
                  {product?.price_before ? (
                    <>
                      <div className="flex gap-2 items-center">
                        <h2 className="text-sm text-gray-400 line-through decoration-red-500">
                          {product.price_before * product.quantity}€
                        </h2>
                        <h2>{product.price * product.quantity}€</h2>
                      </div>
                    </>
                  ) : (
                    <h2>{product.price * product.quantity}€</h2>
                  )}

                  <div className="absolute bottom-1 right-1 flex w-16 h-[28px] rounded-lg border-2 border-gray-200">
                    <div
                      onClick={() =>
                        setCart(prev =>
                          prev.map((item, i) =>
                            i === index && item.quantity > 1
                              ? { ...item, quantity: item.quantity - 1 }
                              : item
                          )
                        )
                      }
                      className="w-1/3"
                    >
                      <UnstyledButton
                        size="compact-md"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FaMinus size={10} />
                      </UnstyledButton>
                    </div>
                    <div className="flex w-1/3 items-center justify-center border-x-1 border-gray-200">
                      <p>{product.quantity}</p>
                    </div>
                    <div
                      onClick={() =>
                        setCart(prev =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, quantity: item.quantity + 1 }
                              : item
                          )
                        )
                      }
                      className="w-1/3"
                    >
                      <UnstyledButton
                        size="compact-sm"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FaPlus size={10} />
                      </UnstyledButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <Link href={ROUTE_CHECKOUT} className="mt-auto">
            <Button color="red" style={{ width: '100%' }}>
              Ταμείο{' '}
              {cart.reduce((acc, item) => acc + item.price * item.quantity, 0)}€
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
