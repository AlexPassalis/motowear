import { z } from 'zod'

export const zodImage = z.array(z.instanceof(File))
