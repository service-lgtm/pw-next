// 文件路径: src/app/dashboard/page.tsx
// 文件名: page.tsx
// 功能: 仪表盘首页

'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

// 用户数据接口（如果原文件中有，保留原有的）
interface UserData {
  username: string
  level: string
  todayEarnings: number
  totalAssets: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData>({
    username: user?.nickname || user?.username || '数字公民',
    level: '木星',
    todayEarnings: 0, // 暂不开放
    totalAssets: user?.tdbBalance || 0,
  })

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
            等级：<span className="text-gold-500 font-bold">{userData.level}</span>
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
        {/* TDB 卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-gold-500/10 to-yellow-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">TDB积分</p>
                <p className="text-3xl font-black text-gold-500">
                  {user?.tdbBalance?.toLocaleString() || '0'}
                  <span className="text-sm ml-2">TDB</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">≈ 0.01克黄金/枚</p>
              </div>
              <span className="text-5xl opacity-30">💎</span>
            </div>
          </PixelCard>
        </motion.div>

        {/* YLD 卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <PixelCard className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">YLD积分</p>
                <p className="text-3xl font-black text-purple-500">
                  {user?.yldBalance?.toLocaleString() || '0'}
                  <span className="text-sm ml-2">YLD</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">治理币·限量21亿</p>
              </div>
              <span className="text-5xl opacity-30">⚡</span>
            </div>
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
              {/* 资产总览 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/assets')}
                className="bg-gold-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">💰</span>
                <span className="text-sm font-bold">资产总览</span>
              </motion.button>

              {/* 土地资产 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/assets/land')}
                className="bg-green-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">🏞️</span>
                <span className="text-sm font-bold">土地资产</span>
              </motion.button>

              {/* 探索世界 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/explore')}
                className="bg-blue-500 p-4 rounded-lg text-white text-center hover:opacity-90 transition-all"
              >
                <span className="text-3xl block mb-2">🗺️</span>
                <span className="text-sm font-bold">探索世界</span>
              </motion.button>

              {/* 未开放功能 */}
              <motion.button
                disabled
                className="bg-gray-700 p-4 rounded-lg text-gray-400 text-center cursor-not-allowed opacity-50"
              >
                <span className="text-3xl block mb-2">⛏️</span>
                <span className="text-sm font-bold">开始挖矿</span>
              </motion.button>

              <motion.button
                disabled
                className="bg-gray-700 p-4 rounded-lg text-gray-400 text-center cursor-not-allowed opacity-50"
              >
                <span className="text-3xl block mb-2">💱</span>
                <span className="text-sm font-bold">交易市场</span>
              </motion.button>

              <motion.button
                disabled
                className="bg-gray-700 p-4 rounded-lg text-gray-400 text-center cursor-not-allowed opacity-50"
              >
                <span className="text-3xl block mb-2">📋</span>
                <span className="text-sm font-bold">每日任务</span>
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
                <p className="text-sm text-gold-500 font-bold">平行世界正式上线</p>
                <p className="text-xs text-gray-400 mt-1">
                  土地资产系统已开放，快去探索吧！
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-purple-500 font-bold">TDB & YLD 积分系统</p>
                <p className="text-xs text-gray-400 mt-1">
                  稳定币和治理币已正式启用
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
              欢迎来到平行世界！您可以查看资产总览，管理您的数字资产。
              TDB是稳定交易币，YLD是治理代币，土地是您的核心资产。
            </p>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}
