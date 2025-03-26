import {
  Product,
  ProductTables,
  ProductRow,
  BrandRow,
  ImageType,
} from '@/data/types'
import { getFileNames } from '@/lib/minio'
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

  const image: ImageType = {}
  const brand: string[] = []
  const product: Product = {}

  if (productTables.length !== 0) {
    await Promise.all(
      productTables.map(async obj => {
        if (obj.table_name === 'brand') {
          const { rows: brandRows }: { rows: BrandRow[] } =
            await postgres.execute(`SELECT * FROM product."${obj.table_name}"`)
          const sortedBrandImages = brandRows
            .sort((a, b) => a.index - b.index)
            .map(row => row.image)
          brand.push(...sortedBrandImages)
        } else {
          const [fileNames, { rows: tableRows }] = await Promise.all([
            getFileNames(obj.table_name),
            postgres.execute(
              `SELECT * FROM product."${obj.table_name}"`
            ) as Promise<{ rows: ProductRow[] }>,
          ])
          image[obj.table_name] = fileNames
          product[obj.table_name] = tableRows
        }
      })
    )
  }

  return { image, brand, product }
}
