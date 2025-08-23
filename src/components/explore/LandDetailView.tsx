// src/components/explore/LandDetailView.tsx
// 土地详情视图组件（用于独立页面）- 3折特惠版，移除密码验证
// 修改说明：
// 1. 将原4折(0.4)改为3折(0.3)计算
// 2. 移除BetaPasswordModal，改用简单的内测确认弹窗
// 3. 添加特色地块专属道具赠送展示
// 4. 优化营销文案，突出"平行世界土地狂欢"主题
// 关联文件：LandDetailDrawer.tsx, LandDetailModal.tsx, /explore/lands/[landId]/page.tsx
// 最后修改：2024-12-20 - 调整为3折优惠并移除密码验证

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

// 特色地块赠送配置
const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '农具×1', food: '基础粮食×100' },
  iron_mine: { tools: '铁镐×1', food: '基础粮食×50' },
  stone_mine: { tools: '石镐×1', food: '基础粮食×50' },
  forest: { tools: '斧头×1', food: '基础粮食×75' },
  yld_mine: { tools: '钻头×1', food: '基础粮食×100' },
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
  const giftInfo = land.land_type ? landTypeGifts[land.land_type] : null
  
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
                  <span className="font-medium">{land.size_sqm}㎡</span>
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
          </div>
        </motion.div>
        
        {/* 产出信息 */}
        {land.blueprint.daily_output !== '0.0000' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-6"
          >
            <h3 className="font-bold mb-4">产出信息</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">日产出</p>
                <p className="text-xl font-bold text-green-500">
                  {land.blueprint.daily_output} {land.blueprint.output_resource}
                </p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">累计产出</p>
                <p className="text-xl font-bold">{land.accumulated_output}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">生产状态</p>
                <p className="text-xl font-bold">
                  {land.is_producing ? (
                    <span className="text-green-500">生产中</span>
                  ) : (
                    <span className="text-gray-500">未生产</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 交易历史 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h3 className="font-bold mb-4">交易历史</h3>
          {land.recent_transactions && land.recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {land.recent_transactions.map(tx => (
                <div key={tx.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tx.transaction_type_display}</p>
                    <p className="text-sm text-gray-400">
                      {tx.from_username || '系统'} → {tx.to_username}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Coins className="w-4 h-4 text-gold-500" />
                      <p className="text-lg font-bold text-gold-500">
                        {formatPrice(tx.price)}
                      </p>
                      <span className="text-sm text-gold-400">TDB</span>
                    </div>
                    <p className="text-xs text-gray-400">手续费: {formatPrice(tx.fee)} TDB</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">暂无交易记录</p>
          )}
        </motion.div>
      </div>
      
      {/* 右侧 - 购买信息 */}
      <div className="space-y-6">
        {/* 价格卡片 - 3折特惠 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-xl p-6 border border-gold-500/30"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-400" />
            价格信息
          </h3>
          
          {land.status === 'unowned' ? (
            <>
              {/* 3折价格展示 */}
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
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">折扣</span>
                  <span className="text-red-500 font-bold">-70%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">单价</span>
                  <span>{Math.round(discountedPrice / land.size_sqm)} TDB/㎡</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">活动截止</span>
                  <span className="text-orange-400">9月15日</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 非售卖状态价格展示 */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">当前价格</p>
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8 text-gold-500" />
                  <p className="text-4xl font-bold text-gold-500">
                    {formatPrice(land.current_price)}
                  </p>
                  <span className="text-xl text-gold-400">TDB</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  单价: {Math.round(Number(land.current_price) / land.size_sqm)} TDB/㎡
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">初始价格</span>
                  <span>{formatPrice(land.initial_price)} TDB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">历史涨幅</span>
                  <span className="text-green-500 font-bold">
                    +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">交易次数</span>
                  <span>{land.transaction_count}次</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">总交易额</span>
                  <span>{formatPrice(land.total_transaction_volume)} TDB</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
        
        {/* 状态信息 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h3 className="font-bold mb-4">状态信息</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">所有权</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                land.status === 'unowned' ? "bg-green-500/20 text-green-500" : "bg-gray-700 text-gray-400"
              )}>
                {land.status_display}
              </span>
            </div>
            
            {land.owner_username && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">所有者</span>
                <span className="font-medium">{land.owner_username}</span>
              </div>
            )}
            
            {land.owned_at && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">购买时间</span>
                <span className="text-sm">{new Date(land.owned_at).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">可建设</span>
              <span className={land.can_build ? "text-green-500" : "text-gray-500"}>
                {land.can_build ? '是' : '否'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">可生产</span>
              <span className={land.can_produce ? "text-green-500" : "text-gray-500"}>
                {land.can_produce ? '是' : '否'}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* 购买按钮 - 无需密码 */}
        {land.status === 'unowned' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {purchaseError && (
              <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{purchaseError}</p>
              </div>
            )}
            
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
                  {giftInfo && <span className="text-xs">(送道具)</span>}
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-orange-400 mt-2">
              限时优惠截止：9月15日 23:59
            </p>
          </motion.div>
        )}
      </div>
      
      {/* 内测确认弹窗 */}
      <AnimatePresence>
        {showBetaConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">内测购买确认</h3>
                <p className="text-gray-400 mb-4">
                  当前为内测阶段，购买土地将消耗测试代币(TDB)
                </p>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300 mb-2">土地编号：{land.land_id}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-gray-500 line-through text-sm">
                      原价 {formatPrice(originalPrice)} TDB
                    </span>
                    <span className="text-gold-500 font-bold text-lg">
                      3折价 {formatPrice(discountedPrice)} TDB
                    </span>
                  </div>
                  {giftInfo && (
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="text-xs text-green-400">
                        <Gift className="w-3 h-3 inline mr-1" />
                        赠送：{giftInfo.tools} + {giftInfo.food}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
                  <p className="text-xs text-blue-400">
                    <Shield className="w-3 h-3 inline mr-1" />
                    正式版上线后，内测期间的所有资产将保留
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBetaConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBetaConfirm}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    确认购买
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
