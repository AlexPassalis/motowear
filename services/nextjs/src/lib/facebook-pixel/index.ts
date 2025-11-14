import type { typeOrder } from '@/lib/postgres/data/type'

import { envClient } from '@/envClient'
import { envServer } from '@/envServer'

const options = {
  autoConfig: false,
  debug: false,
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

const isProduction = envServer.NODE_ENV === 'production'

export async function facebookPixelPageView() {
  if (!isProduction) {
    return
  }
  const ReactPixel = await getReactPixel()
  ReactPixel.pageView()
}

export async function facebookPixelSearch(query: string) {
  if (!isProduction) {
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
  if (!isProduction) {
    return
  }
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
  price: number,
  count: number,
  product_type: string,
  variant: string,
  color: string,
  size: string,
) {
  if (!isProduction) {
    return
  }
  const ReactPixel = await getReactPixel()
  ReactPixel.track('AddToCart', {
    value: (price * count).toFixed(2),
    currency: 'EUR',
    content_type: 'product',
    contents: [
      {
        id: `${product_type}:${variant}`,
        item_price: price,
        quantity: count,
        ...(color ? { color: color } : {}),
        ...(size ? { size: size } : {}),
      },
    ],
  })
}

export async function facebookPixelInitiateCheckout(
  total: typeOrder['total'],
  cart: typeOrder['cart'],
) {
  if (!isProduction) {
    return
  }
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
  if (!isProduction) {
    return
  }
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
