// src/app/layout.tsx
// 根布局文件 - 包含 Toaster

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/hooks/useAuth'
import { ToasterProvider } from '@/components/providers/ToasterProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parallel World - Digital Assets, Real Value',
  description: 'Every token backed by physical gold reserves. Build, trade, and own digital assets with the stability of precious metals.',
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
        <AuthProvider>
          <ToasterProvider />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
