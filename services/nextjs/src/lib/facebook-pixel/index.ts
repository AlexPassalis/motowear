import type { productPageState } from '@/app/(user)/product/[[...params]]/client'
import type { typeOrder } from '@/lib/postgres/data/type'

import { envClient } from '@/env'

const options = {
  autoConfig: true,
  debug: true, // NEEDS FIXING remove later if everything works as expected. It logs in production as well now.
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pixelPromise: Promise<any> | null = null
function getReactPixel() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (!pixelPromise) {
    pixelPromise = import('react-facebook-pixel').then((mod) => {
      const ReactPixel = mod.default
      ReactPixel.init(envClient.FACEBOOK_PIXEL_ID, undefined, options)
      return ReactPixel
    })
  }

  return pixelPromise
}

export async function facebookPixelPageView() {
  const ReactPixel = await getReactPixel()
  ReactPixel.pageView()
}

export async function facebookPixelSearch(query: string) {
  if (!query) {
    return
  }

  const ReactPixel = await getReactPixel()
  ReactPixel.track('Search', {
    content_type: 'product',
    search_string: query,
  })
}

export async function facebookPixelViewContent(
  product_type: string,
  variant: string,
  price: number,
) {
  const ReactPixel = await getReactPixel()
  ReactPixel.track('ViewContent', {
    value: price.toFixed(2),
    currency: 'EUR',
    content_type: 'product',
    contents: [
      {
        id: `${product_type}:${variant}`,
        item_price: price,
        quantity: 1,
      },
    ],
  })
}

export async function facebookPixelAddToCart(
  paramsProduct_type: string,
  state: productPageState,
  count: number,
) {
  const ReactPixel = await getReactPixel()
  ReactPixel.track('AddToCart', {
    value: (state.price * count).toFixed(2),
    currency: 'EUR',
    content_type: 'product',
    contents: [
      {
        id: `${paramsProduct_type}:${state.selectedVariant}`,
        item_price: state.price,
        quantity: count,
        ...(state.selectedColor ? { color: state.selectedColor } : {}),
        ...(state.selectedSize ? { size: state.selectedSize } : {}),
      },
    ],
  })
}

export async function facebookPixelInitiateCheckout(
  total: typeOrder['total'],
  cart: typeOrder['cart'],
) {
  const ReactPixel = await getReactPixel()
  ReactPixel.track('InitiateCheckout', {
    value: total.toFixed(2),
    currency: 'EUR',
    content_type: 'product',
    contents: cart.map((item) => ({
      id: `${item.product_type}:${item.name}`,
      item_price: item.price,
      quantity: item.quantity,
      ...(item.color ? { color: item.color } : {}),
      ...(item.size ? { size: item.size } : {}),
    })),
  })
}

export async function facebookPixelPurchase(
  total: typeOrder['total'],
  cart: typeOrder['cart'],
) {
  const ReactPixel = await getReactPixel()
  ReactPixel.track('Purchase', {
    value: total.toFixed(2),
    currency: 'EUR',
    content_type: 'product',
    contents: cart.map((item) => ({
      id: `${item.product_type}:${item.name}`,
      item_price: item.price,
      quantity: item.quantity,
      ...(item.color ? { color: item.color } : {}),
      ...(item.size ? { size: item.size } : {}),
    })),
  })
}
