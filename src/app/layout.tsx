// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/hooks/useAuth'
import { ToasterProvider } from '@/components/providers/ToasterProvider' // 添加这行导入

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
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        
        {/* 添加 ToasterProvider 组件 */}
        <ToasterProvider />
        
        <Script 
          src="https://plugin-code.salesmartly.com/js/project_408373_419884_1753852401.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  )
}
