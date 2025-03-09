import type { NextApiRequest, NextApiResponse } from 'next'
import { ProductVersion, Product } from '@/data/types'
import formidable, { Fields, Files } from 'formidable'
import pLimit from 'p-limit'
import { responseSuccessful } from '@/data/zod/expected'
import { errorFormidable } from '@/data/zod/error'
import { uploadFile } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { getProductPostgres } from '@/utils/getProductPostgres'
import { v4 as uid } from 'uuid'
import { sql } from 'drizzle-orm'

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
    const productPostgres = await getProductPostgres()

    const detailedDiff = getDetailedDiff(productPostgres, productNew)
    console.dir(detailedDiff, { depth: null })
    createRows(detailedDiff)
    return res.status(200).json({ message: responseSuccessful })
  } catch (e) {
    return res.status(500).json({ message: errorFormidable })
  }
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

function sanitizeFilename(name: string): string {
  return name
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w.-]/g, '') // Remove special characters (keep letters, numbers, _, ., -)
}

type UpdatedRowDiff = {
  id: string
  oldVersion: string
  newVersion: string
  newImages: string[]
  removedImages: string[]
}

type TableDiff = {
  table: string
  createRow: ProductVersion[]
  removeRow: ProductVersion[]
  updateRow: UpdatedRowDiff[]
}

export function getDetailedDiff(
  productOld: Product,
  productNew: Product
): TableDiff[] {
  // Convert productOld -> { table: { id: ProductRow } } for quick lookups
  const oldLookup: Record<string, Record<string, ProductVersion>> = {}
  for (const tableObj of productOld) {
    const table = Object.keys(tableObj)[0]
    oldLookup[table] = {}
    for (const row of tableObj[table]) {
      oldLookup[table][row.id] = row
    }
  }

  // Convert productNew -> { table: { id: ProductRow } }
  const newLookup: Record<string, Record<string, ProductVersion>> = {}
  for (const tableObj of productNew) {
    const table = Object.keys(tableObj)[0]
    newLookup[table] = {}
    for (const row of tableObj[table]) {
      newLookup[table][row.id] = {
        ...row,
        images: row.images.map(sanitizeFilename),
      }
    }
  }

  // Collect a unified list of all table names from both old and new
  const allTables = new Set<string>([
    ...Object.keys(oldLookup),
    ...Object.keys(newLookup),
  ])

  const result: TableDiff[] = []

  for (const table of allTables) {
    const oldRowsMap = oldLookup[table] || {}
    const newRowsMap = newLookup[table] || {}

    // We'll build arrays for newRows, removedRows, updatedRows
    const createRow: ProductVersion[] = []
    const removeRow: ProductVersion[] = []
    const updateRow: UpdatedRowDiff[] = []

    // 1) Identify new or updated rows
    for (const [id, newRow] of Object.entries(newRowsMap)) {
      const oldRow = oldRowsMap[id]
      if (!oldRow) {
        // This row didn't exist in old => brand new row
        createRow.push(newRow)
      } else {
        // Potentially an updated row => compare version, images
        const versionChanged = oldRow.version !== newRow.version
        // Compare images to figure out which are new or removed
        const oldImages = new Set(oldRow.images)
        const newImages = new Set(newRow.images)

        const addedImages: string[] = []
        const removedImages: string[] = []

        // Find newly added images
        for (const img of newImages) {
          if (!oldImages.has(img)) {
            addedImages.push(img)
          }
        }
        // Find removed images
        for (const img of oldImages) {
          if (!newImages.has(img)) {
            removedImages.push(img)
          }
        }

        if (
          versionChanged ||
          addedImages.length > 0 ||
          removedImages.length > 0
        ) {
          // This row is updated in some way
          updateRow.push({
            id,
            oldVersion: oldRow.version,
            newVersion: newRow.version,
            newImages: addedImages,
            removedImages: removedImages,
          })
        }
      }
    }

    // 2) Identify removed rows (in old but not in new)
    for (const [id, oldRow] of Object.entries(oldRowsMap)) {
      if (!newRowsMap[id]) {
        removeRow.push(oldRow)
      }
    }

    // If there's at least one change in this table, push a result
    if (createRow.length > 0 || removeRow.length > 0 || updateRow.length > 0) {
      result.push({
        table,
        createRow,
        removeRow,
        updateRow,
      })
    }
  }

  return result
}

function toPostgresTextArray(arr: string[]): string {
  return `{${arr.map(val => val.replace(/"/g, '\\"')).join(',')}}`
}

async function createRows(detailedDiff: any[]) {
  for (const productTable of detailedDiff) {
    const tableName = productTable.table
    const insertPromises = productTable.createRow.map(async (newRow: any) => {
      const imagesLiteral = toPostgresTextArray(newRow.images)
      await postgres.execute(sql`
        INSERT INTO product."${sql.raw(tableName)}" (id, version, images)
        VALUES (${uid()}, ${newRow.version}, ${imagesLiteral}::text[]);
      `)
    })
    await Promise.all(insertPromises)
  }
}
