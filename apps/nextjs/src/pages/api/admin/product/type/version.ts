import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Fields, Files } from 'formidable'
import pLimit from 'p-limit'
import { responseSuccessful } from '@/data/zod/expected'
import { errorFormidable } from '@/data/zod/error'
import { uploadFile } from '@/lib/minio'

export const config = {
  api: {
    bodyParser: false,
  },
}

function sanitizeFilename(name: string): string {
  // Replace spaces with underscores
  // Optionally remove or encode other chars
  return name.replace(/\s+/g, '_')
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

    const productNew = JSON.parse(fields.productNew)
    console.log(productNew)

    const imageNew = files.imageNew
    console.log(imageNew)

    const tasks: Array<() => Promise<string>> = []
    for (const table of productNew) {
      const type = Object.keys(table)[0]
      const rows = table[type]

      for (const row of rows) {
        const { version, images } = row
        for (const imageName of images) {
          const fileObj = imageNew.find(
            file => file.originalFilename === imageName
          )
          if (fileObj) {
            const objectName = `${type}/${version}/${sanitizeFilename(
              imageName
            )}`
            tasks.push(() => uploadFile(fileObj, objectName))
          }
        }
      }
    }

    const limit = pLimit(5) // Upload a max of 5 files concurrently at a time.
    await Promise.all(tasks.map(task => limit(task)))

    return res.status(200).json({ message: responseSuccessful })
  } catch (e) {
    return res.status(500).json({ message: errorFormidable })
  }
}
