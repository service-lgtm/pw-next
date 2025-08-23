// src/components/explore/LandDetailView.tsx
// 土地详情视图组件（用于独立页面）- 3折特惠版，修复石矿山兼容性
// 修改说明：
// 1. 修复石矿山类型土地的礼物配置读取问题
// 2. 使用 blueprint.land_type 而不是 land.land_type
// 3. 确保所有矿山类型都能正常显示
// 4. 优化营销文案，突出"平行世界土地狂欢"主题
// 关联文件：LandDetailDrawer.tsx, LandDetailModal.tsx, /explore/lands/[landId]/page.tsx
// 最后修改：2024-12-20 - 修复石矿山类型兼容性

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, 
  Building2, Coins, Gift, Shield, AlertCircle, Wheat, Pickaxe,
  Star, Zap
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandDetailViewProps {
  land: LandDetail
  onPurchaseSuccess?: () => void
}

// 特色地块赠送配置 - 修复：使用 blueprint.land_type
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
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaConfirm, setShowBetaConfirm] = useState(false)
  
  // 格式化价格
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  // 计算3折价格
  const originalPrice = typeof land.current_price === 'string' ? parseFloat(land.current_price) : land.current_price
  const discountedPrice = originalPrice * 0.3  // 3折价格
  const savedAmount = originalPrice - discountedPrice
  // 修复：使用 blueprint.land_type 而不是 land.land_type
  const landType = land.blueprint?.land_type
  const giftInfo = landType ? landTypeGifts[landType] : null
  
  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    
    // 显示内测确认弹窗
    setShowBetaConfirm(true)
  }
  
  const handleBetaConfirm = async () => {
    setShowBetaConfirm(false)
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      // 直接调用购买API，不需要密码
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      if (response.success) {
        onPurchaseSuccess?.()
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  // 判断是否为矿山类型
  const isMineType = ['stone_mine', 'iron_mine', 'yld_mine'].includes(landType || '')
  
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 左侧 - 主要信息 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 活动横幅 - 3折特惠 */}
        {land.status === 'unowned' && (
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
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/80">区块链确权</span>
                  </div>
                  <span className="text-white/60">·</span>
                  <span className="text-xs text-white/80">限时至9月15日</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                  -70% OFF
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 赠品提示 */}
        {land.status === 'unowned' && giftInfo && (
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
                  <span className="font-medium">{land.blueprint.land_type_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-medium">{land.blueprint.size_sqm || land.size_sqm}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-medium">({land.coordinate_x}, {land.coordinate_y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-medium">{land.region.name}</span>
                </div>
              </div>
            </div>
            
            {/* 根据土地类型显示不同信息 */}
            {isMineType ? (
              <div>
                <h3 className="font-bold mb-3">矿山信息</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">产出资源</span>
                    <span className="font-medium">{land.blueprint.output_resource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">工具需求</span>
                    <span className="font-medium">{land.blueprint.tool_requirement || '镐'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">能源消耗</span>
                    <span className="font-medium">{land.blueprint.energy_consumption_rate}/天</span>
                  </div>
                  {land.remaining_reserves !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">剩余储量</span>
                      <span className="font-medium">{land.remaining_reserves}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold mb-3">建设信息</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">最大楼层</span>
                    <span className="font-medium">{land.blueprint.max_floors}层</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">建设成本</span>
                    <span className="font-medium">{formatPrice(land.blueprint.construction_cost_per_floor)} TDB/层</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">能源消耗</span>
                    <span className="font-medium">{land.blueprint.energy_consumption_rate}/天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">当前等级</span>
                    <span className="font-medium">Lv.{land.construction_level}</span>
                  </div>
                </div>
              </div>
            )}
