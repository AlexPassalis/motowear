import { errorPostgres } from '@/data/error'
import {
  Product,
  ProductTables,
  ProductRow,
  BrandRow,
  ImageType,
} from '@/data/types'
import { getFileNames } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { sendTelegramMessage } from '@/lib/telegram'
import { formatMessage } from '@/utils/formatMessage'
import { v4 as id } from 'uuid'

async function getProductTables() {
  let productTables: ProductTables
  try {
    const { rows }: { rows: ProductTables } = await postgres.execute(
      `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'product';
        `
    )
    productTables = rows
  } catch (e) {
    const message = formatMessage(
      id(),
      '@/utils/getPostgres.ts getProductTables()',
      errorPostgres,
      e
    )
    console.error(message)
    sendTelegramMessage('ERROR', message)
    throw errorPostgres
  }
  return productTables
}

export async function getProductTypes() {
  const productTables =
    process.env.BUILD_TIME !== 'true' ? await getProductTables() : []
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
          let brandRows: BrandRow[]
          try {
            const { rows }: { rows: BrandRow[] } = await postgres.execute(
              `SELECT * FROM product."${obj.table_name}"`
            )
            brandRows = rows
          } catch (e) {
            const message = formatMessage(
              id(),
              '@/utils/getPostgres.ts getProductPostgres()',
              errorPostgres,
              e
            )
            console.error(message)
            sendTelegramMessage('ERROR', message)
            throw errorPostgres
          }
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
