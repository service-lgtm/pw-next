// src/components/explore/LandDetailView.tsx
// 这是一个统一的、经过安全加固的土地详情组件
// 请在所有需要显示土地详情的地方（页面、弹窗、抽屉）使用这个组件

'use client'

import { motion } from 'framer-motion'
import { Coins, Gift, Pickaxe, Wheat, Shield, Star, Zap, Loader2, Building2, MapPin, Hash } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assetsApi } from '@/lib/api/assets'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'

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

  // 安全的价格格式化函数
  const formatPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined) return '0'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0' : Math.floor(numPrice).toLocaleString('zh-CN')
  }

  // 购买逻辑
  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (!land) return

    const purchaseToast = toast.loading('正在处理购买...');
    setPurchasing(true)

    try {
      const response = await assetsApi.lands.buy({ land_id: land.id })
      if (response.success) {
        toast.success('购买成功！', { id: purchaseToast });
        onPurchaseSuccess?.()
      } else {
        toast.error(response.message || '购买失败', { id: purchaseToast });
      }
    } catch (err: any) {
      toast.error(err.message || '购买失败，请稍后再试', { id: purchaseToast });
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

  return (
    <div className="grid lg:grid-cols-3 gap-6">
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
        
        {/* ✅ 最终修复：安全地渲染赠品信息 */}
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
                  {/* 渲染 giftInfo.tools (字符串) */}
                  <p className="text-xs text-gray-300">{giftInfo.tools}</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 flex items-center gap-2">
                <Wheat className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">粮食补给</p>
                  {/* 渲染 giftInfo.food (字符串) */}
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
                  <span className="font-medium">{land.blueprint?.land_type_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-medium">{land.blueprint?.size_sqm || land.size_sqm}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-medium">({land.coordinate_x}, {land.coordinate_y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-medium">{land.region?.name}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">所有权信息</h3>
              <div className="space-y-2">
                 <div className="flex justify-between">
                  <span className="text-gray-400">状态</span>
                  <span className="font-medium">{land.status === 'unowned' ? '可购买' : '已拥有'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">所有者</span>
                  <span className="font-medium">{land.owner_info?.nickname || land.owner_info?.username || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">购买时间</span>
                  <span className="font-medium">{land.owned_at ? new Date(land.owned_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
