// src/components/explore/LandCard.tsx
// 土地卡片组件 - 创世土地4折优惠版

'use client'

import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Building2, Lock, Coins, Zap, Timer, Percent } from 'lucide-react'
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
  
  // 计算原价（当前价格是4折后的价格）
  const discountedPrice = typeof land.current_price === 'string' ? parseFloat(land.current_price) : land.current_price
  const originalPrice = discountedPrice / 0.4  // 原价 = 折扣价 / 0.4
  const savedAmount = originalPrice - discountedPrice
  
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
      {/* 创世土地标识 */}
      {isAvailable && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-1.5 animate-gradient">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-white">
            <Zap className="w-3 h-3" />
            <span>创世土地 · 限时4折</span>
            <Zap className="w-3 h-3" />
          </div>
        </div>
      )}
      
      {/* 折扣角标 */}
      {isAvailable && (
        <div className="absolute top-8 right-2 z-10">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
          >
            -60% OFF
          </motion.div>
        </div>
      )}
      
      {/* 类型背景 */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", bgGradient)} />
      
      {/* 内容 */}
      <div className="relative p-4 pt-12">
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
        
        {/* 价格 - 创世土地特殊展示 */}
        <div className="pt-3 border-t border-gray-700">
          {isAvailable ? (
            <div>
              {/* 原价 */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">原价</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(originalPrice)} TDB
                  </p>
                </div>
              </div>
              
              {/* 现价 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-400 font-bold">创世优惠价</p>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-gold-500" />
                    <p className="text-xl font-bold text-gold-500">
                      {formatPrice(discountedPrice)}
                    </p>
                    <span className="text-xs text-gold-400">TDB</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    立省{formatPrice(savedAmount)}
                  </div>
                </div>
              </div>
              
              {/* 限时标识 */}
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-orange-400">
                <Timer className="w-3 h-3 animate-pulse" />
                <span>限时抢购中</span>
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
