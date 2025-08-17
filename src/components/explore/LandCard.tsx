// src/components/explore/LandCard.tsx
// 土地卡片组件 - 使用TDB单位

'use client'

import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Building2, Lock, Coins } from 'lucide-react'
import type { Land } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandCardProps {
  land: Land
  onClick: () => void
}

const landTypeColors = {
  urban: 'from-blue-500/20 to-cyan-500/20',
  farm: 'from-green-500/20 to-emerald-500/20',
  iron_mine: 'from-gray-500/20 to-slate-500/20',
  stone_mine: 'from-stone-500/20 to-amber-500/20',
  forest: 'from-green-600/20 to-teal-600/20',
  yld_mine: 'from-purple-500/20 to-pink-500/20',
}

const landTypeIcons = {
  urban: Building2,
  farm: '🌾',
  iron_mine: '⛏️',
  stone_mine: '🪨',
  forest: '🌲',
  yld_mine: '💎',
}

export function LandCard({ land, onClick }: LandCardProps) {
  const isAvailable = land.status === 'unowned'
  const bgGradient = landTypeColors[land.land_type as keyof typeof landTypeColors] || landTypeColors.urban
  
  // 格式化价格
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border overflow-hidden cursor-pointer transition-all",
        isAvailable ? "border-green-500/50 hover:border-green-500" : "border-gray-700"
      )}
    >
      {/* 类型背景 */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", bgGradient)} />
      
      {/* 内容 */}
      <div className="relative p-4">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">{land.land_id}</h3>
            <p className="text-xs text-gray-400">{land.land_type_display}</p>
          </div>
          <div className="text-2xl">
            {typeof landTypeIcons[land.land_type as keyof typeof landTypeIcons] === 'string' 
              ? landTypeIcons[land.land_type as keyof typeof landTypeIcons]
              : <Building2 className="w-6 h-6 text-gray-400" />
            }
          </div>
        </div>
        
        {/* 信息 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>{land.region_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>坐标: ({land.coordinate_x}, {land.coordinate_y})</span>
          </div>
        </div>
        
        {/* 价格 - 使用TDB */}
        <div className="pt-3 border-t border-gray-700">
          {isAvailable ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">当前价格</p>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-gold-500" />
                  <p className="text-lg font-bold text-gold-500">
                    {formatPrice(land.current_price)}
                  </p>
                  <span className="text-xs text-gold-400">TDB</span>
                </div>
              </div>
              <div className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                可购买
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">所有者</p>
                <p className="text-sm font-medium">{land.owner_username || '未知'}</p>
              </div>
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
