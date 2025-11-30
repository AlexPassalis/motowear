import { migrate_v2 } from '@/scripts/migrate_v2'
import { handleError } from '@/utils/error/handleError'

export async function run_scripts() {
  try {
    await migrate_v2()

    console.info('Scripts ran successfully')
  } catch (err) {
    const location = 'run_scripts() migrate_v2()'
    handleError(location, err)
  }
}
