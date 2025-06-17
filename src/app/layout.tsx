import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parallel World - Digital Assets, Real Value',
  description: 'Every token backed by physical gold reserves. Build, trade, and own digital assets with the stability of precious metals.',
  keywords: 'blockchain, gold standard, digital assets, NFT, cryptocurrency, stable coin',
  authors: [{ name: 'Parallel World' }],
  openGraph: {
    title: 'Parallel World - Digital Assets, Real Value',
    description: 'Every token backed by physical gold reserves.',
    type: 'website',
    locale: 'en_US',
    url: 'https://parallelworld.com',
    siteName: 'Parallel World',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Parallel World',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parallel World - Digital Assets, Real Value',
    description: 'Every token backed by physical gold reserves.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black antialiased`}>
        <div className="pixel-grid fixed inset-0 pointer-events-none opacity-30" />
        {children}
      </body>
    </html>
  )
}
