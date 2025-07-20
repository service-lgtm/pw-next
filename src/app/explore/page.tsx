// src/app/explore/page.tsx
// Web3 风格的探索页面 - 符合顶级 VC 审美

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRegions } from '@/hooks/useRegions'
import { Globe, MapPin, TrendingUp, Users, Loader2, AlertCircle, LogIn, Sparkles, Zap, Shield, ArrowRight, Activity, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// Logo 组件
function PixelLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="4" height="32" fill="#FFD700"></rect>
      <rect x="8" y="4" width="4" height="4" fill="#FFD700"></rect>
      <rect x="12" y="4" width="4" height="4" fill="#FFD700"></rect>
      <rect x="16" y="4" width="4" height="4" fill="#FFD700"></rect>
      <rect x="16" y="8" width="4" height="4" fill="#FFD700"></rect>
      <rect x="16" y="12" width="4" height="4" fill="#FFD700"></rect>
      <rect x="16" y="16" width="4" height="4" fill="#FFD700"></rect>
      <rect x="12" y="16" width="4" height="4" fill="#FFD700"></rect>
      <rect x="8" y="16" width="4" height="4" fill="#FFD700"></rect>
      <rect x="24" y="4" width="4" height="32" fill="#DAA520"></rect>
      <rect x="28" y="28" width="4" height="4" fill="#DAA520"></rect>
      <rect x="32" y="24" width="4" height="4" fill="#DAA520"></rect>
      <rect x="36" y="4" width="4" height="20" fill="#DAA520"></rect>
      <rect x="32" y="28" width="4" height="4" fill="#DAA520"></rect>
      <rect x="28" y="32" width="4" height="4" fill="#DAA520"></rect>
    </svg>
  )
}

export default function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // 使用 useMemo 稳定查询参数对象
  const regionsQueryParams = useMemo(() => ({
    regionType: 'country',
    isActive: true,
    isOpenForSale: true,
  }), [])
  
  // 使用正确的查询参数
  const { regions, loading, error } = useRegions(regionsQueryParams)
  
  const { isAuthenticated, user } = useAuth()
  
  // 检测是否是认证错误
  const isAuthError = error && (error.includes('需要登录') || error.includes('身份认证'))
  
  // 移动端菜单处理
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileMenu])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          </motion.div>
                      <p className="text-gray-400 font-medium">加载元宇宙中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* 动态背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* 顶部导航 - Web3 风格 */}
      <nav className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <PixelLogo />
              </motion.div>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-gold-500 to-yellow-500 bg-clip-text text-transparent">
                平行世界的字符
              </span>
            </Link>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="text-right">
                      <p className="text-xs text-gray-400">已连接</p>
                      <p className="text-sm font-bold text-white">{user.nickname || user.username}</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {user.level || 1}
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    控制台
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all flex items-center gap-2 font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    立即开始
                  </Link>
                </>
              )}
            </div>
            
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <motion.span
                  className="block w-full h-0.5 bg-white origin-center"
                  animate={{ 
                    rotate: showMobileMenu ? 45 : 0,
                    y: showMobileMenu ? 6 : 0
                  }}
                />
                <motion.span
                  className="block w-full h-0.5 bg-white"
                  animate={{ opacity: showMobileMenu ? 0 : 1 }}
                />
                <motion.span
                  className="block w-full h-0.5 bg-white origin-center"
                  animate={{ 
                    rotate: showMobileMenu ? -45 : 0,
                    y: showMobileMenu ? -6 : 0
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>
      
      {/* 移动端菜单 */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                  <PixelLogo />
                  <span className="text-xl font-black bg-gradient-to-r from-gold-500 to-yellow-500 bg-clip-text text-transparent">
                    平行世界的字符
                  </span>
                </Link>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6 space-y-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">已连接钱包</p>
                      <p className="font-bold">{user.nickname || user.username}</p>
                      <p className="text-sm text-gray-400">等级 {user.level || 1}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      控制台
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-medium"
                    >
                      <LogIn className="w-5 h-5" />
                      登录
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold"
                    >
                      立即开始
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        {/* 标题区 - Web3 风格 */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web3 数字地产
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              拥有您的专属
            </span>
            <br />
            <span className="bg-gradient-to-r from-gold-500 via-yellow-500 to-gold-500 bg-clip-text text-transparent animate-gradient">
              数字宇宙地产
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            探索、投资并建设全球首个去中心化虚拟地产生态系统。
            由真实价值支撑，区块链技术驱动。
          </p>
          
          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 max-w-4xl mx-auto">
            {[
              { label: '总区域数', value: regions.length || '0', icon: Globe },
              { label: '活跃用户', value: '5万+', icon: Users },
              { label: '锁定价值', value: '¥8,500万', icon: Shield },
              { label: '日交易量', value: '¥580万', icon: Activity },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mb-2 md:mb-3" />
                <p className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* 区域展示 */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">加载区域中...</p>
          </div>
        ) : error && !isAuthError ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : regions.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black">可用区域</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Activity className="w-4 h-4" />
                <span>实时市场数据</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {regions.map((region, index) => (
                <RegionCard 
                  key={region.id} 
                  region={region} 
                  index={index}
                  isSelected={selectedRegion === region.id}
                  onSelect={() => setSelectedRegion(region.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          // 未登录或无数据时的展示
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 md:py-20"
          >
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-8 flex items-center justify-center">
                <Globe className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black mb-4">
                {isAuthenticated ? '暂无可用区域' : '连接以探索'}
              </h3>
              
              <p className="text-gray-400 mb-8 text-lg">
                {isAuthenticated 
                  ? '新区域即将开放，敬请期待！'
                  : '登录以访问独家数字地产投资机会'
                }
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    立即开始
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
              
              {/* 特性展示 */}
              <div className="grid md:grid-cols-3 gap-6 mt-16">
                {[
                  {
                    icon: Shield,
                    title: '安全去中心化',
                    description: '基于区块链技术构建，确保最大的安全性和透明度'
                  },
                  {
                    icon: Zap,
                    title: '即时交易',
                    description: '闪电般快速的数字资产买卖和交易结算'
                  },
                  {
                    icon: TrendingUp,
                    title: '真实价值增长',
                    description: '每个土地 NFT 都由真实的经济活动和效用支撑'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                    <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* 底部 CTA */}
      {regions.length > 0 && (
        <div className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              准备开始您的旅程了吗？
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              加入数千名数字先锋，共同构建虚拟地产的未来
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              开始建设
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// 区域卡片组件 - Web3 风格
function RegionCard({ 
  region, 
  index,
  isSelected,
  onSelect
}: { 
  region: any
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const isOpen = region.is_open_for_sale
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onSelect}
    >
      <Link 
        href={isOpen ? `/explore/regions/${region.id}` : '#'}
        className={cn(
          "block h-full",
          !isOpen && "pointer-events-none"
        )}
      >
        <div className={cn(
          "relative h-full bg-gradient-to-br rounded-3xl overflow-hidden transition-all duration-300",
          isOpen 
            ? "from-white/10 to-white/5 border border-white/20 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer" 
            : "from-gray-800/50 to-gray-900/50 border border-gray-700/50 opacity-60",
          isSelected && "border-purple-500 shadow-xl shadow-purple-500/20"
        )}>
          {/* 顶部状态条 */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1",
            isOpen 
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" 
              : "bg-gray-700"
          )} />
          
          <div className="p-6 md:p-8">
            {/* 区域信息 */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
                  {region.name}
                </h3>
                <p className="text-sm text-gray-400 font-mono">{region.code}</p>
              </div>
              {isOpen ? (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-400">开放</span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-gray-700/50 rounded-full">
                  <span className="text-xs font-medium text-gray-500">即将开放</span>
                </div>
              )}
            </div>
            
            {/* 统计数据 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-gray-400">总土地</p>
                </div>
                <p className="text-xl md:text-2xl font-black text-white">
                  {region.total_lands || 0}
                </p>
              </div>
              <div className="bg-black/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">可购买</p>
                </div>
                <p className="text-xl md:text-2xl font-black text-green-400">
                  {region.available_lands || 0}
                </p>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400">售出进度</span>
                <span className="text-white font-medium">
                  {region.total_lands > 0 
                    ? Math.round(((region.total_lands - region.available_lands) / region.total_lands) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: region.total_lands > 0 
                      ? `${((region.total_lands - region.available_lands) / region.total_lands) * 100}%`
                      : '0%'
                  }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
            
            {/* 行动按钮 */}
            <div className={cn(
              "flex items-center justify-center py-3 rounded-2xl font-bold transition-all",
              isOpen 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white group-hover:shadow-lg group-hover:shadow-purple-500/25"
                : "bg-gray-800 text-gray-500"
            )}>
              {isOpen ? (
                <>
                  探索区域
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                '即将开放'
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
