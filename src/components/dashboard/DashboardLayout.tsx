// 文件路径: src/components/dashboard/DashboardLayout.tsx
// 文件名: DashboardLayout.tsx
// 功能: 主布局组件，包含侧边栏和顶部导航

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// 侧边栏导航配置 - 只保留已开放功能
const sidebarItems = [
  {
    title: '我的资产',
    icon: '💰',
    items: [
      { label: '资产总览', href: '/assets', icon: '💎' },  // 新增资产总览
      { label: '土地资产', href: '/assets/land', icon: '🏞️' },
    ]
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
    setShowLogoutConfirm(false)
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
            <nav className="p-4 space-y-6">
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

              {/* 即将开放提示 */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded">
                <p className="text-xs text-gray-400 text-center">
                  更多功能即将开放...
                </p>
              </div>
            </nav>

            {/* 底部用户信息 - 优化移动端显示 */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-4 border-t-4 border-gray-800",
              isMobile && "pb-safe" // 适配手机底部安全区域
            )}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-all"
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

      {/* 退出确认弹窗 - 解决移动端兼容性 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A1628] border-4 border-gray-800 rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-4">确认退出</h3>
              <p className="text-gray-400 mb-6">确定要退出登录吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="h-16 bg-[#0A1628] border-b-4 border-gray-800 px-4 md:px-6">
          <div className="h-full flex items-center justify-between">
            {/* 左侧 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-800 rounded transition-colors md:hidden"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                  <span className="block h-0.5 bg-gold-500 transition-all" />
                </div>
              </button>

              {/* 积分余额显示 */}
              <div className="flex items-center gap-4">
                {/* TDB 余额 */}
                <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded">
                  <span className="text-xl">💎</span>
                  <div>
                    <p className="text-xs text-gray-400">TDB</p>
                    <p className="text-sm font-bold text-gold-500">
                      {user?.tdbBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                {/* YLD 余额 */}
                <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs text-gray-400">YLD</p>
                    <p className="text-sm font-bold text-purple-500">
                      {user?.yldBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧用户信息 */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{user?.nickname || user?.username}</p>
                <p className="text-xs text-gray-400">数字公民</p>
              </div>
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.nickname?.[0] || user?.username?.[0] || 'U'}
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
