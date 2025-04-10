import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/carousel',
      '@mantine/form',
      '@mantine/dates',
    ],
  },
  images: {
    minimumCacheTTL: 3600, // Set TTL to 1 hour (3600 seconds) for Clouflare
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/motowear/**',
      },
      // {
      //   protocol: 'https',
      //   hostname: `${envServer.HOST}`,
      //   pathname: '/api/admin/product/brand/image/**',
      // },
    ],
  },
}

export default nextConfig
