import type {
  typeCartLocalStorage,
  typeCoupon,
  typeVariant,
} from '@/lib/postgres/data/type'

function getLocalStorageCart(): typeCartLocalStorage {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function getFilteredLocalStorageCart(all_variants: typeVariant[]) {
  return getLocalStorageCart().filter(localStorageVariant => {
    const currentVariant = all_variants.find(
      postgresVariant =>
        postgresVariant.product_type === localStorageVariant.product_type &&
        postgresVariant.images[0] === localStorageVariant.image &&
        postgresVariant.price === localStorageVariant.price &&
        postgresVariant.size === localStorageVariant.size &&
        postgresVariant.color === localStorageVariant.color &&
        postgresVariant.price_before === localStorageVariant.price_before
    )
    if (!currentVariant) {
      return false
    } else {
      return true
    }
  })
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
