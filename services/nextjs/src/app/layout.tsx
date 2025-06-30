import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Geist, Geist_Mono } from 'next/font/google'
import { ReactNode } from 'react'

import '@mantine/core/styles.css'
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from '@mantine/core'
import '@mantine/dates/styles.css'
import '@mantine/carousel/styles.css'
import '@mantine/charts/styles.css'

import './globals.css'

const proximaNova = localFont({
  src: [
    {
      path: '../../public/fonts/Proxima Nova.ttf',
      style: 'normal',
      weight: '900',
    },
  ],
  variable: '--font-proxima-nova',
})

const proximaNovaExtraBold = localFont({
  src: [
    {
      path: '../../public/fonts/Proxima Nova Extrabold.otf',
      style: 'normal',
      weight: '100',
    },
  ],
  variable: '--font-proxima-nova-extra-bold',
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://motowear.gr'),
  title: {
    default: 'motowear.gr',
    template: '%s | motowear.gr',
  },
  description:
    'Για όσους ζουν για τη μηχανή τους: Στο motowear.gr θα βρεις ρούχα, βάσεις κράνους, καλύμματα και μοναδικά αξεσουάρ που φτιάχτηκαν από αναβάτες για αναβάτες.',
  alternates: { canonical: '/' },
}

const customTheme = createTheme({
  breakpoints: {
    sm: '40em', // 640px
    md: '48em', // 768px
    lg: '64em', // 1024px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },
  colors: {
    red: [
      'oklch(0.971 0.013 17.38)', // red-50
      'oklch(0.936 0.032 17.717)', // red-100
      'oklch(0.885 0.062 18.334)', // red-200
      'oklch(0.808 0.114 19.571)', // red-300
      'oklch(0.704 0.191 22.216)', // red-400
      'oklch(0.637 0.237 25.331)', // red-500
      'oklch(0.577 0.245 27.325)', // red-600
      'oklch(0.505 0.213 27.518)', // red-700
      'oklch(0.444 0.177 26.899)', // red-800
      'oklch(0.396 0.141 25.723)', // red-900
      'oklch(0.258 0.092 26.042)', // red-950
    ],
    green: [
      'oklch(0.982 0.018 155.826)', // green-50
      'oklch(0.962 0.044 156.743)', // green-100
      'oklch(0.925 0.084 155.995)', // green-200
      'oklch(0.871 0.15 154.449)', // green-300
      'oklch(0.792 0.209 151.711)', // green-400
      'oklch(0.723 0.219 149.579)', // green-500
      'oklch(0.627 0.194 149.214)', // green-600
      'oklch(0.527 0.154 150.069)', // green-700
      'oklch(0.448 0.119 151.328)', // green-800
      'oklch(0.393 0.095 152.535)', // green-900
      'oklch(0.266 0.065 152.934)', // green-950
    ],
    blue: [
      'oklch(0.97 0.014 254.604)', // blue-50
      'oklch(0.932 0.032 255.585)', // blue-100
      'oklch(0.882 0.059 254.128)', // blue-200
      'oklch(0.809 0.105 251.813)', // blue-300
      'oklch(0.707 0.165 254.624)', // blue-400
      'oklch(0.623 0.214 259.815)', // blue-500
      'oklch(0.546 0.245 262.881)', // blue-600
      'oklch(0.488 0.243 264.376)', // blue-700
      'oklch(0.424 0.199 265.638)', // blue-800
      'oklch(0.379 0.146 265.522)', // blue-900
      'oklch(0.282 0.091 267.935)', // blue-950
    ],
  },
  primaryColor: 'red',
})

import { FacebookPixel } from '@/lib/facebook-pixel'
import { envClient } from '@/env'

import '@/lib/cron/index'

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="el" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${proximaNova.variable} ${proximaNovaExtraBold.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider theme={customTheme}>{children}</MantineProvider>
        <FacebookPixel />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${envClient.FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
