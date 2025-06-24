'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface StatItem {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: string
  color: string
}

export function QuickStats() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      label: 'TDB余额',
      value: 10000,
      change: '+2.5%',
      trend: 'up',
      icon: '🪙',
      color: 'text-gold-500'
    },
    {
      label: 'YLD余额',
      value: 5000,
      change: '+5.2%',
      trend: 'up',
      icon: '💎',
      color: 'text-purple-500'
    },
    {
      label: 'NFT资产',
      value: 25,
      change: '价值5万',
      trend: 'up',
      icon: '🎨',
      color: 'text-blue-500'
    },
    {
      label: '今日收益',
      value: 520,
      change: '环比+8%',
      trend: 'up',
      icon: '📈',
      color: 'text-green-500'
    }
  ])

  // 数值动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: typeof stat.value === 'number' 
          ? stat.value + Math.floor(Math.random() * 10) 
          : stat.value
      })))
    }, 5000)
    return () => clearTimeout(timer)
  }, [stats])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <PixelCard className="p-4 hover:border-gold-500 transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                stat.trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              )}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <motion.div
                key={stat.value}
                className={cn("text-2xl font-black", stat.color)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </motion.div>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          </PixelCard>
        </motion.div>
      ))}
    </div>
  )
}
