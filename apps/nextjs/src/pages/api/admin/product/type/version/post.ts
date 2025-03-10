import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Fields, Files } from 'formidable'
import pLimit from 'p-limit'
import { errorBodyInvalid, errorFormidable } from '@/data/zod/error'
import { uploadFile } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { getProductPostgres } from '@/utils/getProductPostgres'
import { v4 as uid } from 'uuid'
import { sql } from 'drizzle-orm'
import { typeProduct } from '@/data/zod/type'
import { Product, ProductRow } from '@/data/types'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100 MB
    })

    const { fields, files } = await new Promise<{
      fields: Fields
      files: Files
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const imageNew = files.imageNew
    const productNew = JSON.parse(fields.productNew)
    const { data: validatedProductNew } = typeProduct.safeParse(productNew)
    if (!validatedProductNew) {
      return res.status(400).json({ message: errorBodyInvalid })
    }

    const productPostgres = await getProductPostgres()

    const { newRows, updatedRows } = getProductDiff(productPostgres, productNew)
    createRows(newRows)
    return res.status(200).json({})
  } catch (e) {
    console.error(errorFormidable, e)
    return res.status(500).json({ message: errorFormidable })
  }
}

function getProductDiff(productPostgres: Product, productNew: Product) {
  const newRows: Product = {}
  const updatedRows: Product = {}

  for (const type in productNew) {
    const oldArray = productPostgres[type] || []
    const newArray = productNew[type] || []

    const oldLookup = new Map<string, ProductRow>()
    for (const row of oldArray) {
      oldLookup.set(row.id, row)
    }

    for (const newRow of newArray) {
      const oldRow = oldLookup.get(newRow.id)
      if (!oldRow) {
        if (!newRows[type]) newRows[type] = []
        newRows[type].push(newRow)
      } else {
        const versionChanged = oldRow.version !== newRow.version
        const colorChanges = oldRow.color !== newRow.color
        const imagesChanged =
          JSON.stringify(oldRow.images) !== JSON.stringify(newRow.images)
        if (versionChanged || colorChanges || imagesChanged) {
          if (!updatedRows[type]) updatedRows[type] = []
          updatedRows[type].push(newRow)
        }
      }
    }
  }

  return { newRows, updatedRows }
}

// const tasks: Array<() => Promise<string>> = []
// for (const table of productNew) {
//   const type = Object.keys(table)[0]
//   const rows = table[type]

//   for (const row of rows) {
//     const { version, images } = row
//     for (const imageName of images) {
//       const fileObj = imageNew.find(
//         file => file.originalFilename === imageName
//       )
//       if (fileObj) {
//         const objectName = `${type}/${version}/${sanitizeFilename(
//           imageName
//         )}`
//         tasks.push(() => uploadFile(fileObj, objectName))
//       }
//     }
//   }
// }

// const limit = pLimit(5) // Upload a max of 5 files concurrently at a time.
// await Promise.all(tasks.map(task => limit(task)))

async function createRows(newRows: Product) {
  await Promise.all(
    Object.entries(newRows).map(async ([key, value]) => {
      const tableName = key
      const insertPromises = value.map((newRow: ProductRow) => {
        return async () => {
          const imagesLiteral = toPostgresTextArray(newRow.images)
          await postgres.execute(sql`
            INSERT INTO product."${sql.raw(
              tableName
            )}" (id, version, color, images)
            VALUES (${uid()}, ${newRow.version}, ${
            newRow.color
          }, ${imagesLiteral}::text[]);
          `)
        }
      })
      const limit = pLimit(10)
      await Promise.all(insertPromises.map(task => limit(task)))
    })
  )
}

function toPostgresTextArray(arr: string[]): string {
  return `{${arr.map(val => val.replace(/"/g, '\\"')).join(',')}}`
}
