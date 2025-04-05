import { Menu } from '@/components/Menu'
import { Search } from '@/components/Search'
import { Cart } from '@/components/Cart'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  getFilteredLocalStorageCart,
  setLocalStorageCart,
} from '@/utils/localStorage'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { LocalStorageCartItem } from '@/data/type'
import type { Variants } from '@/data/type'

type HeaderContext = {
  setCart: Dispatch<SetStateAction<LocalStorageCartItem[]>>
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
}

export const HeaderContext = createContext<HeaderContext | null>(null)

type HeaderProviderProps = {
  product_types: string[]
  all_variants: Variants
  children: ReactNode
}

export default function HeaderProvider({
  product_types,
  all_variants,
  children,
}: HeaderProviderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  useEffect(() => {
    setCart(getFilteredLocalStorageCart(all_variants))
  }, [all_variants])
  useEffect(() => {
    setLocalStorageCart(cart)
  }, [cart])

  return (
    <HeaderContext.Provider
      value={{
        setCart,
        setIsSearchOpen,
        setIsCartOpen,
      }}
    >
      <Menu
        product_types={product_types}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <Search isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      <Cart
        cart={cart}
        setCart={setCart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />
      <div
        onClick={() => {
          if (isMenuOpen) setIsMenuOpen(false)
          if (isSearchOpen) setIsSearchOpen(false)
          if (isCartOpen) setIsCartOpen(false)
        }}
        className="z-10 w-full h-full"
      >
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cart={cart}
        />
        {children}
        <Footer />
      </div>
    </HeaderContext.Provider>
  )
}
