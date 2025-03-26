import { z } from 'zod'

export const typeProduct = z.array(
  z.object({
    id: z.string(),
    version: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    price: z.number(),
    brand: z.string(),
    color: z.string(),
    size: z.string(),
    price_before: z.number(),
  })
)

export const typeImage = z.array(z.instanceof(File))
