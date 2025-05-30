import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/carousel',
      '@mantine/form',
      '@mantine/dates',
      '@mantine/charts',
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
        search: '',
      },
    ],
  },
  /* Remove next.js compression, so that nginx can do the compression using gzip 
  and therefore prevent buffering (and use streaming instead). */
  compress: false,
}

export default nextConfig
