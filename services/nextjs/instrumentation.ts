export async function register() {
  const { startup } = await import('@/startup')
  await startup()
}
