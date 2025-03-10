import { Product, ProductTables, ProductRow } from '@/data/types'
import { postgres } from '@/lib/postgres'

export async function getProductPostgres() {
  const { rows: productTable }: { rows: ProductTables } =
    await postgres.execute(
      `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'product';
        `
    )

  const product: Product = {}
  if (productTable.length !== 0) {
    await Promise.all(
      productTable.map(async obj => {
        const { rows: tableRows }: { rows: ProductRow[] } =
          await postgres.execute(`SELECT * FROM product."${obj.table_name}"`)
        product[obj.table_name] = tableRows
      })
    )
  }

  return product
}
