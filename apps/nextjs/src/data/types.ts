export type ProductTables = { table_name: string }[]
export type ProductRow = {
  id: string
  version: string
  description: string
  images: string[]
  price: number
  brand: string
  color: string
  sizes: string[]
  price_before: number
}
export type Product = { [key: string]: ProductRow[] }
