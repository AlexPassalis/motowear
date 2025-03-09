import { ProductTable, ProductVersion } from '@/data/types'
import { postgres } from '@/lib/postgres'

export async function getProductPostgres() {
  const { rows: productTable }: { rows: ProductTable } = await postgres.execute(
    `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'product';
        `
  )

  const product =
    productTable.length === 0
      ? []
      : await Promise.all(
          productTable.map(async obj => {
            const { rows: tableRows }: { rows: ProductVersion[] } =
              await postgres.execute(
                `SELECT * FROM product."${obj.table_name}"`
              )
            return { [obj.table_name]: tableRows }
          })
        )

  return product
}
