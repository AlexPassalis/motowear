import type { LocalStorageCartItem } from '@/data/type'
import type { Variants } from '@/data/type'

function getLocalStorageCart(): LocalStorageCartItem[] {
  const cart = localStorage.getItem('cart')
  return cart ? JSON.parse(cart) : []
}

export function setLocalStorageCart(cart: LocalStorageCartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart))
}

export function getFilteredLocalStorageCart(all_variants: Variants) {
  console.log('These are the all_variants :', all_variants)
  return getLocalStorageCart().filter(localStorageVariant => {
    const currentVariant = all_variants.find(
      postgresVariant =>
        postgresVariant.product_type === localStorageVariant.procuct_type &&
        postgresVariant.name === localStorageVariant.name &&
        postgresVariant.images[0] === localStorageVariant.image &&
        postgresVariant.price === localStorageVariant.price &&
        postgresVariant.size === localStorageVariant.size &&
        postgresVariant.color === localStorageVariant.color &&
        postgresVariant.price_before === localStorageVariant.price_before
    )
    console.log('This is the currentVariant :', currentVariant)
    if (!currentVariant) {
      return false
    } else {
      return true
    }
  })
}
