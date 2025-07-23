// src/app/dashboard/page.tsx
// 仪表盘页面 - 使用真实API数据

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [teamSummary, setTeamSummary] = useState<{
    total_members: number
    total_performance: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载团队数据
  useEffect(() => {
    const loadTeamSummary = async () => {
      try {
        const response = await api.accounts.getTeamSummary()
        if (response.success && response.data) {
          setTeamSummary(response.data)
        }
      } catch (error) {
        console.error('加载团队数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTeamSummary()
  }, [])

  // 获取TDB和YLD余额
  const tdbBalance = user?.tdb_balance ? parseFloat(user.tdb_balance) : (user?.tdbBalance || 0)
  const yldBalance = user?.yld_balance ? parseFloat(user.yld_balance) : (user?.yldBalance || 0)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 欢迎信息 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
          欢迎回来，{user?.nickname || user?.username}！
        </h1>
        <p className="text-gray-400">
          探索平行世界，创造无限可能
        </p>
      </motion.div>

      {/* 资产卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* TDB余额 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-gold-500/10 to-yellow-600/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">💰</div>
            </div>
            <p className="text-sm text-gray-400 mb-1">TDB积分</p>
            <p className="text-2xl font-bold text-gold-500">{formatNumber(tdbBalance)}</p>
          </PixelCard>
        </motion.div>

        {/* 黄金(YLD)余额 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🪙</div>
            </div>
            <p className="text-sm text-gray-400 mb-1">黄金(YLD)</p>
            <p className="text-2xl font-bold text-yellow-500">{formatNumber(yldBalance)}</p>
          </PixelCard>
        </motion.div>

        {/* 团队人数 */}
        {teamSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PixelCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">👥</div>
              </div>
              <p className="text-sm text-gray-400 mb-1">团队人数</p>
              <p className="text-2xl font-bold">{formatNumber(teamSummary.total_members)}</p>
            </PixelCard>
          </motion.div>
        )}
      </div>

      {/* 快捷操作 - 保持原有的6个入口 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-4 text-white">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* 购买土地 */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer"
            onClick={() => router.push('/lands')}
          >
            <div className="text-3xl mb-3">🏞️</div>
            <h3 className="font-bold">购买土地</h3>
            <p className="text-sm text-gray-400 mt-1">投资虚拟地产</p>
          </PixelCard>

          {/* 生产管理 */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer"
            onClick={() => router.push('/production')}
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-bold">生产管理</h3>
            <p className="text-sm text-gray-400 mt-1">管理土地生产</p>
          </PixelCard>

          {/* 购买TDB */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer border-gold-500/50"
            onClick={() => router.push('/shop/tdb')}
          >
            <div className="text-3xl mb-3">🛍️</div>
            <h3 className="font-bold">购买TDB</h3>
            <p className="text-sm text-gray-400 mt-1">获取积分</p>
            <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded mt-2 inline-block">
              热门
            </span>
          </PixelCard>

          {/* 查看区域 */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer"
            onClick={() => router.push('/explore/regions')}
          >
            <div className="text-3xl mb-3">🗺️</div>
            <h3 className="font-bold">查看区域</h3>
            <p className="text-sm text-gray-400 mt-1">探索世界地图</p>
          </PixelCard>

          {/* 邀请好友 */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer"
            onClick={() => router.push('/invite')}
          >
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold">邀请好友</h3>
            <p className="text-sm text-gray-400 mt-1">获得奖励</p>
          </PixelCard>

          {/* 排行榜 */}
          <PixelCard
            className="p-6 hover:border-gold-500 transition-all cursor-pointer"
            onClick={() => router.push('/leaderboard')}
          >
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold">排行榜</h3>
            <p className="text-sm text-gray-400 mt-1">查看排名</p>
          </PixelCard>
        </div>
      </motion.div>

      {/* 商城入口按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex gap-4">
          <PixelButton
            onClick={() => router.push('/shop/tdb')}
            className="px-6 py-3"
          >
            进入TDB商城
          </PixelButton>
          <PixelButton
            onClick={() => router.push('/shop/orders')}
            variant="secondary"
            className="px-6 py-3"
          >
            我的订单
          </PixelButton>
        </div>
      </motion.div>

      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PixelCard className="p-6">
          <h2 className="text-xl font-bold mb-4">账户信息</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">基本信息</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">用户名</span>
                  <span>{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">昵称</span>
                  <span>{user?.nickname || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">等级</span>
                  <span className="text-gold-500">{user?.level_name || `Lv.${user?.level || 1}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">邀请码</span>
                  <span className="font-mono">{user?.referral_code || '-'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-400 mb-2">团队信息</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">直推人数</span>
                  <span>{user?.direct_referrals_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">团队总人数</span>
                  <span>{teamSummary?.total_members || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">团队业绩</span>
                  <span className="text-green-500">
                    {teamSummary?.total_performance || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">推荐人</span>
                  <span>{user?.referrer_nickname || '无'}</span>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}
