export function sanitizeFilename(name: string): string {
  return name
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\p{L}\p{N}_.-]/gu, '') // Allow letters (incl. Greek), numbers, underscore, dot, and dash
}
