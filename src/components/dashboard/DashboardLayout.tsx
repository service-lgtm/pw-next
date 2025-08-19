// src/components/dashboard/DashboardLayout.tsx
// 主布局组件 - 移除能量显示

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

// 侧边栏导航配置 - 显示所有模块，标记开放状态
const sidebarItems = [
  {
    title: '我的资产',
    icon: '💰',
    items: [
      { label: '资产总览', href: '/assets', icon: '💎', isActive: true },
      { label: '土地资产', href: '/assets/land', icon: '🏞️', isActive: true },
    ]
  },
  {
    title: '我的业务',
    icon: '💼',
    items: [
      { label: '挖矿中心', href: '/mining', icon: '⛏️', isActive: true, isExternal: true },
      { label: '交易市场', href: '/market', icon: '🛒', isActive: true, isExternal: true },
      { label: '我的商店', href: '/shop', icon: '🏪', isActive: false },
    ]
  },
  {
    title: '财务中心',
    icon: '💳',
    items: [
      { label: '数字钱包', href: '/wallet', icon: '👛', isActive: false },
      { label: '收益统计', href: '/wallet/earnings', icon: '📊', isActive: false },
    ]
  },
  {
    title: '账户管理',
    icon: '⚙️',
    items: [
      { label: '我的推荐码', href: '/dashboard/referral', icon: '🎯', isActive: true },
      { label: '账户设置', href: '/dashboard/settings', icon: '🔧', isActive: true },
    ]
  }
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, checkAuth } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showUnlockedToast, setShowUnlockedToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // 获取最新的用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.accounts.profile()
        if (response.success && response.data) {
          setProfileData(response.data)
        }
      } catch (error) {
        console.error('获取用户资料失败:', error)
      }
    }
    
    if (user) {
      fetchProfile()
    }
  }, [user])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setShowLogoutConfirm(false)
  }

  const handleMenuClick = (item: any, e: React.MouseEvent) => {
    // 处理外部链接
    if (item.isExternal) {
      e.preventDefault()
      window.open(item.href, '_blank')
      return
    }
    
    if (!item.isActive) {
      e.preventDefault()
      setToastMessage(`${item.label} 功能即将开放，敬请期待！`)
      setShowUnlockedToast(true)
      setTimeout(() => setShowUnlockedToast(false), 3000)
    }
  }

  // 使用最新的资料数据或用户数据
  const displayUser = profileData || user
  const tdbBalance = profileData?.tdb_balance ? parseFloat(profileData.tdb_balance) : (user?.tdbBalance || 0)
  const yldBalance = profileData?.yld_balance ? parseFloat(profileData.yld_balance) : (user?.yldBalance || 0)

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
              "fixed md:relative h-screen z-40 flex flex-col",
              isMobile && "shadow-xl"
            )}
          >
            {/* Logo区域 */}
            <div className="p-6 border-b-4 border-gray-800 flex-shrink-0">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-500 rounded flex items-center justify-center text-2xl font-black">
                  P
                </div>
                <span className="text-xl font-black text-gold-500">平行世界</span>
              </Link>
            </div>

            {/* 导航菜单 - 使用 flex-1 和 overflow-y-auto */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {sidebarItems.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-bold">
                      <span className="text-lg">{section.icon}</span>
                      <span>{section.title}</span>
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        item.isActive ? (
                          item.isExternal ? (
                            <button
                              key={item.href}
                              onClick={(e) => handleMenuClick(item, e)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded transition-all text-left",
                                "hover:bg-gold-500/10 hover:text-gold-500"
                              )}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span className="text-sm">{item.label}</span>
                              <span className="ml-auto text-xs">🔗</span>
                            </button>
                          ) : (
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
                          )
                        ) : (
                          <button
                            key={item.href}
                            onClick={(e) => handleMenuClick(item, e)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded transition-all",
                              "text-gray-500 hover:bg-gray-800/50 cursor-not-allowed relative"
                            )}
                          >
                            <span className="text-lg opacity-50">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                            <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">
                              未开放
                            </span>
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            {/* 底部退出按钮 - 固定在底部 */}
            <div className="p-4 border-t-4 border-gray-800 flex-shrink-0">
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

      {/* 退出确认弹窗 */}
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

      {/* 功能未开放提示 Toast */}
      <AnimatePresence>
        {showUnlockedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部导航 */}
        <header className="h-16 bg-[#0A1628] border-b-4 border-gray-800 px-4 md:px-6 flex-shrink-0">
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
                      {tdbBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* YLD 余额 */}
                <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded">
                  <span className="text-xl">⚡</span>
                  <div>
                    <p className="text-xs text-gray-400">YLD</p>
                    <p className="text-sm font-bold text-purple-500">
                      {yldBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧用户信息 - 移除能量条 */}
            <div className="flex items-center gap-3">
              {/* 用户下拉菜单 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white">{displayUser?.nickname || displayUser?.username}</p>
                    <p className="text-xs text-gray-400">
                      {displayUser?.level_name || `等级 ${displayUser?.level || 1}`}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {displayUser?.nickname?.[0] || displayUser?.username?.[0] || 'U'}
                  </div>
                  <span className="text-xs text-gray-400">▼</span>
                </button>

                {/* 下拉菜单 */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-[#0A1628] border-4 border-gray-800 rounded-lg shadow-xl z-50"
                    >
                      {/* 用户信息 */}
                      <div className="p-4 border-b-2 border-gray-800">
                        <p className="font-bold text-white">{displayUser?.nickname || displayUser?.username}</p>
                        <p className="text-sm text-gray-400">{displayUser?.masked_email || displayUser?.email}</p>
                        <p className="text-xs text-gold-500 mt-1">推荐码: {displayUser?.referral_code}</p>
                      </div>

                      {/* 快捷菜单 */}
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span className="mr-2">🏠</span>
                          仪表盘
                        </Link>
                        <Link
                          href="/dashboard/referral"
                          className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span className="mr-2">🎯</span>
                          我的推荐码
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span className="mr-2">⚙️</span>
                          账户设置
                        </Link>
                        <Link
                          href="/assets"
                          className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <span className="mr-2">💰</span>
                          我的资产
                        </Link>
                        <button
                          onClick={() => {
                            window.open('https://www.pxsj.net.cn/mining', '_blank')
                            setShowUserDropdown(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                        >
                          <span className="mr-2">⛏️</span>
                          挖矿中心
                          <span className="ml-1 text-xs">🔗</span>
                        </button>
                        <div className="border-t-2 border-gray-800 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false)
                              setShowLogoutConfirm(true)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <span className="mr-2">🚪</span>
                            退出登录
                          </button>
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="p-4 border-t-2 border-gray-800 bg-gray-800/30">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-400">TDB余额</p>
                            <p className="text-sm font-bold text-gold-500">
                              {tdbBalance.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">YLD余额</p>
                            <p className="text-sm font-bold text-purple-500">
                              {yldBalance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容 - 使用 flex-1 占满剩余空间 */}
        <main className="flex-1 overflow-y-auto bg-[#0F0F1E]">
          {children}
        </main>
      </div>
    </div>
  )
}
