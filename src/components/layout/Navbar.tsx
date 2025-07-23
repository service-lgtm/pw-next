// src/components/layout/Navbar.tsx
// 导航栏组件 - 完整版

'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { 
  Home,
  ShoppingCart,
  ClipboardList,
  Wallet,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = [
    {
      label: '仪表盘',
      href: '/dashboard',
      icon: <Home className="w-4 h-4" />
    },
    {
      label: '商城',
      icon: <ShoppingCart className="w-4 h-4" />,
      items: [
        { label: 'TDB商城', href: '/shop/tdb' },
        { label: '我的订单', href: '/shop/orders' }
      ]
    },
    {
      label: '资产',
      href: '/assets',
      icon: <Wallet className="w-4 h-4" />
    },
    {
      label: '团队',
      href: '/team',
      icon: <Users className="w-4 h-4" />
    }
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="bg-[#0A1628] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-yellow-600 rounded flex items-center justify-center font-black text-black">
                P
              </div>
              <span className="font-black text-xl text-white hidden sm:block">
                平行世界
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.items ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                        pathname.startsWith(item.items[0].href.split('/').slice(0, -1).join('/'))
                          ? "text-gold-500 bg-gold-500/10"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.href}
                          onClick={() => router.push(subItem.href)}
                          className={cn(
                            "block w-full text-left px-4 py-2 text-sm transition-all",
                            pathname === subItem.href
                              ? "text-gold-500 bg-gold-500/10"
                              : "text-gray-300 hover:text-white hover:bg-gray-800"
                          )}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => router.push(item.href!)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                      pathname === item.href
                        ? "text-gold-500 bg-gold-500/10"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* 快捷购买TDB按钮 */}
            <PixelButton
              size="sm"
              onClick={() => router.push('/shop/tdb')}
              className="hidden md:flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              购买TDB
            </PixelButton>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.nickname?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block">{user?.nickname || user?.username}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl"
                  >
                    <div className="p-4 border-b border-gray-800">
                      <p className="font-bold text-white">{user?.nickname || user?.username}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">TDB余额</p>
                          <p className="font-bold text-gold-500">
                            {user?.tdb_balance || user?.tdbBalance || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">YLD余额</p>
                          <p className="font-bold text-green-500">
                            {user?.yld_balance || user?.yldBalance || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          router.push('/shop/orders')
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-all flex items-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4" />
                        我的订单
                      </button>
                      <button
                        onClick={() => {
                          router.push('/settings')
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-all flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        账户设置
                      </button>
                      <div className="my-2 border-t border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800"
          >
            <div className="px-4 py-3 space-y-1">
              {/* 快捷购买TDB按钮 - 移动端 */}
              <PixelButton
                className="w-full mb-3 flex items-center justify-center gap-2"
                onClick={() => {
                  router.push('/shop/tdb')
                  setMobileMenuOpen(false)
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                进入TDB商城
              </PixelButton>

              {navItems.map((item) => (
                <div key={item.label}>
                  {item.items ? (
                    <>
                      <div className="px-3 py-2 text-sm font-medium text-gray-400">
                        {item.label}
                      </div>
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.href}
                          onClick={() => {
                            router.push(subItem.href)
                            setMobileMenuOpen(false)
                          }}
                          className={cn(
                            "block w-full text-left px-6 py-2 text-sm transition-all",
                            pathname === subItem.href
                              ? "text-gold-500 bg-gold-500/10"
                              : "text-gray-300 hover:text-white hover:bg-gray-800"
                          )}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        router.push(item.href!)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm font-medium transition-all",
                        pathname === item.href
                          ? "text-gold-500 bg-gold-500/10"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </span>
                    </button>
                  )}
                </div>
              ))}
              
              <div className="pt-3 border-t border-gray-800">
                <button
                  onClick={() => {
                    router.push('/settings')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <FaCog />
                    账户设置
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <FaSignOutAlt />
                    退出登录
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false)
            setMobileMenuOpen(false)
          }}
        />
      )}
    </nav>
  )
}
