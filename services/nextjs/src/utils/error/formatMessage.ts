import { typeCart } from '@/lib/postgres/data/type'

function escHtml(str: string) {
  return str.replace(
    /[&<>"']/g,
    (s) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        s
      ]!),
  )
}

export function formatMessage(location: string, err: unknown | string) {
  let error: string
  if (typeof err === 'string') {
    error = err
  } else {
    error = String(err)
  }

  return [
    `<b>Location:</b> ${escHtml(location)}`,
    `<pre>${escHtml(error)}</pre>`,
  ].join('\n')
}

export function formatOrderMessage(id: number, total: number, cart: typeCart) {
  const cartLines = cart
    .map(
      (i) =>
        `• <b>${escHtml(i.collection)} ${escHtml(i.name)}${
          i.color ? ` ${escHtml(i.color)}` : ''
        }${i.size ? ` ${escHtml(i.size)}` : ''}</b>\n` +
        `  ${i.quantity} × ${i.price} = ${(i.quantity * i.price).toFixed(2)}€`,
    )
    .join('\n')

  return [
    `<b>Id:</b> ${id}`,
    `<b>Total:</b> ${total.toFixed(2)}€`,
    cartLines,
  ].join('\n')
}

export function formatReviewMessage(
  productType: string,
  rating: number,
  fullName: string,
  reviewText: string,
) {
  return [
    `<b>Product Type:</b> ${escHtml(productType)}`,
    `<b>Rating:</b> ${rating}`,
    `<b>Name:</b> ${escHtml(fullName)}`,
    `<b>Review:</b> ${escHtml(reviewText)}`,
  ].join('\n')
}
