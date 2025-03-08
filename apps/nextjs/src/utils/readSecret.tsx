import fs from 'fs'

export function readSecret(secret: string) {
  const secretPath = `/run/secrets/${secret}`
  const fileExists = fs.existsSync(secretPath)
  if (!fileExists) {
    console.error(`${secretPath} does not exist.`)
    process.exit(1)
  }
  const secretString = fs.readFileSync(secretPath, 'utf-8').trim()
  if (!secretString) {
    console.error(`${secret} is an empty string ""`)
    process.exit(1)
  }
  return secretString
}
