'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// 侧边栏导航配置
const sidebarItems = [
  {
    title: '我的资产',
    icon: '💰',
    items: [
      { label: 'NFT仓库', href: '/assets', icon: '📦' },
      { label: '土地资产', href: '/assets/land', icon: '🏞️' },
      { label: '工具背包', href: '/assets/tools', icon: '🎒' },
      { label: '矿产仓库', href: '/assets/inventory', icon: '⛏️' },
    ]
  },
  {
    title: '我的业务',
    icon: '💼',
    items: [
      { label: '挖矿中心', href: '/mining', icon: '⛏️' },
      { label: '交易市场', href: '/market', icon: '🛒' },
      { label: '我的商店', href: '/shop', icon: '🏪' },
    ]
  },
  {
    title: '财务中心',
    icon: '💳',
    items: [
      { label: '数字钱包', href: '/wallet', icon: '👛' },
      { label: '收益统计', href: '/wallet/earnings', icon: '📊' },
    ]
  }
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] flex">
      {/* 侧边栏 */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className={cn(
              "w-64 bg-[#0A1628] border-r-4 border-gray-800",
              "fixed md:relative h-full z-40",
              isMobile && "shadow-xl"
            )}
          >
            {/* Logo区域 */}
            <div className="p-6 border-b-4 border-gray-800">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded flex items-center justify-center text-2xl font-black">
                  P
                </div>
                <span className="text-xl font-black text-gold-500">平行世界</span>
              </Link>
            </div>

            {/* 导航菜单 */}
            <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
              {sidebarItems.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-bold">
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.title}</span>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-all",
                          "hover:bg-gold-500/10 hover:text-gold-500",
                          pathname === item.href && "bg-gold-500/20 text-gold-500 font-bold"
                        )}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* 底部用户信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-all"
              >
                <span>🚪</span>
                <span className="text-sm font-bold">退出登录</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 移动端遮罩 */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 bg-[#0A1628] border-b-4 border-gray-800 px-4 md:px-6">
          <div className="h-full flex items-center justify-between">
            {/* 左侧 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                </div>
              </button>

              {/* 面包屑导航 */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <Link href="/dashboard" className="hover:text-gold-500 transition-colors">
                  首页
                </Link>
                <span>/</span>
                <span className="text-white">仪表盘</span>
              </div>
            </div>

            {/* 右侧状态栏 */}
            <div className="flex items-center gap-4">
              {/* 能量条 */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-400">能量</span>
                <div className="w-24 h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-gold-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${user?.energy || 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm font-bold text-gold-500">{user?.energy || 100}%</span>
              </div>

              {/* 用户信息 */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white">{user?.nickname || user?.username}</p>
                  <p className="text-xs text-gray-400">等级 {user?.level || 1}</p>
                </div>
                <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.nickname?.[0] || user?.username?.[0] || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
