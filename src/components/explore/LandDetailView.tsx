// src/components/explore/LandDetailView.tsx
// 安全版本 - 移除可能导致问题的 toast 组件

'use client'

import { motion } from 'framer-motion'
import { Coins, Gift, Pickaxe, Wheat, Shield, Star, Zap, Loader2, Building2, MapPin, Hash } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assetsApi } from '@/lib/api/assets'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface LandDetailViewProps {
  land: LandDetail
  onPurchaseSuccess?: () => void
}

// 赠品配置
const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包' },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包' },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包' },
  forest: { tools: '专属工具×1', food: '基础粮食包' },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包' },
}

export function LandDetailView({ land, onPurchaseSuccess }: LandDetailViewProps) {
  const { user } = useAuth()
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 安全的价格格式化函数
  const formatPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined) return '0'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0' : Math.floor(numPrice).toLocaleString('zh-CN')
  }

  // 安全的日期格式化函数
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—'
    
    try {
      // 处理可能的日期格式问题
      const normalizedDate = dateStr.replace(' ', 'T')
      const date = new Date(normalizedDate)
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateStr)
        return '—'
      }
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateStr)
      return '—'
    }
  }

  // 购买逻辑（不使用 toast）
  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (!land) return

    setPurchasing(true)
    setPurchaseMessage(null)

    try {
      const response = await assetsApi.lands.buy({ land_id: land.id })
      if (response.success) {
        setPurchaseMessage({ type: 'success', text: '购买成功！' })
        setTimeout(() => {
          onPurchaseSuccess?.()
        }, 1500)
      } else {
        setPurchaseMessage({ type: 'error', text: response.message || '购买失败' })
      }
    } catch (err: any) {
      setPurchaseMessage({ type: 'error', text: err.message || '购买失败，请稍后再试' })
    } finally {
      setPurchasing(false)
    }
  }

  // 安全地获取数据
  const landType = land?.blueprint?.land_type || 'unknown'
  const isUnowned = land?.status === 'unowned'
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const giftInfo = landTypeGifts[landType] || null
  
  // 判断是否显示购买时间
  const shouldShowOwnedAt = land?.owner && land?.owned_at

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 消息提示 */}
      {purchaseMessage && (
        <div className={cn(
          "lg:col-span-3 p-4 rounded-lg text-center font-medium",
          purchaseMessage.type === 'success' 
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        )}>
          {purchaseMessage.text}
        </div>
      )}

      {/* 左侧 - 主要信息 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 优惠横幅 */}
        {isUnowned && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">平行世界土地狂欢</h2>
                </div>
                <p className="text-white/90">全平台虚拟地块3折开抢！</p>
              </div>
              <div className="text-right">
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                  -70% OFF
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 赠品信息 */}
        {isUnowned && giftInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-5 border border-green-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-6 h-6 text-green-400" />
              <span className="font-bold text-green-400 text-lg">购买即送专属道具礼包</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 flex items-center gap-2">
                <Pickaxe className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">专属工具</p>
                  <p className="text-xs text-gray-300">{giftInfo.tools}</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 flex items-center gap-2">
                <Wheat className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">粮食补给</p>
                  <p className="text-xs text-gray-300">{giftInfo.food}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 基本信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-gold-500" />
            {land.land_id}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3">基本信息</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型</span>
                  <span className="font-medium">{land.blueprint?.land_type_display || '未知类型'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-medium">{land.blueprint?.size_sqm || 0}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-medium">({land.coordinate_x || 0}, {land.coordinate_y || 0})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-medium">{land.region?.name || '未知区域'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">所有权信息</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">状态</span>
                  <span className={cn(
                    "font-medium",
                    land.status === 'unowned' ? 'text-green-400' : 
                    land.status === 'owned' ? 'text-yellow-400' : 'text-gray-400'
                  )}>
                    {land.status === 'unowned' ? '可购买' : 
                     land.status === 'owned' ? '已拥有' : 
                     land.status_display || '未知状态'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">所有者</span>
                  <span className="font-medium">
                    {land.owner_info?.nickname || land.owner_info?.username || '—'}
                  </span>
                </div>
                {shouldShowOwnedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">购买时间</span>
                    <span className="font-medium">{formatDate(land.owned_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">交易次数</span>
                  <span className="font-medium">{land.transaction_count || 0}次</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* YLD矿山储量信息 */}
          {land.blueprint?.land_type === 'yld_mine' && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="font-bold mb-3">矿山储量信息</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">初始储量</span>
                  <span className="font-medium">{formatPrice(land.initial_reserves)} YLD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">剩余储量</span>
                  <span className="font-medium text-yellow-400">
                    {formatPrice(land.remaining_reserves)} YLD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">开采进度</span>
                  <span className="font-medium">
                    {land.depletion_percentage || 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* 右侧 - 购买信息 */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-xl p-6 border border-gold-500/30"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-400" />
            价格信息
          </h3>
          
          {isUnowned ? (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">狂欢价</p>
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8 text-gold-500" />
                  <p className="text-4xl font-bold text-gold-500">
                    {formatPrice(discountedPrice)}
                  </p>
                  <span className="text-xl text-gold-400">TDB</span>
                </div>
                <p className="text-sm text-gray-500 line-through mt-2">
                  原价 {formatPrice(originalPrice)} TDB
                </p>
                <div className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 inline-block mt-2 text-xs font-bold">
                  节省 {formatPrice(savedAmount)} TDB
                </div>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className={cn(
                  "w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                  "hover:shadow-lg hover:shadow-purple-500/25",
                  purchasing && "opacity-50 cursor-not-allowed"
                )}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    立即抢购
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-2">当前价值</p>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-8 h-8 text-gold-500" />
                <p className="text-4xl font-bold text-gold-500">
                  {formatPrice(land.current_price)}
                </p>
                <span className="text-xl text-gold-400">TDB</span>
              </div>
              {land.last_transaction_price && (
                <p className="text-sm text-gray-400 mt-2">
                  最后成交价：{formatPrice(land.last_transaction_price)} TDB
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
