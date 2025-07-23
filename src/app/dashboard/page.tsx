// src/app/dashboard/page.tsx
// 仪表盘页面 - 基于正确版本

'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError } from '@/lib/api'
import toast from 'react-hot-toast'

// 用户数据接口
interface UserProfile {
  username: string
  nickname: string
  level: number
  level_name: string
  level_color: string
  ut_assets: string
  ap_points: string
  tdb_balance?: string
  yld_balance?: string
  tdbBalance?: number
  yldBalance?: number
  energy?: number
  direct_referrals_count: number
  total_referrals_count: number
  community_performance: string
  is_activated: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, checkAuth, isAuthenticated, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  // 获取用户最新资料
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // 获取最新的个人资料
        const response = await api.accounts.profile()
        console.log('[Dashboard] Profile response:', response)
        
        if (response.success && response.data) {
          setProfileData(response.data)
        } else {
          throw new Error('获取用户资料失败')
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching profile:', error)
        
        // 如果是认证错误，跳转到登录页
        if (error instanceof ApiError && error.status === 401) {
          toast.error('登录已过期，请重新登录')
          router.push('/login?redirect=/dashboard')
        } else {
          setError('加载用户资料失败，请刷新页面重试')
        }
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, router])

  // 如果正在检查认证状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，返回空（useEffect 会处理跳转）
  if (!isAuthenticated) {
    return null
  }

  // 如果正在加载
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果有错误
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gold-500 text-black font-bold rounded hover:bg-gold-400"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  // 使用 profileData 或 user 数据
  const displayData = profileData || user
  const tdbBalance = profileData?.tdb_balance ? parseFloat(profileData.tdb_balance) : (user?.tdbBalance || 0)
  const yldBalance = profileData?.yld_balance ? parseFloat(profileData.yld_balance) : (user?.yldBalance || 0)

  const userData = {
    username: displayData?.nickname || displayData?.username || '数字公民',
    level: displayData?.level_name || `等级 ${displayData?.level || 1}`,
    todayEarnings: 0, // 暂不开放
    totalAssets: tdbBalance,
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            欢迎回来，<span className="text-gold-500">{userData.username}</span>！
          </h1>
          <p className="text-gray-400 mt-1">
            等级：<span className="text-gold-500 font-bold" style={{ color: displayData?.level_color }}>
              {userData.level}
            </span>
          </p>
        </div>

        {/* 快速操作按钮 - 暂时隐藏 */}
        <div className="flex gap-2">
          <motion.button
            className="px-4 py-2 bg-gray-700 text-gray-400 font-bold rounded cursor-not-allowed opacity-50"
            disabled
          >
            每日签到（即将开放）
          </motion.button>
        </div>
      </motion.div>

      {/* 积分卡片 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* TDB 卡片 - 黄金通证 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-gold-500/10 to-yellow-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">黄金通证(TDB)</p>
                <p className="text-3xl font-black text-gold-500">
                  {tdbBalance.toLocaleString()}
                  <span className="text-sm ml-2">TDB</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">≈ 0.01克黄金/枚</p>
              </div>
              <span className="text-5xl opacity-30">💎</span>
            </div>
          </PixelCard>
        </motion.div>

        {/* YLD 卡片 - 黄金 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">黄金(YLD)</p>
                <p className="text-3xl font-black text-purple-500">
                  {yldBalance.toLocaleString()}
                  <span className="text-sm ml-2">YLD</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">治理币·限量21亿</p>
              </div>
              <span className="text-5xl opacity-30">⚡</span>
            </div>
          </PixelCard>
        </motion.div>
      </div>

      {/* 账户状态卡片 */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-2xl font-black text-green-500">
              {displayData?.energy || 100}%
            </p>
            <p className="text-sm text-gray-400 mt-1">能量值</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <PixelCard className="p-4 text-center">
            <p className="text-2xl font-black text-blue-500">
              {displayData?.direct_referrals_count || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">直推人数</p>
          </PixelCard>
        </motion.div>
      </div>

      {/* 主要内容区 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧 - 快速入口 */}
        <div className="lg:col-span-2 space-y-6">
          <PixelCard className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>🚀</span>
              快速入口
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 购买土地 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/explore')}
                className="bg-green-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">🏞️</span>
                <span className="text-sm font-bold">购买土地</span>
              </motion.button>

              {/* 生产管理 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/production')}
                className="bg-blue-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">⚙️</span>
                <span className="text-sm font-bold">生产管理</span>
              </motion.button>

              {/* 购买TDB */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/shop/tdb')}
                className="bg-gold-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all relative"
              >
                <span className="text-3xl block mb-2">🛍️</span>
                <span className="text-sm font-bold">购买TDB</span>
                <span className="absolute top-1 right-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                  热门
                </span>
              </motion.button>

              {/* 查看区域 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/explore')}
                className="bg-purple-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">🗺️</span>
                <span className="text-sm font-bold">查看区域</span>
              </motion.button>

              {/* 邀请好友 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/referral')}
                className="bg-pink-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">🎁</span>
                <span className="text-sm font-bold">邀请好友</span>
              </motion.button>

              {/* 我的资产 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/assets')}
                className="bg-orange-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">💰</span>
                <span className="text-sm font-bold">我的资产</span>
              </motion.button>
            </div>
          </PixelCard>

          {/* 商城入口 */}
          <PixelCard className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>🛍️</span>
              商城入口
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/shop/tdb')}
                className="p-4 bg-gradient-to-r from-gold-500/20 to-yellow-600/20 rounded-lg hover:from-gold-500/30 hover:to-yellow-600/30 transition-all"
              >
                <span className="text-2xl block mb-2">💰</span>
                <span className="text-sm font-bold">TDB商城</span>
                <p className="text-xs text-gray-400 mt-1">购买商品获得黄金通证</p>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/shop/orders')}
                className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg hover:from-blue-500/30 hover:to-purple-600/30 transition-all"
              >
                <span className="text-2xl block mb-2">📋</span>
                <span className="text-sm font-bold">我的订单</span>
                <p className="text-xs text-gray-400 mt-1">查看订单状态</p>
              </motion.button>
            </div>
          </PixelCard>
        </div>

        {/* 右侧 - 通知和活动 */}
        <div className="space-y-6">
          {/* 系统公告 */}
          <PixelCard className="p-6">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="text-2xl">📢</span>
              系统公告
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-gold-500 font-bold">TDB商城正式上线</p>
                <p className="text-xs text-gray-400 mt-1">
                  购买实物商品，获得黄金通证奖励！
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-purple-500 font-bold">土地资产系统</p>
                <p className="text-xs text-gray-400 mt-1">
                  虚拟地产投资，创造无限价值
                </p>
              </div>
            </div>
          </PixelCard>

          {/* 提示信息 */}
          <PixelCard className="p-6 bg-gold-500/10 border-gold-500/30">
            <h3 className="text-lg font-black mb-2 text-gold-500">
              💡 新手提示
            </h3>
            <p className="text-sm text-gray-300">
              欢迎来到平行世界！黄金通证(TDB)是稳定交易币，黄金(YLD)是治理代币，土地是您的核心资产。
            </p>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}
