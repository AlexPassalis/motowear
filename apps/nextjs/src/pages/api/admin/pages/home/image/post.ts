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

      const { files } = await new Promise<{
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

      const imagesNewFiles = files?.imagesNewFiles

      if (!imagesNewFiles || imagesNewFiles.length < 1) {
        return res.status(400).json({ message: errorInvalidBody })
      }

      try {
        const limit = pLimit(10)
        await Promise.all(
          imagesNewFiles.map((imageFile) =>
            limit(() => uploadFile('home_page', imageFile))
          )
        )
      } catch (e) {
        console.error(errorMinio, e)
        return res.status(500).json({ message: errorMinio })
      }
    } catch (e) {
      console.error(errorFormidable, e)
      return res.status(500).json({ message: errorFormidable })
    }
  } else {
    return res.status(400).json({ message: errorInvalidRequest })
  }

  return res.status(200).json({})
}
