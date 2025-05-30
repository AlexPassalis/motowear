import {
  errorFormidable,
  errorInvalidBody,
  errorInvalidRequest,
  errorMinio,
} from '@/data/error'
import { isSessionPages } from '@/lib/better-auth/isSession'
import { uploadFile } from '@/lib/minio'
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

      const product_type = fields?.product_type && fields.product_type[0]
      const imagesNewFiles = files?.imagesNewFiles

      if (!product_type) {
        return res.status(400).json({ message: errorInvalidBody })
      }
      const { data: validatedProductType } = z
        .string()
        .safeParse(JSON.parse(product_type))
      if (
        !validatedProductType ||
        !imagesNewFiles ||
        imagesNewFiles.length < 1
      ) {
        return res.status(400).json({ message: errorInvalidBody })
      }

      try {
        const limit = pLimit(10)
        await Promise.all(
          imagesNewFiles.map((imageFile) =>
            limit(() => uploadFile(`${validatedProductType}`, imageFile))
          )
        )
      } catch (e) {
        console.error(errorMinio, e)
        return res.status(500).json({ message: errorMinio })
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
