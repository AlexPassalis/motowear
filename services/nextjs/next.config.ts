import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
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
  /* Remove next.js compression, so that nginx can do the compression using gzip 
  and therefore prevent buffering (and use streaming instead). */
  compress: false,
  /* Redirect the old Shopify links from Google to the home page, until it re-crawls.*/
  async redirects() {
    return [
      { source: '/products/:path*', destination: '/', permanent: true },
      { source: '/collections/:path*', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
