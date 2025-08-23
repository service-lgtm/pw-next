// src/components/explore/MyLandsSection.tsx
// 我的土地展示区域组件 - 修复版本

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'  // 添加这行
import { Crown, MapPin, TrendingUp, ChevronRight, Sparkles, Star, Coins } from 'lucide-react'
import type { Land } from '@/types/assets'
import { cn } from '@/lib/utils'

interface MyLandsSectionProps {
  lands: any[]  // 改为 any[] 以兼容不同的数据结构
  loading?: boolean
  onLandClick?: (land: any) => void  // 改为可选
  regionName: string
}

export function MyLandsSection({
  lands,
  loading,
  onLandClick,  // 保留以保持向后兼容
  regionName
}: MyLandsSectionProps) {
  const router = useRouter()  // 添加 router
  
  console.log('[MyLandsSection] Rendering with lands:', lands)
  
  // 验证数据完整性
  const validLands = lands?.filter(land => land && land.id) || []
  console.log('[MyLandsSection] Valid lands:', validLands)
  
  // 格式化价格
  const formatPrice = (price: string | number | undefined | null) => {
    if (!price) return '0'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  // 新的点击处理函数
  const handleLandClick = (land: any) => {
    console.log('[MyLandsSection] Land clicked:', land)
    // 验证数据完整性
    if (land && land.id) {
      // 如果传入了 onLandClick，仍然调用它（向后兼容）
      if (onLandClick) {
        onLandClick(land)
      }
      // 导航到土地详情页
      router.push(`/land/${land.id}`)
    } else {
      console.error('[MyLandsSection] Invalid land data:', land)
    }
  }
  
  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={`skeleton-${i}`} className="h-32 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (validLands.length === 0) {
    console.log('[MyLandsSection] No valid lands to display')
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
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
        </div>
      </motion.div>
    )
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
                在{regionName}拥有 {validLands.length} 块土地
              </p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-gold-500" />
        </div>
        
        {/* 土地卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validLands.slice(0, 6).map((land, index) => {
            // 确保每个土地都有唯一的key
            const uniqueKey = `land-${land.id || index}-${land.land_id || index}`
            
            return (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleLandClick(land)}  // 使用新的处理函数
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
                      {land.land_id || `土地 #${land.id}`}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {/* 兼容两种数据结构 */}
                      {land.land_type_display || land.blueprint?.land_type_display || '未知类型'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>({land.coordinate_x || 0}, {land.coordinate_y || 0})</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">当前价值</span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-gold-500" />
                        <span className="text-gold-500 font-bold">
                          {formatPrice(land.current_price)}
                        </span>
                        <span className="text-xs text-gold-400">TDB</span>
                      </div>
                    </div>
                    {land.transaction_count && land.transaction_count > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">交易次数</span>
                        <span className="text-xs text-gray-300">{land.transaction_count}次</span>
                      </div>
                    )}
                    {/* 添加区域显示 */}
                    {land.region?.name && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">所在区域</span>
                        <span className="text-xs text-gray-300">{land.region.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* 查看更多 */}
        {validLands.length > 6 && (
          <div className="mt-4 text-center">
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              查看全部 {validLands.length} 块土地
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
