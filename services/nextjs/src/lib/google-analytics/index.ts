import type { typeOrder } from '@/lib/postgres/data/type'

import { envClient } from '@/envClient'
import { sendGAEvent } from '@next/third-parties/google'

const isProduction = envClient.HOST !== 'localhost'

export function googleAnalyticsPageView(pathname: string) {
  if (!isProduction) {
    return
  }
  sendGAEvent('event', 'page_view', {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function googleAnalyticsSearch(query: string) {
  if (!isProduction) {
    return
  }
  sendGAEvent('event', 'view_search_results', { search_term: query })
}

export function googleAnalyticsViewItem(
  product_type: string,
  variant: string,
  price: number,
) {
  if (!isProduction) {
    return
  }
  sendGAEvent('event', 'view_item', {
    currency: 'EUR',
    value: price,
    items: [
      {
        item_id: `${product_type}:${variant}`,
        item_name: variant,
        item_category: product_type,
        price,
        quantity: 1,
      },
    ],
  })
}

export function googleAnalyticsAddToCart(
  price: number,
  count: number,
  collection: string,
  product: string,
  color?: string,
  size?: string,
) {
  if (!isProduction) {
    return
  }
  const value = price * count
  sendGAEvent('event', 'add_to_cart', {
    currency: 'EUR',
    value,
    items: [
      {
        item_id: `${collection}:${product}`,
        item_name: product,
        item_category: collection,
        item_variant:
          [color, size].filter(Boolean).join(' ').trim() || undefined,
        price,
        quantity: count,
        ...(color ? { item_color: color } : {}),
        ...(size ? { item_size: size } : {}),
      },
    ],
  })
}

export function googleAnalyticsBeginCheckout(
  total: typeOrder['total'],
  cart: typeOrder['cart'],
) {
  if (!isProduction) {
    return
  }
  sendGAEvent('event', 'begin_checkout', {
    currency: 'EUR',
    value: total,
    items: cart.map((item) => ({
      item_id: `${item.product_type}:${item.name}`,
      item_name: item.name,
      item_category: item.product_type,
      item_variant:
        [item.color, item.size].filter(Boolean).join(' ').trim() || undefined,
      price: item.price,
      quantity: item.quantity,
      ...(item.color ? { item_color: item.color } : {}),
      ...(item.size ? { item_size: item.size } : {}),
    })),
  })
}

export function googleAnalyticsPurchase(
  orderId: typeOrder['id'],
  total: typeOrder['total'],
  cart: typeOrder['cart'],
) {
  if (!isProduction) {
    return
  }
  sendGAEvent('event', 'purchase', {
    transaction_id: orderId,
    currency: 'EUR',
    value: total,
    items: cart.map((item) => ({
      item_id: `${item.product_type}:${item.name}`,
      item_name: item.name,
      item_category: item.product_type,
      item_variant:
        [item.color, item.size].filter(Boolean).join(' ').trim() || undefined,
      price: item.price,
      quantity: item.quantity,
      ...(item.color ? { item_color: item.color } : {}),
      ...(item.size ? { item_size: item.size } : {}),
    })),
  })
}
