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
      '@mantine/carousel',
      '@mantine/form',
      '@mantine/dates',
      '@mantine/charts',
    ],
  },
  images: {
    minimumCacheTTL: 31536000, // Set TTL to 1 year for Cloudflare
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
