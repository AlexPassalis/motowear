'use client'

import { ROUTE_HOME, ROUTE_PRODUCT } from '@/data/routes'
import { Image } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  AiOutlineMenu,
  AiOutlineShopping,
  AiFillShopping,
  AiOutlineClose,
} from 'react-icons/ai'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch'
import { typesenseClient } from '@/lib/typesense/client'
import { LocalStorageCartItem } from '@/utils/localStorage'
import { Indicator, Grid, Button } from '@mantine/core'
import { envClient } from '@/env'
import { Document } from '@/lib/typesense/server'

type HeaderProps = {
  productTypes: string[]
  cart: LocalStorageCartItem[]
  setCart: Dispatch<SetStateAction<LocalStorageCartItem[]>>
}

export function Header({ productTypes, cart, setCart }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="relative z-20">
      <Main
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        cart={cart}
      />
      <Menu
        productTypes={productTypes}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        setCart={setCart}
      />
      <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
    </header>
  )
}

type MainProps = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  cart: LocalStorageCartItem[]
}

function Main({
  isMenuOpen,
  setIsMenuOpen,
  isCartOpen,
  setIsCartOpen,
  isSearchOpen,
  setIsSearchOpen,
  cart,
}: MainProps) {
  return (
    <div className="relative flex justify-between items-center w-full p-4 border-b border-neutral-300">
      <div className="flex justify-start">
        <button
          onClick={() => {
            if (isCartOpen) {
              setIsCartOpen(false)
            }
            if (isSearchOpen) {
              setIsSearchOpen(false)
            }
            setIsMenuOpen(!isMenuOpen)
          }}
          className="lg:hidden flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
        >
          <AiOutlineMenu className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>
        <Link href={ROUTE_HOME} className="hidden lg:block">
          <Image
            component={NextImage}
            src="/motowear.webp"
            width={164}
            height={164}
            alt="Motowear logo"
            className="sm:scale-110"
          />
        </Link>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 lg:w-1/4">
        <Link href={ROUTE_HOME} className="lg:hidden">
          <Image
            component={NextImage}
            src="/motowear.webp"
            width={164}
            height={164}
            alt="Motowear logo"
            className="sm:scale-110"
          />
        </Link>
      </div>

      <div className="flex justify-end gap-1 sm:gap-3 lg:gap-12 2xl:gap-32">
        <button className="flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group">
          <HiMagnifyingGlass
            onClick={() => {
              if (isMenuOpen) {
                setIsMenuOpen(false)
              }
              if (isCartOpen) {
                setIsCartOpen(false)
              }
              setIsSearchOpen(!isSearchOpen)
            }}
            className="transition-transform duration-200 ease-in-out group-hover:scale-150"
          />
        </button>
        <Indicator
          disabled={cart.length < 1}
          position="bottom-end"
          color="red"
          label={cart.length}
          size={20}
          zIndex={1}
        >
          <button
            onClick={() => {
              if (isMenuOpen) {
                setIsMenuOpen(false)
              }
              if (isSearchOpen) {
                setIsSearchOpen(false)
              }
              setIsCartOpen(!isCartOpen)
            }}
            className="flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
          >
            {cart.length < 1 ? (
              <AiOutlineShopping className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
            ) : (
              <AiFillShopping className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
            )}
          </button>
        </Indicator>
      </div>
    </div>
  )
}

type MenuProps = {
  productTypes: string[]
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}

function Menu({ productTypes, isMenuOpen, setIsMenuOpen }: MenuProps) {
  return (
    <div
      className={`z-10 fixed top-0 left-0 h-full bg-neutral-50 w-80 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-neutral-200">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
          <h1 className="text-2xl text-center font-bold">Επιλογές</h1>
        </div>
        <nav>
          <ul>
            {productTypes.map(productType => (
              <li key={productType}>
                <Link href={`${ROUTE_PRODUCT}/${productType}`}>
                  {productType}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

type CartProps = {
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  cart: LocalStorageCartItem[]
  setCart: Dispatch<SetStateAction<LocalStorageCartItem[]>>
}

function Cart({ isCartOpen, setIsCartOpen, cart, setCart }: CartProps) {
  return (
    <div
      className={`z-10 fixed top-0 right-0 h-full bg-neutral-50 w-80 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 mb-2 border-neutral-200">
          <h1 className="text-2xl text-center font-bold">Καλάθι</h1>
          <button
            onClick={() => {
              setIsCartOpen(!isCartOpen)
            }}
            className="flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        {cart.length < 1 ? (
          <h1>Το καλάθι σου είναι άδειο.</h1>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map((product, index) => (
              <div
                key={`${product.type}-${product.version}-${product.color}-${product.size}`}
              >
                <Grid>
                  <Grid.Col span={6}>
                    <div className="flex gap-1">
                      <h1>{product.type}</h1>
                      <h2 className="font-bold">{product.version}</h2>
                    </div>
                    {product.color && (
                      <div className="flex gap-1">
                        <h1>Χρώμα</h1>
                        <div
                          className={`bg-${product.color} w-6 h-6 rounded-full`}
                        />
                      </div>
                    )}
                    {product.size && (
                      <div className="flex gap-1">
                        <h1>Μέγεθος</h1>
                        <h2 className="font-bold">{product.size}</h2>
                      </div>
                    )}
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <div className="relative w-full aspect-square">
                      <Image
                        component={NextImage}
                        src={`${envClient.MINIO_PRODUCT_URL}/${product.type}/${product.version}/${product.image}`}
                        alt={`${product.type}/${product.version}`}
                        fill
                      />
                    </div>
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <div className="flex gap-1">
                      <h1>Τιμή</h1>
                      {product.price_before > 0 && (
                        <h2 className="text-gray-500 line-through">
                          {product.price_before * product.quantity}€
                        </h2>
                      )}
                      <h2 className="font-bold">
                        {product.price * product.quantity}€
                      </h2>
                    </div>
                    {product.price_before > 0 && (
                      <h2 className="text-green-700">
                        (Κερδίζεις{' '}
                        {(product.price_before - product.price) *
                          product.quantity}
                        €)
                      </h2>
                    )}
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <div className="inline-flex items-center gap-3 border">
                      <Button
                        onClick={() =>
                          setCart(prev =>
                            prev.reduce<LocalStorageCartItem[]>(
                              (acc, item, i) => {
                                if (i === index) {
                                  const newQuantity = item.quantity - 1
                                  if (newQuantity > 0) {
                                    acc.push({ ...item, quantity: newQuantity })
                                  }
                                } else {
                                  acc.push(item)
                                }
                                return acc
                              },
                              [] as LocalStorageCartItem[]
                            )
                          )
                        }
                      >
                        -
                      </Button>
                      <h1>{product.quantity}</h1>
                      <Button
                        onClick={() =>
                          setCart(prev =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                            )
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </Grid.Col>
                </Grid>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type SearchProps = {
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
}

function Search({ isSearchOpen, setIsSearchOpen }: SearchProps) {
  return (
    <div
      className={`z-10 fixed top-0 left-0 w-full bg-neutral-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSearchOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-neutral-200">
          <h1 className="text-2xl font-bold">Αναζήτηση</h1>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex justify-center items-center h-10 w-10 rounded-md border border-neutral-200 bg-white transition-colors hover:cursor-pointer group"
          >
            <AiOutlineClose className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
          </button>
        </div>
        <InstantSearch
          indexName="product"
          searchClient={typesenseClient.searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <SearchBox
            classNames={{
              root: 'w-full',
              form: 'w-full',
              input: 'w-full px-4 py-2 border border-neutral-300 rounded-lg',
              submit: 'hidden',
            }}
          />
          <Hits hitComponent={SearchHit} />
        </InstantSearch>
      </div>
    </div>
  )
}

function SearchHit({ hit }: { hit: Document }) {
  return (
    <div className="p-2 mb-2 border border-gray-300 rounded-lg">
      <Link href={`${ROUTE_PRODUCT}/${hit.type}?version=${hit.version}`}>
        <div className="flex gap-2">
          <Image
            component={NextImage}
            src={`http://minio:9000/product/${hit.type}/${hit.version}/${hit.images[0]}`}
            alt={hit.version}
            width={100}
            height={100}
          />
          <div className="w-full">
            <div className="flex justify-between text-2xl">
              <h2>{hit.type}</h2>
              <h2 className="font-bold">{hit.version}</h2>
              <h2 className="text-gray-700">{hit.brand}</h2>
            </div>
            <div className="flex gap-4 items-center text-xl">
              <h2>Τιμή: </h2>
              <h2 className="text-red-500">{hit.price}€</h2>
              <h2 className="text-gray-500 line-through">
                {hit.price_before > 0 ? `${hit.price_before}€` : ''}
              </h2>
            </div>
            <div className="flex gap-4 items-center text-xl">
              <h2>Χρώμα: </h2>
              <h2>{hit.color}</h2>
            </div>
            <div className="flex gap-4 items-center text-xl">
              <h2>Μεγέθοι: </h2>
              {hit.sizes.map(size => (
                <h2 key={`${hit.id}-${size}`}>{size}</h2>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
