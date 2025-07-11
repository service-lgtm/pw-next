// src/app/explore/page.tsx
// 处理 API 403 错误的世界地图页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRegions } from '@/hooks/useRegions'
import { Globe, MapPin, TrendingUp, Users, Loader2, AlertCircle, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function ExplorePage() {
  const { regions, loading, error } = useRegions({
    regionType: 'country',  // 改为获取国家级别的数据
    isActive: true,
    isOpenForSale: true,
  })
  const { isAuthenticated, user } = useAuth()  // 获取用户信息
  
  // 如果遇到认证错误，显示提示而不是错误
  const isAuthError = error && (error.includes('需要登录') || error.includes('身份认证'))
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1B] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* 顶部导航 */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-500 to-yellow-500 bg-clip-text text-transparent">
                平行世界
              </h1>
              <p className="text-sm text-gray-400 mt-1">选择您的数字地产投资区域</p>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{user.nickname || user.username}</p>
                      <p className="text-xs text-gray-400">等级 {user.level || 1}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                    >
                      控制台
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-12">
        {/* 标题区 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            开启您的全球数字地产之旅
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            探索世界各地的数字土地，把握投资机会
          </p>
        </motion.div>
        
        {/* 如果是认证错误或没有数据，显示提示 */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : error && !isAuthError ? (
          // 其他错误
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : regions.length > 0 ? (
          // 正常显示区域
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region, index) => (
              <RegionCard key={region.id} region={region} index={index} />
            ))}
          </div>
        ) : (
          // 没有数据或认证错误时显示提示
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <Globe className="w-24 h-24 text-gold-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">
                {isAuthenticated ? '暂无开放区域' : '欢迎来到平行世界'}
              </h3>
              <p className="text-gray-400 mb-8">
                {isAuthenticated 
                  ? '请稍后再来查看'
                  : '登录后可查看更多区域信息和土地详情'
                }
              </p>
              {!isAuthenticated && (
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    登录账号
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
                  >
                    立即注册
                  </Link>
                </div>
              )}
              
              {/* 预览卡片 - 仅在未登录时显示 */}
              {!isAuthenticated && (
                <div className="mt-12 grid md:grid-cols-2 gap-6">
                  <PreviewCard
                    title="中国"
                    subtitle="CHINA"
                    description="12个主要城市已开放"
                    stats={{ total: 58900, available: 12000 }}
                  />
                  <PreviewCard
                    title="新加坡"
                    subtitle="SINGAPORE"
                    description="即将开放"
                    stats={{ total: 5000, available: 0 }}
                    comingSoon
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// 预览卡片组件
function PreviewCard({ 
  title, 
  subtitle, 
  description, 
  stats,
  comingSoon = false 
}: { 
  title: string
  subtitle: string
  description: string
  stats: { total: number; available: number }
  comingSoon?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border p-6",
        comingSoon ? "border-gray-700 opacity-75" : "border-gold-500/50"
      )}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">总地块</p>
          <p className="font-bold">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">可购买</p>
          <p className="font-bold text-green-500">{stats.available.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  )
}

// 区域卡片组件
function RegionCard({ region, index }: { region: any; index: number }) {
  const isOpen = region.is_open_for_sale
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        href={isOpen ? `/explore/regions/${region.id}` : '#'}
        className={!isOpen ? 'cursor-not-allowed' : ''}
      >
        <div className={cn(
          "relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border overflow-hidden group transition-all",
          isOpen 
            ? "border-gold-500/50 hover:border-gold-500 cursor-pointer hover:scale-[1.02]" 
            : "border-gray-700 opacity-75"
        )}>
          {/* 顶部标签 */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1",
            isOpen ? "bg-gradient-to-r from-gold-500 to-yellow-500" : "bg-gray-700"
          )} />
          
          <div className="p-6">
            {/* 区域信息 */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{region.name}</h3>
                <p className="text-sm text-gray-400">{region.code}</p>
              </div>
              {isOpen ? (
                <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                  已开放
                </div>
              ) : (
                <div className="bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                  未开放
                </div>
              )}
            </div>
            
            {/* 统计数据 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <MapPin className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-lg font-bold">{region.total_lands || 0}</p>
                <p className="text-xs text-gray-400">总地块</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <TrendingUp className="w-4 h-4 text-gray-400 mb-1" />
                <p className="text-lg font-bold text-green-500">
                  {region.available_lands || 0}
                </p>
                <p className="text-xs text-gray-400">可购买</p>
              </div>
            </div>
            
            {/* 进入按钮 */}
            <div className={cn(
              "text-center py-2 rounded-lg font-medium transition-all",
              isOpen 
                ? "bg-gradient-to-r from-gold-500 to-yellow-600 text-black group-hover:shadow-lg group-hover:shadow-gold-500/25"
                : "bg-gray-700 text-gray-400"
            )}>
              {isOpen ? '进入区域' : '即将开放'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
