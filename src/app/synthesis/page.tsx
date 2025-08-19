// src/app/synthesis/page.tsx
// 合成系统独立页面 - v1.0.0
//
// 功能说明：
// 1. 独立的合成系统路由页面
// 2. 可通过 /synthesis 直接访问
// 3. 包含完整的合成、历史记录、统计功能
// 4. 响应式设计，支持移动端
//
// 关联文件：
// - src/app/mining/SynthesisSystem.tsx: 合成系统组件
// - src/hooks/useSynthesis: 合成系统 Hooks
// - src/lib/api/synthesisApi: 合成系统 API
//
// 创建时间：2024-12-26
// 路由地址：/synthesis

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SynthesisSystem } from '@/app/mining/SynthesisSystem'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function SynthesisPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  
  // 检查登录状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/synthesis')
    }
  }, [isAuthenticated, isLoading, router])
  
  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4 inline-block"
          >
            ⏳
          </motion.div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  // 未登录状态（实际上会被重定向）
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                🔨 合成工坊
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                使用资源合成工具和材料，提升生产效率
              </p>
            </div>
            <div className="flex gap-2">
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => router.push('/mining')}
              >
                挖矿中心
              </PixelButton>
              <PixelButton
                size="sm"
                variant="secondary"
                onClick={() => router.push('/assets')}
              >
                我的资产
              </PixelButton>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* 快捷入口 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <PixelCard 
              className="p-4 text-center hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => router.push('/shop/tools')}
            >
              <div className="text-2xl mb-2">🛠️</div>
              <p className="text-sm font-bold">购买工具</p>
              <p className="text-xs text-gray-500">获取更多工具</p>
            </PixelCard>
            
            <PixelCard 
              className="p-4 text-center hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => router.push('/shop/materials')}
            >
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-bold">购买材料</p>
              <p className="text-xs text-gray-500">补充合成材料</p>
            </PixelCard>
            
            <PixelCard 
              className="p-4 text-center hover:border-green-500 transition-all cursor-pointer"
              onClick={() => window.open('https://www.pxsj.net.cn/shop/tdb', '_blank')}
            >
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm font-bold">购买TDB</p>
              <p className="text-xs text-gray-500">充值游戏币</p>
            </PixelCard>
            
            <PixelCard 
              className="p-4 text-center hover:border-yellow-500 transition-all cursor-pointer"
              onClick={() => router.push('/help/synthesis')}
            >
              <div className="text-2xl mb-2">❓</div>
              <p className="text-sm font-bold">合成指南</p>
              <p className="text-xs text-gray-500">了解合成规则</p>
            </PixelCard>
          </div>
          
          {/* 合成系统组件 */}
          <SynthesisSystem />
          
          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <PixelCard className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">合成小贴士</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• 合成高品质工具有概率获得稀有、史诗甚至传说品质</li>
                    <li>• 批量合成可以节省时间，但不会影响品质概率</li>
                    <li>• 每日首次合成有额外的幸运加成</li>
                    <li>• 完成成就可以解锁特殊合成配方</li>
                  </ul>
                </div>
              </div>
            </PixelCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
