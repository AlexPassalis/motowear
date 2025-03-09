export type ProductVersion = { id: string; version: string; images: string[] }
export type Product = Array<{ [table: string]: ProductVersion[] }>
export type ProductTable = { table_name: string }[]
