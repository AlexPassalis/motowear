export type LocalStorageCartItem = {
  type: string
  version: string
  color: string
  image: string
  size: string
  price: number
  price_before: number
  quantity: number
}

export function getLocalStorageCart(): LocalStorageCartItem[] {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function setLocalStorageCart(cart: LocalStorageCartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart))
}
