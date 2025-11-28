import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { postgres } from '@/lib/postgres/index'
import path from 'path'
import { ERROR } from '@/data/magic'
import { handleError } from '@/utils/error/handleError'

export async function run_migrations() {
  try {
    await migrate(postgres, {
      migrationsFolder: path.join(process.cwd(), 'src/lib/postgres/migrations'),
    })

    console.info('Migrations ran successfully')
  } catch (err) {
    const location = `${ERROR.postgres} run_migrations()`
    handleError(location, err)

    process.exit(1)
  }
}
