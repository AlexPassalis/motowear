import { Menu } from '@/components/Menu'
import { Search } from '@/components/Search'
import { Cart } from '@/components/Cart'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  getLocalStorageCart,
  LocalStorageCartItem,
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

type HeaderContext = {
  setCart: Dispatch<SetStateAction<LocalStorageCartItem[]>>
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  setIsCartOpen: Dispatch<SetStateAction<boolean>>
}

export const HeaderContext = createContext<HeaderContext | null>(null)

type HeaderProviderProps = { productTypes: string[]; children: ReactNode }

export default function HeaderProvider({
  productTypes,
  children,
}: HeaderProviderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [cart, setCart] = useState<LocalStorageCartItem[]>([])
  useEffect(() => {
    setCart(getLocalStorageCart())
  }, [])
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
        productTypes={productTypes}
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
