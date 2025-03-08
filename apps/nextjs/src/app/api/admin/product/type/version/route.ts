import formidable from 'formidable'
import { responseSuccessful } from '@/data/zod/expected'
import { errorFormidable } from '@/data/zod/error'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request, res: Response) {
  const form = formidable()
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ message: errorFormidable })
    }
    console.log(fields)
    console.log(files)
    return res.status(200).json({ message: responseSuccessful })
  })
}
