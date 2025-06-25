// app/explore/china/[province]/components/Navigation.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Menu, X, Wallet, Bell, User, ChevronDown, LogIn,
  Home, MapIcon, Package, ShoppingBag, Settings,
  TrendingUp, Users, Award, HelpCircle, LogOut,
  Coins, Activity, MessageCircle, Calendar, Star
} from 'lucide-react'
import { cn, formatCurrency } from '../utils'
import { useIsMobile } from '../hooks'
import type { UserState, Notification } from '../types'
import { ANIMATION_CONFIG } from '../constants'

interface TopNavigationProps {
  user: UserState
  onLogin: () => void
  onLogout?: () => void
  notifications?: Notification[]
}

export function TopNavigation({ 
  user, 
  onLogin, 
  onLogout,
  notifications = [] 
}: TopNavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const isMobile = useIsMobile()
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  // 关闭菜单时的处理
  useEffect(() => {
    if (showMobileMenu || showUserMenu || showNotifications) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobileMenu, showUserMenu, showNotifications])
  
  return (
    <>
      <nav className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo区域 */}
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
                  aria-label="菜单"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              <Link href="/explore/china" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-black">平</span>
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gold-500 to-orange-600 bg-clip-text text-transparent">
                  平行世界
                </span>
              </Link>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/explore" icon={<MapIcon className="w-4 h-4" />}>
                世界地图
              </NavLink>
              <NavLink href="/market" icon={<TrendingUp className="w-4 h-4" />}>
                交易市场
              </NavLink>
              <NavLink href="/recruit" icon={<Users className="w-4 h-4" />}>
                招聘大厅
              </NavLink>
              <NavLink href="/shop" icon={<ShoppingBag className="w-4 h-4" />}>
                商城
              </NavLink>
            </div>
            
            {/* 用户信息区 */}
            <div className="flex items-center gap-3">
              {user.isLoggedIn ? (
                <>
                  {/* 余额显示 - 桌面端 */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                      <Wallet className="w-4 h-4 text-gold-500" />
                      <span className="text-sm font-medium">
                        {formatCurrency(user.balance?.tdb || 0, 'TDB')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                      <Coins className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {formatCurrency(user.balance?.yld || 0, 'CNY')}
                      </span>
                    </div>
                  </div>
                  
                  {/* 通知按钮 */}
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="通知"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* 用户菜单 */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <UserAvatar user={user} size="sm" />
                    {!isMobile && <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                </>
              ) : (
                <button
                  onClick={onLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-orange-600 text-black rounded-lg font-medium hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 移动端菜单 */}
      <MobileMenu 
        show={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        user={user}
      />
      
      {/* 用户下拉菜单 */}
      <UserDropdown
        show={showUserMenu}
        onClose={() => setShowUserMenu(false)}
        user={user}
        onLogout={onLogout}
      />
      
      {/* 通知面板 */}
      <NotificationPanel
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />
    </>
  )
}

// 导航链接组件
function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon?: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

// 用户头像组件
function UserAvatar({ 
  user, 
  size = 'md' 
}: { 
  user: UserState
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={cn(
      sizeClasses[size],
      "bg-gradient-to-br from-gold-500 to-orange-600 rounded-full flex items-center justify-center relative"
    )}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full" />
      ) : (
        <User className={cn(
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6',
          'text-black'
        )} />
      )}
      {user.level && user.level > 10 && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
          <Star className="w-2 h-2 text-white fill-white" />
        </div>
      )}
    </div>
  )
}

// 移动端菜单
function MobileMenu({ 
  show, 
  onClose, 
  user 
}: { 
  show: boolean
  onClose: () => void
  user: UserState 
}) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          
          {/* 菜单内容 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={ANIMATION_CONFIG.spring}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900 z-50 md:hidden overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">菜单</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {user.isLoggedIn && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <UserAvatar user={user} />
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-400">
                        Lv.{user.level || 1} · {user.experience || 0} EXP
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400">TDB余额</p>
                      <p className="font-bold text-gold-500">
                        {formatCurrency(user.balance?.tdb || 0, 'TDB')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400">月收益</p>
                      <p className="font-bold text-green-500">
                        {formatCurrency(user.monthlyIncome || 0, 'CNY')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <nav className="p-4 space-y-1">
              <MobileNavLink href="/" icon={<Home />} onClick={onClose}>
                首页
              </MobileNavLink>
              <MobileNavLink href="/explore" icon={<MapIcon />} onClick={onClose}>
                世界地图
              </MobileNavLink>
              <MobileNavLink href="/market" icon={<TrendingUp />} onClick={onClose}>
                交易市场
              </MobileNavLink>
              <MobileNavLink href="/recruit" icon={<Users />} onClick={onClose}>
                招聘大厅
              </MobileNavLink>
              <MobileNavLink href="/shop" icon={<ShoppingBag />} onClick={onClose}>
                商城
              </MobileNavLink>
              
              {user.isLoggedIn && (
                <>
                  <div className="my-4 h-px bg-gray-800" />
                  <MobileNavLink href="/assets" icon={<Package />} onClick={onClose}>
                    我的资产
                  </MobileNavLink>
                  <MobileNavLink href="/achievements" icon={<Award />} onClick={onClose}>
                    成就系统
                  </MobileNavLink>
                  <MobileNavLink href="/messages" icon={<MessageCircle />} onClick={onClose}>
                    消息中心
                  </MobileNavLink>
                  <MobileNavLink href="/calendar" icon={<Calendar />} onClick={onClose}>
                    日程管理
                  </MobileNavLink>
                  <div className="my-4 h-px bg-gray-800" />
                  <MobileNavLink href="/settings" icon={<Settings />} onClick={onClose}>
                    设置
                  </MobileNavLink>
                  <MobileNavLink href="/help" icon={<HelpCircle />} onClick={onClose}>
                    帮助中心
                  </MobileNavLink>
                </>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 移动端导航链接
function MobileNavLink({ 
  href, 
  icon, 
  onClick,
  children 
}: { 
  href: string
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}

// 用户下拉菜单
function UserDropdown({
  show,
  onClose,
  user,
  onLogout
}: {
  show: boolean
  onClose: () => void
  user: UserState
  onLogout?: () => void
}) {
  return (
    <AnimatePresence>
      {show && user.isLoggedIn && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={ANIMATION_CONFIG.fast}
            className="absolute right-4 top-20 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-40"
          >
            {/* 用户信息头部 */}
            <div className="p-4 bg-gradient-to-r from-gold-500/10 to-orange-600/10 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div className="flex-1">
                  <p className="font-medium text-lg">{user.username}</p>
                  <p className="text-sm text-gray-400">
                    等级 {user.level || 1} · {user.experience || 0} EXP
                  </p>
                </div>
              </div>
              
              {/* 快速统计 */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-500">{user.ownedPlots || 0}</p>
                  <p className="text-xs text-gray-400">地块</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {user.monthlyIncome ? (user.monthlyIncome / 1000).toFixed(1) : 0}k
                  </p>
                  <p className="text-xs text-gray-400">月收益</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {user.achievements?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">成就</p>
                </div>
              </div>
            </div>
            
            {/* 菜单选项 */}
            <div className="p-2">
              <DropdownLink href="/profile" icon={<User />} onClick={onClose}>
                个人主页
              </DropdownLink>
              <DropdownLink href="/assets" icon={<Package />} onClick={onClose}>
                我的资产
              </DropdownLink>
              <DropdownLink href="/transactions" icon={<Activity />} onClick={onClose}>
                交易记录
              </DropdownLink>
              <DropdownLink href="/achievements" icon={<Award />} onClick={onClose}>
                成就系统
              </DropdownLink>
              
              <div className="my-2 h-px bg-gray-800" />
              
              <DropdownLink href="/settings" icon={<Settings />} onClick={onClose}>
                账户设置
              </DropdownLink>
              <DropdownLink href="/help" icon={<HelpCircle />} onClick={onClose}>
                帮助中心
              </DropdownLink>
              
              {onLogout && (
                <>
                  <div className="my-2 h-px bg-gray-800" />
                  <button
                    onClick={() => {
                      onLogout()
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded transition-colors text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 下拉菜单链接
function DropdownLink({ 
  href, 
  icon, 
  onClick,
  children 
}: { 
  href: string
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}

// 通知面板
function NotificationPanel({
  show,
  onClose,
  notifications
}: {
  show: boolean
  onClose: () => void
  notifications: Notification[]
}) {
  const notificationIcons = {
    system: <Bell className="w-4 h-4" />,
    transaction: <Activity className="w-4 h-4" />,
    social: <MessageCircle className="w-4 h-4" />,
    achievement: <Award className="w-4 h-4" />
  }
  
  const notificationColors = {
    system: 'text-blue-500',
    transaction: 'text-green-500',
    social: 'text-purple-500',
    achievement: 'text-gold-500'
  }
  
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={ANIMATION_CONFIG.fast}
            className="absolute right-4 top-20 w-96 max-h-[70vh] bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-40"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">通知中心</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无新通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {notifications.map(notification => (
                    <Link
                      key={notification.id}
                      href={notification.actionUrl || '#'}
                      className={cn(
                        "block p-4 hover:bg-gray-800/50 transition-colors",
                        !notification.read && "bg-gray-800/30"
                      )}
                      onClick={onClose}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "mt-1",
                          notificationColors[notification.type]
                        )}>
                          {notificationIcons[notification.type]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.timestamp).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-800">
                <button className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors">
                  查看全部通知
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 移动端底部导航
export function MobileBottomNav({ user }: { user: UserState }) {
  const isMobile = useIsMobile()
  
  if (!isMobile) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30">
      <div className="grid grid-cols-5 h-16">
        <BottomNavItem href="/" icon={<Home />} label="首页" />
        <BottomNavItem href="/explore" icon={<MapIcon />} label="地图" active />
        <BottomNavItem href="/assets" icon={<Package />} label="资产" badge={user.ownedPlots} />
        <BottomNavItem href="/market" icon={<ShoppingBag />} label="市场" />
        <BottomNavItem href="/profile" icon={<User />} label="我的" />
      </div>
    </div>
  )
}

// 底部导航项
function BottomNavItem({ 
  href, 
  icon, 
  label, 
  active,
  badge 
}: { 
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
}) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 relative",
        active ? "text-gold-500" : "text-gray-400"
      )}
    >
      <div className="relative">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  )
}
