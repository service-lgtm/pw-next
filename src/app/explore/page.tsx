/**
 * 文件: /src/app/explore/page.tsx
 * 描述: Web3 风格的探索页面 - 创世土地高端营销版
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRegions } from '@/hooks/useRegions'
import {
  Globe, MapPin, TrendingUp, Users, Loader2, AlertCircle, LogIn,
  Sparkles, Zap, Shield, ArrowRight, Activity, ChevronRight, X,
  Timer, Gift, Star, Trophy, Crown, Gem, Infinity
} from 'lucide-react'
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

  const regionsQueryParams = useMemo(() => ({
    regionType: 'country',
    isActive: true,
    isOpenForSale: true,
  }), [])

  const { regions, loading, error } = useRegions(regionsQueryParams)
  const { isAuthenticated, user } = useAuth()

  const isAuthError = error && (error.includes('需要登录') || error.includes('身份认证'))

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

      {/* 顶部导航 */}
      <nav className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/dashboard" className="flex items-center gap-3 group z-10">
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

      {/* 创世土地优雅横幅 */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900/30 to-gray-900 overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
              <div className="px-6 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-gold-500/30">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-medium text-gold-400 tracking-wider uppercase">
                    Genesis Collection
                  </span>
                  <Crown className="w-4 h-4 text-gold-500" />
                </div>
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black mb-4 tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                创世纪元
              </span>
              <span className="text-gray-400 mx-3">·</span>
              <span className="bg-gradient-to-r from-gold-400 via-yellow-400 to-gold-400 bg-clip-text text-transparent">
                限量发行
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            >
              首批数字地产现已开放，每一块土地都将成为历史的见证
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-center gap-4"
            >
              <div className="px-4 py-2 bg-purple-600/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-400 uppercase tracking-wider">Exclusive Access</p>
                <p className="text-sm font-bold text-white">创世特权</p>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="px-4 py-2 bg-purple-600/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-400 uppercase tracking-wider">Limited Edition</p>
                <p className="text-sm font-bold text-white">限量版本</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-12 md:py-20">
        {/* 标题区 - 优雅简约 */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/30 backdrop-blur-sm rounded-full border border-purple-500/20 mb-8"
          >
            <Infinity className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300 tracking-wide">
              永恒价值 · 无限可能
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent mb-2">
              拥有您的
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              数字宇宙
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            在虚拟与现实的交汇处，开启属于您的数字资产之旅
          </p>
        </motion.div>

        {/* 价值主张 - 优雅展示 */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">创世身份</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                成为首批开拓者，您的名字将永载史册
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gem className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-bold text-lg mb-2">稀缺资产</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                限量发行，每一份都独一无二
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">永恒保障</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                区块链技术确保资产永久安全
              </p>
            </div>
          </motion.div>
        </div>

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">探索可用区域</h2>
                <p className="text-gray-400">选择您的数字领地</p>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-700">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">实时数据</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  ? '新区域即将开放，敬请期待'
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
            </div>
          </motion.div>
        )}
      </div>

      {/* 底部 CTA - 优雅简约 */}
      {regions.length > 0 && (
        <div className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  开启您的数字未来
                </span>
              </h2>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                加入创世先锋行列，共同见证虚拟世界的崛起
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
                >
                  <span>开始探索</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 text-gray-300 hover:text-white transition-colors"
                >
                  了解更多
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

// 区域卡片组件 - 优雅设计
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
          "relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden transition-all duration-300 group",
          isOpen
            ? "border border-gray-700 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
            : "border border-gray-800 opacity-60",
          isSelected && "border-purple-500 shadow-xl shadow-purple-500/20"
        )}>
          {/* 创世标识 - 优雅版 */}
          {isOpen && (
            <div className="absolute top-4 right-4 z-10">
              <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-purple-500/30">
                <div className="flex items-center gap-1.5 text-xs">
                  <Star className="w-3 h-3 text-purple-400" />
                  <span className="font-medium text-purple-300">Genesis</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* 区域信息 */}
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                {region.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono">{region.code}</p>
            </div>

            {/* 统计数据 - 简约展示 */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">总量</span>
                <span className="font-bold text-white">{region.total_lands || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">可用</span>
                <span className="font-bold text-green-400">{region.available_lands || 0}</span>
              </div>

              {/* 进度条 */}
              <div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
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
            </div>

            {/* 限量标识 */}
            {isOpen && region.available_lands > 0 && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 rounded-lg border border-purple-500/20">
                  <Gem className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300">限量发行</span>
                </div>
              </div>
            )}

            {/* 行动按钮 */}
            <div className={cn(
              "flex items-center justify-center py-3 rounded-xl font-bold transition-all",
              isOpen
                ? "bg-white text-black group-hover:bg-gray-100"
                : "bg-gray-800 text-gray-500"
            )}>
              {isOpen ? (
                <>
                  进入探索
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
