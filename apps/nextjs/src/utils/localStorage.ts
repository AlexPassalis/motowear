export type LocalStorageCartItem = {
  type: string
  version: string
  image: string
  price: number
  quantity: number
  color?: string
  size?: string
  price_before?: number
}

export function getLocalStorageCart(): LocalStorageCartItem[] {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function setLocalStorageCart(cart: LocalStorageCartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart))
}
