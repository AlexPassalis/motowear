// import fs from 'fs/promises'
// import path from 'path'
// import { z } from 'zod'

// export const PRODUCT_CATEGORIES = ['clothes', 'helmet_cover', 'hanger'] as const
// export const PRODUCT_TYPES = ['clothes', 'helmet_cover', 'hanger'] as const

// export const colors = [
//   'red',
//   'orange',
//   'amber',
//   'yellow',
//   'lime',
//   'green',
//   'emerald',
//   'teal',
//   'cyan',
//   'sky',
//   'blue',
//   'indigo',
//   'violet',
//   'purple',
//   'fuchsia',
//   'pink',
//   'rose',
//   'slate',
//   'gray',
//   'zinc',
//   'neutral',
//   'stone',
// ] as const

// export const steps = [
//   50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
// ] as const

// const colorPalette = colors.flatMap(color =>
//   steps.map(step => `bg-${color}-${step}`)
// )

// export const Config = z.object({
//   BACKGROUND_COLOR: z.literal(colorPalette),
// })

// let config: typeof Config

// export async function readConfig() {
//   const configPath = path.join(process.cwd(), 'src', 'config.json')
//   const configFile = await fs.readFile(configPath, 'utf-8')
//   config = JSON.parse(configFile)
// }
// await readConfig()

// export { config }
