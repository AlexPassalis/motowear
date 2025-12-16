import { handleError } from '@/utils/error/handleError'

export async function run_scripts() {
  try {
    console.info('Scripts ran successfully')
  } catch (err) {
    const location = 'run_scripts()'
    handleError(location, err)
  }
}
