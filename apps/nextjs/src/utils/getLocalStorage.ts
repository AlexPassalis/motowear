export function getLocalStorage() {
  return localStorage.getItem('cart') || []
}
