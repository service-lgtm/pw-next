import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parallel World - Digital Assets, Real Value',
  description: 'Every token backed by physical gold reserves.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}

// 创建一个客户端组件来处理路由
'use client'
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 需要使用 Dashboard 布局的路由
  const dashboardRoutes = [
    '/dashboard',
    '/assets',
    '/mining',
    '/market',
    '/shop',
    '/wallet'
  ]
  
  const isDashboardRoute = dashboardRoutes.some(route => 
    pathname?.startsWith(route)
  )
  
  // 如果是仪表盘路由，使用 DashboardLayout
  if (isDashboardRoute) {
    return <DashboardLayout>{children}</DashboardLayout>
  }
  
  // 否则直接渲染页面
  return <>{children}</>
}
