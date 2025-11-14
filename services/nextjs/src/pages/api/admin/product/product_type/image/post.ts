import { handleError } from '@/utils/error/handleError'
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
  res: NextApiResponse,
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
        return res.status(400).json({ err: 'POST invalid body' })
      }
      const { data: validatedProductType } = z
        .string()
        .safeParse(JSON.parse(product_type))
      if (
        !validatedProductType ||
        !imagesNewFiles ||
        imagesNewFiles.length < 1
      ) {
        return res.status(400).json({ err: 'POST invalid body' })
      }

      try {
        const limit = pLimit(10)
        await Promise.all(
          imagesNewFiles.map((imageFile) =>
            limit(() => uploadFile(`${validatedProductType}`, imageFile)),
          ),
        )
      } catch (err) {
        const location = 'POST MINIO upload'
        handleError(location, err)

        return res.status(500).json({ err: location })
      }

      return res.status(200).json({})
    } catch (err) {
      const location = 'POST formidable parse'
      handleError(location, err)

      return res.status(500).json({ err: location })
    }
  } else {
    return res.status(400).json({ err: 'INVALID request method' })
  }
}
