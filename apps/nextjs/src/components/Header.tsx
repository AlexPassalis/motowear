'use client'

import { ROUTE_HOME, ROUTE_PRODUCT } from '@/data/routes'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  AiOutlineMenu,
  AiOutlineShopping,
  AiOutlineClose,
} from 'react-icons/ai'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch'
import { typesenseClient } from '@/lib/typesense/client'
import { ProductRow } from '@/data/types'

type HeaderProps = {
  productTypes: string[]
}

export function Header({ productTypes }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <Main
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
      <Menu
        productTypes={productTypes}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
    </>
  )
}

interface MainProps {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
}

function Main({
  isMenuOpen,
  setIsMenuOpen,
  isCartOpen,
  setIsCartOpen,
  isSearchOpen,
  setIsSearchOpen,
}: MainProps) {
  return (
    <header className="relative flex justify-between items-center w-full p-4 border-b border-neutral-300">
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
          <AiOutlineShopping className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>
      </div>
    </header>
  )
}

interface MenuProps {
  productTypes: string[]
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}

function Menu({ productTypes, isMenuOpen, setIsMenuOpen }: MenuProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-neutral-50 w-80 shadow-lg transform transition-transform duration-300 ease-in-out ${
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
        {productTypes.map(productType => (
          <Link key={productType} href={`${ROUTE_PRODUCT}/${productType}`}>
            {productType}
          </Link>
        ))}
      </div>
    </div>
  )
}

interface CartProps {
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
}

function Cart({ isCartOpen, setIsCartOpen }: CartProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-neutral-50 w-80 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center w-full border-b-2 pb-2 border-neutral-200">
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
      </div>
    </div>
  )
}

interface SearchProps {
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
}

function Search({ isSearchOpen, setIsSearchOpen }: SearchProps) {
  return (
    <div
      className={`fixed top-0 left-0 w-full bg-neutral-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
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

function SearchHit({ hit }: { hit: ProductRow }) {
  console.log(hit)
  return (
    <div className="border border-gray-300 rounded p-2 mb-2">
      <h2 className="text-lg font-bold">{hit.version}</h2>
      <p className="text-sm text-gray-700">Type: {hit.brand}</p>
      <p className="text-sm text-gray-500">Price: {hit.price}</p>
    </div>
  )
}
