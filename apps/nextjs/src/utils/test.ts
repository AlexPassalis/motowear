export function testTableName(tableName: string) {
  return /^[\p{L}0-9_]+$/u.test(tableName) ? tableName : null
}
