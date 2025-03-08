import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { postgres } from '@/lib/postgres/index'
import {
  user,
  session,
  account,
  verification,
} from '@/lib/postgres/auth.schema'
import { readSecret } from '@/utils/readSecret'

export const auth = betterAuth({
  secret: readSecret('BETTER_AUTH_SECRET'),
  baseURL: process.env.BETTER_AUTH_URL_CLIENT,
  database: drizzleAdapter(postgres, {
    provider: 'pg',
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      verify: async (data: {
        hash: string
        password: string
      }): Promise<boolean> => {
        return data.password === readSecret('ADMIN_PASSWORD')
      }, // If the provided password matches the docker secret, allow sign in.
    },
  },
})
