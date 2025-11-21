import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  eslint: {
    dirs: ['src'],
  },
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      '@mantine/carousel',
      '@mantine/dates',
      '@mantine/charts',
    ],
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/motowear/**',
        search: '',
      },
    ],
    minimumCacheTTL: 31536000, // Set TTL to 1 year for Cloudflare
  },
  async headers() {
    return [
      {
        source: '/product/:productType/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Cache-Tag',
            value: ':productType',
          },
        ],
      },
    ]
  },
  /* Remove next.js compression, so that nginx can do the compression using gzip 
  and therefore prevent buffering (and use streaming instead). */
  compress: false,
}

export default nextConfig
