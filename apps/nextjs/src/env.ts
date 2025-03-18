const host =
  process.env.NODE_ENV === 'development' ? 'localhost' : 'alexpassalis.com'

export const env = {
  HOST: host,
  BETTER_AUTH_URL: `https://${host}/api/admin/auth`,
  API_ADMIN_URL: `https://${host}/api/admin`,
  MINIO_PRODUCT_URL: 'http://minio:9000/product',
} as const
