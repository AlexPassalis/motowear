import { z } from 'zod'

export const typeProduct = z.record(
  z.string(),
  z.array(
    z.object({
      id: z.string(),
      brand: z.string().nullable(),
      version: z.string(),
      description: z.string(),
      color: z.string().nullable(),
      images: z.array(z.string()),
      sizes: z.array(z.string()).nullable(),
      price: z.number(),
      price_before: z.number().nullable(),
    })
  )
)

export const typeImage = z.array(z.instanceof(File))
