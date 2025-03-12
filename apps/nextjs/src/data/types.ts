export type ProductTables = { table_name: string }[]
export type ProductRow = {
  id: string
  brand: null | string
  version: string
  description: string
  color: null | string
  images: string[]
  sizes: null | string[]
  price: number
  price_before: null | number
}
export type Product = { [key: string]: ProductRow[] }
