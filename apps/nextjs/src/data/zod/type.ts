import { z } from 'zod'

export const typeProduct = z.record(
  z.string(),
  z.array(
    z.object({
      id: z.string(),
      version: z.string(),
      description: z.string(),
      images: z.array(z.string()),
      price: z.number(),
      brand: z.string().nullable(),
      color: z.string().nullable(),
      sizes: z.array(z.string()),
      price_before: z.number().nullable(),
    })
  )
)

export const typeImage = z.array(z.instanceof(File))
