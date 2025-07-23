// src/app/dashboard/page.tsx
// 仪表盘页面 - 更新版

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/lib/utils'
import { 
  FaChartLine, 
  FaUsers, 
  FaCoins, 
  FaTrophy,
  FaShoppingCart,
  FaClipboardList,
  FaGift,
  FaWallet
} from 'react-icons/fa'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAssets: 0,
    todayEarnings: 0,
    teamSize: 0,
    rank: 0
  })

  // 模拟数据加载
  useEffect(() => {
    // TODO: 从API加载实际数据
    setStats({
      totalAssets: 125000,
      todayEarnings: 580,
      teamSize: 42,
      rank: 156
    })
  }, [])

  const quickActions = [
    {
      icon: <FaShoppingCart className="text-3xl" />,
      title: 'TDB商城',
      description: '购买商品获得TDB积分',
      color: 'from-blue-500 to-purple-600',
      onClick: () => router.push('/shop/tdb'),
      highlight: true
    },
    {
      icon: <FaClipboardList className="text-3xl" />,
      title: '我的订单',
      description: '查看订单状态',
      color: 'from-green-500 to-teal-600',
      onClick: () => router.push('/shop/orders')
    },
    {
      icon: <FaWallet className="text-3xl" />,
      title: '我的资产',
      description: '查看资产详情',
      color: 'from-orange-500 to-red-600',
      onClick: () => router.push('/assets')
    },
    {
      icon: <FaGift className="text-3xl" />,
      title: '邀请好友',
      description: '邀请获得奖励',
      color: 'from-pink-500 to-rose-600',
      onClick: () => router.push('/invite')
    }
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 欢迎信息 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          欢迎回来，{user?.nickname || user?.username}！
        </h1>
        <p className="text-gray-400">
          今天是成功的又一天，让我们一起创造更多价值
        </p>
      </motion.div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10">
            <div className="flex items-center justify-between mb-4">
              <FaChartLine className="text-3xl text-blue-500" />
              <span className="text-xs text-green-500">+12.5%</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">总资产</p>
            <p className="text-2xl font-bold">¥{formatNumber(stats.totalAssets)}</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-green-500/10 to-teal-600/10">
            <div className="flex items-center justify-between mb-4">
              <FaCoins className="text-3xl text-green-500" />
              <span className="text-xs text-green-500">+5.8%</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">今日收益</p>
            <p className="text-2xl font-bold">¥{formatNumber(stats.todayEarnings)}</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10">
            <div className="flex items-center justify-between mb-4">
              <FaUsers className="text-3xl text-orange-500" />
              <span className="text-xs text-green-500">+3</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">团队人数</p>
            <p className="text-2xl font-bold">{formatNumber(stats.teamSize)}</p>
          </PixelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-600/10">
            <div className="flex items-center justify-between mb-4">
              <FaTrophy className="text-3xl text-pink-500" />
              <span className="text-xs text-yellow-500">Top 1%</span>
            </div>
            <p className="text-sm text-gray-400 mb-1">全球排名</p>
            <p className="text-2xl font-bold">#{formatNumber(stats.rank)}</p>
          </PixelCard>
        </motion.div>
      </div>

      {/* 快捷操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-4 text-white">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PixelCard
                className={`p-6 cursor-pointer transition-all ${
                  action.highlight 
                    ? 'border-gold-500 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-500/20' 
                    : 'hover:border-gold-500'
                }`}
                onClick={action.onClick}
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-20 inline-flex mb-4`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
                {action.highlight && (
                  <div className="mt-3">
                    <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded">
                      热门
                    </span>
                  </div>
                )}
              </PixelCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 购买TDB特别按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <div className="inline-block">
          <PixelButton
            onClick={() => router.push('/shop/tdb')}
            className="relative overflow-hidden group px-8 py-4 text-lg"
          >
            <span className="relative z-10 flex items-center gap-3">
              <FaShoppingCart className="text-xl" />
              进入TDB商城
              <span className="text-sm">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gold-600 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </PixelButton>
          <p className="text-xs text-gray-500 mt-2">购买商品，获得TDB积分奖励</p>
        </div>
      </motion.div>

      {/* 最新动态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-8"
      >
        <PixelCard className="p-6">
          <h2 className="text-xl font-bold mb-4">最新动态</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm">
                <span className="text-gray-400">10分钟前</span> - 
                您的订单 #ORDER-2024-001 已发货
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm">
                <span className="text-gray-400">2小时前</span> - 
                获得 100 TDB 积分奖励
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-sm">
                <span className="text-gray-400">昨天</span> - 
                新用户通过您的邀请码注册
              </p>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}
