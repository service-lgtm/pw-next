'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { useRouter } from 'next/navigation'

const actions = [
  { id: 'mine', label: '开始挖矿', icon: '⛏️', color: 'bg-orange-500', href: '/mining' },
  { id: 'trade', label: '交易市场', icon: '💱', color: 'bg-blue-500', href: '/market' },
  { id: 'build', label: '建造房产', icon: '🏠', color: 'bg-purple-500', href: '/assets/land' },
  { id: 'quest', label: '每日任务', icon: '📋', color: 'bg-green-500', href: '/quests' },
  { id: 'shop', label: '我的商店', icon: '🏪', color: 'bg-pink-500', href: '/shop' },
  { id: 'wallet', label: '数字钱包', icon: '👛', color: 'bg-yellow-500', href: '/wallet' },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <PixelCard className="p-6">
      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
        <span>🚀</span>
        快速操作
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(action.href)}
            className={`${action.color} p-4 rounded-lg text-white text-center hover:opacity-90 transition-all`}
          >
            <span className="text-3xl block mb-2">{action.icon}</span>
            <span className="text-sm font-bold">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </PixelCard>
  )
}
