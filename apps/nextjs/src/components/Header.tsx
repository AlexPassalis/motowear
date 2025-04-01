'use client'

import { ROUTE_HOME } from '@/data/routes'
import { Image } from '@mantine/core'
import NextImage from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import {
  AiOutlineMenu,
  AiOutlineShopping,
  AiFillShopping,
} from 'react-icons/ai'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { LocalStorageCartItem } from '@/utils/localStorage'

type HeaderProps = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  cart: LocalStorageCartItem[]
}

export function Header({
  isMenuOpen,
  setIsMenuOpen,
  isSearchOpen,
  setIsSearchOpen,
  isCartOpen,
  setIsCartOpen,
  cart,
}: HeaderProps) {
  return (
    <header className="relative flex justify-between items-center w-full p-2">
      <div className="flex justify-start">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-gray-200 transition-colors hover:cursor-pointer group"
        >
          <AiOutlineMenu className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>
      </div>

      <div className="flex justify-center">
        <Link href={ROUTE_HOME}>
          <Image
            component={NextImage}
            src="/motowear.png"
            width={200}
            height={100}
            alt="Motowear logo"
            className="sm:scale-110"
          />
        </Link>
      </div>

      <div className="flex justify-end gap-1 sm:gap-3">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-gray-200 transition-colors hover:cursor-pointer group"
        >
          <HiMagnifyingGlass className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
        </button>

        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative flex justify-center items-center h-10 w-10 sm:scale-110 rounded-md border border-gray-200 transition-colors hover:cursor-pointer group"
        >
          {cart.length < 1 ? (
            <>
              <AiOutlineShopping className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
            </>
          ) : (
            <>
              <div className="absolute bottom-0 right-0 flex items-center justify-center w-4 h-4 sm:scale-110 rounded-full bg-red-500 text-white text-xs transform translate-x-1/2 translate-y-1/2">
                <span className="relative top-0.25">{cart.length}</span>
              </div>
              <AiFillShopping className="transition-transform duration-200 ease-in-out group-hover:scale-150" />
            </>
          )}
        </button>
      </div>
    </header>
  )
}
