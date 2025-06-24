'use client'

import { motion } from 'framer-motion'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { TaskProgress } from '@/components/dashboard/TaskProgress'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'

// 用户数据接口
interface UserData {
  username: string
  level: string
  todayEarnings: number
  totalAssets: number
  tasks: Task[]
}

interface Task {
  id: string
  type: 'mining' | 'farming' | 'building'
  name: string
  progress: number
  timeLeft: string
  reward: string
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData>({
    username: '数字公民',
    level: '木星',
    todayEarnings: 520,
    totalAssets: 125000,
    tasks: [
      { id: '1', type: 'mining', name: '铁矿开采中', progress: 80, timeLeft: '1小时', reward: '100铁矿' },
      { id: '2', type: 'farming', name: '小麦种植中', progress: 60, timeLeft: '2小时', reward: '50粮食' },
      { id: '3', type: 'building', name: '房屋建设中', progress: 30, timeLeft: '3.5小时', reward: '1栋房产' },
    ]
  })

  // 实时更新任务进度
  useEffect(() => {
    const interval = setInterval(() => {
      setUserData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => ({
          ...task,
          progress: Math.min(100, task.progress + 1)
        }))
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
            等级：<span className="text-gold-500 font-bold">{userData.level}</span> | 
            今日收益：<span className="text-green-500 font-bold">+{userData.todayEarnings}</span>
          </p>
        </div>

        {/* 快速操作按钮 */}
        <div className="flex gap-2">
          <motion.button
            className="px-4 py-2 bg-gold-500 text-black font-bold rounded hover:bg-gold-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            每日签到
          </motion.button>
          <motion.button
            className="px-4 py-2 border-2 border-gold-500 text-gold-500 font-bold rounded hover:bg-gold-500 hover:text-black transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            领取奖励
          </motion.button>
        </div>
      </motion.div>

      {/* 快速统计 */}
      <QuickStats />

      {/* 主要内容区 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧 - 任务进度 */}
        <div className="lg:col-span-2 space-y-6">
          <TaskProgress tasks={userData.tasks} />
          
          {/* 快速行动区 */}
          <QuickActions />
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
                <p className="text-sm text-gold-500 font-bold">新活动上线</p>
                <p className="text-xs text-gray-400 mt-1">
                  春节挖矿双倍收益活动开始！
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-blue-500 font-bold">系统维护</p>
                <p className="text-xs text-gray-400 mt-1">
                  今晚22:00-23:00系统维护
                </p>
              </div>
            </div>
          </PixelCard>

          {/* 排行榜 */}
          <PixelCard className="p-6">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              财富排行
            </h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: '王*明', value: '¥2,580,000', medal: '🥇' },
                { rank: 2, name: '李*华', value: '¥1,680,000', medal: '🥈' },
                { rank: 3, name: '张*丽', value: '¥1,280,000', medal: '🥉' },
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.medal}</span>
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="text-gold-500 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-gold-500 hover:underline">
              查看完整排行 →
            </button>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}
