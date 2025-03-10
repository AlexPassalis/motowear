import { z } from 'zod'

export const typeProduct = z.record(
  z.string(),
  z.array(
    z.object({
      id: z.string(),
      version: z.string(),
      color: z.string(),
      images: z.array(z.string()),
    })
  )
)

export const typeImage = z.array(z.instanceof(File))
