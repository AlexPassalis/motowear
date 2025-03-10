export type ProductTables = { table_name: string }[]
export type ProductRow = {
  id: string
  version: string
  color: string
  images: string[]
}
export type Product = { [key: string]: ProductRow[] }
