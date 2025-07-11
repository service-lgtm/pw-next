// src/components/explore/MyLandsSection.tsx
// 我的土地展示区域组件

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, MapPin, TrendingUp, ChevronRight, Sparkles, Star } from 'lucide-react'
import type { Land } from '@/types/assets'
import { cn } from '@/lib/utils'

interface MyLandsSectionProps {
  lands: Land[]
  loading?: boolean
  onLandClick: (land: Land) => void
  regionName: string
}

export function MyLandsSection({
  lands,
  loading,
  onLandClick,
  regionName
}: MyLandsSectionProps) {
  console.log('[MyLandsSection] Rendering with lands:', lands.length)
  
  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (lands.length === 0) {
    console.log('[MyLandsSection] No lands to display')
    return null
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">我的土地</h2>
              <p className="text-sm text-gray-400">
                在{regionName}拥有 {lands.length} 块土地
              </p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-gold-500" />
        </div>
        
        {/* 土地卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lands.slice(0, 6).map((land, index) => (
            <motion.div
              key={land.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onLandClick(land)}
              className={cn(
                "relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4",
                "border-2 border-gold-500/30 hover:border-gold-500/60",
                "cursor-pointer transition-all hover:shadow-lg hover:shadow-gold-500/20",
                "group"
              )}
            >
              {/* 特殊标记 */}
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-black" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-white group-hover:text-gold-500 transition-colors">
                    {land.land_id}
                  </h3>
                  <p className="text-xs text-gray-400">{land.land_type_display}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>({land.coordinate_x}, {land.coordinate_y})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">当前价值</span>
                    <span className="text-gold-500 font-bold">
                      ¥{Number(land.current_price).toLocaleString()}
                    </span>
                  </div>
                  {land.transaction_count > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">交易次数</span>
                      <span className="text-xs text-gray-300">{land.transaction_count}次</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 查看更多 */}
        {lands.length > 6 && (
          <div className="mt-4 text-center">
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看全部 {lands.length} 块土地
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
        
        {/* 如果没有在当前区域的土地，显示所有土地 */}
        {lands.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">您在{regionName}暂无土地</p>
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看所有土地
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
