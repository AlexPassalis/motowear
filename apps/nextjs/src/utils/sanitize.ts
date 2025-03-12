export function sanitizeFilename(name: string): string {
  return name
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w.-]/g, '') // Remove special characters (keep letters, numbers, _, ., -)
}
