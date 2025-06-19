import type {
  typeCartLocalStorage,
  typeCoupon,
} from '@/lib/postgres/data/type'

export function getLocalStorageCart(): typeCartLocalStorage {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function setLocalStorageCart(cart: typeCartLocalStorage) {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export function getLocalStorageCoupon(): null | typeCoupon {
  const coupon = localStorage.getItem('coupon')
  return coupon ? JSON.parse(coupon) : null
}

export function setLocalStorageCoupon(coupon: null | typeCoupon) {
  localStorage.setItem('coupon', JSON.stringify(coupon))
}
