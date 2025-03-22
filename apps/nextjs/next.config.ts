import { envServer } from '@/env'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/carousel',
      '@mantine/notifications',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/product/**',
      },
      {
        protocol: 'https',
        hostname: `${envServer.HOST}`,
        pathname: '/api/admin/product/brand/image/**',
      },
    ],
  },
}

export default nextConfig
