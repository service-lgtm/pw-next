'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'

interface StatItem {
  label: string
  value: string | number
  icon: string
  change?: number
  unit?: string
}

export function QuickStats() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: '总资产', value: 125000, icon: '💰', change: 5.2, unit: 'TDB' },
    { label: '今日收益', value: 520, icon: '📈', change: 12.5, unit: 'TDB' },
    { label: '活跃任务', value: 5, icon: '⚡', unit: '个' },
    { label: '排名', value: 1286, icon: '🏆', change: -15 },
  ])

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => {
        if (stat.label === '今日收益') {
          return { ...stat, value: Number(stat.value) + Math.floor(Math.random() * 10) }
        }
        return stat
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PixelCard className="p-4 hover:border-gold-500 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <motion.p
                  className="text-2xl font-black text-white"
                  key={stat.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                </motion.p>
                {stat.change !== undefined && (
                  <p className={`text-xs mt-1 ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </p>
                )}
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </PixelCard>
        </motion.div>
      ))}
    </div>
  )
}
