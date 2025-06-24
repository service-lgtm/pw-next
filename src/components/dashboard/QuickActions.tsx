'use client'

import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import Link from 'next/link'

const quickActions = [
  { icon: '⛏️', label: '去挖矿', href: '/mining', color: 'bg-gray-500' },
  { icon: '🌾', label: '去种植', href: '/farming', color: 'bg-green-500' },
  { icon: '🏪', label: '开店', href: '/shop', color: 'bg-blue-500' },
  { icon: '💰', label: '交易', href: '/market', color: 'bg-gold-500' },
]

export function QuickActions() {
  return (
    <PixelCard>
      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        快捷操作
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              className={`${action.color} p-6 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-2">{action.icon}</div>
              <div className="font-bold text-white">{action.label}</div>
            </motion.div>
          </Link>
        ))}
      </div>
    </PixelCard>
  )
}
