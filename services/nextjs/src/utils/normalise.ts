export function normalise(query: string) {
  return query
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’΄]/g, '')
}
