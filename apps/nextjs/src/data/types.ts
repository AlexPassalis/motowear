export type ProductTables = { table_name: string }[]

export type ImageType = { [key: string]: string[] }

export type BrandRow = { index: number; image: string }

export type ProductRow = {
  id: string
  version: string
  description: string
  images: string[]
  price: number
  brand: string // optional
  color: string // optional
  size: string // optional
  price_before: number // optional
}

export type Product = { [key: string]: ProductRow[] }

