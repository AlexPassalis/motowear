import { postgres } from '@/lib/postgres/index'
import { AdminProductClientPage } from '@/app/admin/product/client'

export type ProductRow = { id: string; version: string; images: string[] }
export type Product = Array<{ [table: string]: ProductRow[] }>

export default async function AdminProductPage() {
  const { rows: productTables } = await postgres.execute(
    `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'product';
    `
  )

  let product: Product = []
  if (productTables.length !== 0) {
    const productTableNames = (
      productTables as Array<{ table_name: string }>
    ).map(table => table.table_name)

    await Promise.all(
      productTableNames.map(async table => {
        const { rows: tableRows } = (await postgres.execute(
          `SELECT * FROM product."${table}"`
        )) as { rows: ProductRow[] }
        product.push({ [table]: tableRows })
      })
    )
  }

  return <AdminProductClientPage product={product} />
}
