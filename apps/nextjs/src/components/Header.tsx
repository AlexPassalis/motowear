'use client'

import type { typeCartLocalStorage } from '@/lib/postgres/data/type'

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
import { Indicator } from '@mantine/core'
import { usePathname } from 'next/navigation'

type HeaderProps = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  isCartOpen: boolean
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
  cart: typeCartLocalStorage
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
  const pathname = usePathname()

  return (
    <header className="relative flex justify-between items-center w-full p-2">
      <div className="flex justify-start">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex justify-center items-center h-10 w-10 xl:scale-110 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
        >
          <AiOutlineMenu className="transition-transform duration-200 ease-in-out group-hover:scale-110" />
        </button>
      </div>

      <div className="flex justify-center">
        <Link
          href={ROUTE_HOME}
          onClick={(e) => {
            if (pathname === ROUTE_HOME) {
              e.preventDefault()
            }
          }}
        >
          <Image
            component={NextImage}
            src="/motowear.png"
            width={200}
            height={50}
            alt="motowear.gr"
            className="xl:scale-110"
          />
        </Link>
      </div>

      <div className="flex justify-end gap-2 xl:gap-4">
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="flex justify-center items-center h-10 w-10 xl:scale-110 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
        >
          <HiMagnifyingGlass className="transition-transform duration-200 ease-in-out group-hover:scale-110" />
        </button>

        {cart.length > 0 ? (
          <Indicator
            radius="xl"
            position="bottom-start"
            color="red"
            inline
            label={cart.length}
            size={15}
            zIndex={10}
          >
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative flex justify-center items-center h-10 w-10 xl:scale-110 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
            >
              <AiFillShopping className="transition-transform duration-200 ease-in-out group-hover:scale-110" />
            </button>
          </Indicator>
        ) : (
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative flex justify-center items-center h-10 w-10 xl:scale-110 rounded-md border border-[var(--mantine-border)] transition-colors hover:cursor-pointer group"
          >
            <AiOutlineShopping className="transition-transform duration-200 ease-in-out group-hover:scale-110" />
          </button>
        )}
      </div>
    </header>
  )
}
