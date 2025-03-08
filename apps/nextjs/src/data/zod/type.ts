import { z } from 'zod'

export const typeEmail = z.string().email()
export const typeUsername = z.string().min(4).max(20)
