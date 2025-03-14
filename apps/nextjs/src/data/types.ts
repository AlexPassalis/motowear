export type ProductTables = { table_name: string }[]
export type ProductRow = {
  id: string
  version: string
  description: string
  images: string[]
  price: number
  brand: null | string
  color: null | string
  sizes: string[]
  price_before: null | number
}
export type Product = { [key: string]: ProductRow[] }
