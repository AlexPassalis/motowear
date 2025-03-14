import { Product, ProductTables, ProductRow } from '@/data/types'
import { postgres } from '@/lib/postgres'

async function getProductTables() {
  const { rows: productTables }: { rows: ProductTables } =
    await postgres.execute(
      `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'product';
        `
    )
  return productTables
}

export async function getProductTypes() {
  const productTables = await getProductTables()
  return productTables.map(productTable => productTable.table_name)
}

export async function getProductPostgres() {
  const productTables = await getProductTables()

  const product: Product = {}
  if (productTables.length !== 0) {
    await Promise.all(
      productTables.map(async obj => {
        const { rows: tableRows }: { rows: ProductRow[] } =
          await postgres.execute(`SELECT * FROM product."${obj.table_name}"`)
        product[obj.table_name] = tableRows
      })
    )
  }

  return product
}
