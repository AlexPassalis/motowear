import { typeCart } from '@/lib/postgres/data/type'

export function formatMessage(
  location: string,
  message: string,
  error?: unknown
) {
  return `Location: ${location}\nMessage: ${message}${
    error
      ? `\n${String(error).replace(/([_*[\]()~\`>#+\-=|{}.!])/g, '\\$1')}.`
      : '.'
  }`
}

export function formatOrderMessage(id: string, total: number, cart: typeCart) {
  const cartItems = cart
    .map(
      item =>
        `• *${item.product_type} ${item.name}${
          item.color ? ` ${item.color}` : ''
        }${item.size ? ` ${item.size}` : ''}*\n ${item.quantity} × ${
          item.price
        } = ${item.quantity * item.price}€`
    )
    .join('\n')
  return `*Id:* ${id}
*Total:* ${total.toFixed(2)}€
${cartItems}`
}
