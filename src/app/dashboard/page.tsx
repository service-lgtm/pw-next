'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tdbBalance, setTdbBalance] = useState(user?.tdbBalance || 0)

  // 模拟TDB余额更新效果
  useEffect(() => {
    setTdbBalance(user?.tdbBalance || 0)
  }, [user?.tdbBalance])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          欢迎回到<span className="text-gold-500">平行世界</span>
        </h1>
        <p className="text-gray-400 mt-2">
          在这里开启您的数字资产之旅
        </p>
      </motion.div>

      {/* TDB 资产卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6 md:p-8 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">💎</span>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">我的TDB资产</p>
                <motion.p
                  className="text-3xl md:text-4xl font-black text-gold-500"
                  key={tdbBalance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {tdbBalance.toLocaleString()}
                  <span className="text-lg ml-2">TDB</span>
                </motion.p>
              </div>
            </div>
            
            {/* 资产趋势指示 */}
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 mb-1">资产状态</p>
              <p className="text-green-500 font-bold">稳定增长中</p>
            </div>
          </div>
        </PixelCard>
      </motion.div>

      {/* 土地资产入口 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-black text-white mb-4">快速入口</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* 土地资产卡片 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/assets/land')}
            className="text-left"
          >
            <PixelCard className="p-6 hover:border-gold-500 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🏞️</span>
                    <h3 className="text-lg font-black">土地资产</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    管理您的数字土地，开发建设，创造价值
                  </p>
                  <div className="flex items-center gap-2 text-gold-500">
                    <span className="text-sm font-bold">立即查看</span>
                    <span>→</span>
                  </div>
                </div>
                <div className="text-4xl opacity-20">🏗️</div>
              </div>
            </PixelCard>
          </motion.button>

          {/* 即将开放卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PixelCard className="p-6 opacity-60 cursor-not-allowed">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🔒</span>
                    <h3 className="text-lg font-black">更多功能</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    挖矿、交易、任务等功能即将开放
                  </p>
                  <div className="text-sm text-gray-500">
                    敬请期待...
                  </div>
                </div>
                <div className="text-4xl opacity-20">⏳</div>
              </div>
            </PixelCard>
          </motion.div>
        </div>
      </motion.div>

      {/* 新手引导 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <PixelCard className="p-6 bg-gold-500/10 border-gold-500/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-bold text-gold-500 mb-2">新手提示</h3>
              <p className="text-sm text-gray-300">
                欢迎来到平行世界！您可以先查看您的土地资产，了解如何在这个数字世界中创造价值。
                TDB是平行世界的通用数字货币，可用于购买土地、建设开发等各种用途。
              </p>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}
