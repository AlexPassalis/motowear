export function getLocalStorageCart(): {
  type: string
  version: string
  color: string
  size: string
  price: number
  price_before: number
  quantity: number
}[] {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export type LocalStorageCart = ReturnType<typeof getLocalStorageCart>

export function setLocalStorageCart(cart: LocalStorageCart) {
  localStorage.setItem('cart', JSON.stringify(cart))
}
