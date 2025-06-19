import {
  errorFormidable,
  errorInvalidBody,
  errorInvalidRequest,
  errorMinio,
  errorPostgres,
} from '@/data/error'
import { isSessionPages } from '@/lib/better-auth/isSession'
import { uploadFile } from '@/lib/minio'
import { postgres } from '@/lib/postgres'
import { brand } from '@/lib/postgres/schema'
import formidable, { Fields, Files } from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'
import pLimit from 'p-limit'
import { z } from 'zod'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    await isSessionPages(req, res)

    try {
      const form = formidable({
        maxFileSize: 1024 * 1024 * 500, // 500 MB
        multiples: true,
        keepExtensions: true,
        allowEmptyFiles: false,
      })

      const { fields, files } = await new Promise<{
        fields: Fields
        files: Files
      }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            return reject(err)
          }
          resolve({ fields, files })
        })
      })

      const brandNew = fields?.brandNew && fields.brandNew[0]
      const imageNew = files?.imageNew

      if (!brandNew) {
        return res.status(400).json({ message: errorInvalidBody })
      }
      const { data: validatedBrandNew } = z
        .array(z.string())
        .safeParse(JSON.parse(brandNew))
      if (!validatedBrandNew) {
        return res.status(400).json({ message: errorInvalidBody })
      }

      if (imageNew && imageNew.length > 0) {
        try {
          const limit = pLimit(10)
          await Promise.all(
            imageNew.map(imageFile =>
              limit(() => uploadFile('brands', imageFile))
            )
          )
        } catch (e) {
          console.error(errorMinio, e)
          return res.status(500).json({ message: errorMinio })
        }
      }

      try {
        const limit = pLimit(10)
        await Promise.all(
          validatedBrandNew.map((imageName, index) => {
            const newIndex = index + 1
            limit(async () => {
              await postgres
                .insert(brand)
                .values({
                  image: imageName,
                  index: newIndex,
                })
                .onConflictDoUpdate({
                  target: [brand.image],
                  set: { index: newIndex },
                })
            })
          })
        )
      } catch (e) {
        console.error(errorPostgres, e)
        return res.status(500).json({ message: errorPostgres })
      }

      return res.status(200).json({})
    } catch (e) {
      console.error(errorFormidable, e)
      return res.status(500).json({ message: errorFormidable })
    }
  } else {
    return res.status(400).json({ message: errorInvalidRequest })
  }
}
