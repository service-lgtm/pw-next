/**
 * 文件: /src/components/explore/LandDetailModal.tsx
 * 描述: 土地详情查看和购买弹窗组件 - 修复版本
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, 
  Building2, Coins, Zap, Timer, Gift, Star, Trophy, 
  Mountain, Pickaxe, Layers, Battery, Calendar, Hash
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import { cn } from '@/lib/utils'

interface LandDetailModalProps {
  isOpen: boolean
  onClose: () => void
  land?: LandDetail | null
  landId?: number
  onPurchaseSuccess?: () => void
}

export function LandDetailModal({ 
  isOpen, 
  onClose, 
  land: propLand, 
  landId,
  onPurchaseSuccess 
}: LandDetailModalProps) {
  console.log('[LandDetailModal] Component initialized with props:', { isOpen, propLand, landId })
  
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false) // 改为 false
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) return
    
    if (propLand) {
      // 如果传入了land对象，直接使用
      setLand(propLand)
      setLoading(false)
      setError(null)
    } else if (landId) {
      // 如果只传入了landId，需要获取详情
      fetchLandDetails(landId)
    } else {
      // 没有数据
      setLoading(false)
      setError('没有土地信息')
    }
  }, [isOpen, landId, propLand])
  
  // 获取土地详情
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      console.log('[LandDetailModal] Fetching land details for ID:', id)
      const landDetail = await assetsApi.lands.get(id)
      console.log('[LandDetailModal] Land details fetched:', landDetail)
      setLand(landDetail)
    } catch (err: any) {
      console.error('[LandDetailModal] Error fetching land details:', err)
      setError(err.message || '获取土地详情失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 格式化价格
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  // 获取土地类型图标
  const getLandTypeIcon = (landType: string) => {
    const iconMap: Record<string, any> = {
      'stone_mine': Mountain,
      'commercial': Building2,
      'residential': Building2,
      'industrial': Building2,
      'agricultural': Building2,
    }
    return iconMap[landType] || Building2
  }
  
  // 处理购买
  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaPassword(true)
  }
  
  // 确认内测密码后的处理
  const handleBetaPasswordConfirm = async () => {
    setShowBetaPassword(false)
    
    if (!land) return
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      if (response.success) {
        onPurchaseSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  if (!isOpen) return null
  
  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
            <p className="text-gray-400">加载土地详情...</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }
  
  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-8"
          >
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              关闭
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }
  
  if (!land) return null
  
  // 计算价格
  const originalPrice = typeof land?.current_price === 'string' ? parseFloat(land.current_price) : (land?.current_price || 0)
  const discountedPrice = originalPrice * 0.4  // 4折价
  const savedAmount = originalPrice - discountedPrice
  const discountPercentage = 60
  
  const LandTypeIcon = getLandTypeIcon(land.blueprint?.land_type || '')
  
  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl"
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* 创世土地横幅 */}
            {land.status === 'unowned' && (
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-3 animate-gradient">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Star className="w-5 h-5" />
                  <span className="text-lg font-bold">创世纪元 · 首批土地 · 限时4折</span>
                  <Star className="w-5 h-5" />
                </div>
              </div>
            )}
            
            {/* 主体内容 */}
            <div className="p-6 space-y-6">
              {/* 土地标识和类型 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <LandTypeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{land.land_id}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {land.blueprint?.land_type_display || '未知类型'}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {land.region?.name || '未知区域'}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
                        land.status === 'unowned' 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-gray-700 text-gray-400"
                      )}>
                        {land.status === 'unowned' ? '可购买' : '已售出'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 购买区域 - 创世土地特别版 */}
              {land.status === 'unowned' && (
                <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50 relative overflow-hidden">
                  {/* 背景动画效果 */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  
                  <div className="relative">
                    {/* 优惠信息 */}
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg p-3 mb-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Gift className="w-5 h-5" />
                        <span className="font-bold">限时优惠 -{discountPercentage}%</span>
                        <Gift className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-1 opacity-90">创世纪元首批土地专属优惠</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* 原价 */}
                      <div className="bg-black/30 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">原始价格</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                          </p>
                          <span className="text-sm text-gray-500">TDB</span>
                        </div>
                      </div>
                      
                      {/* 现价 */}
                      <div className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 rounded-lg p-4 border border-gold-500/30">
                        <p className="text-xs text-gold-400 font-bold mb-1">创世优惠价</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-6 h-6 text-gold-500" />
                          <p className="text-3xl font-bold text-gold-500">
                            {formatPrice(discountedPrice)}
                          </p>
                          <span className="text-lg text-gold-400">TDB</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 节省金额 */}
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-medium">您将节省</span>
                        <span className="text-2xl font-bold text-green-400">
                          {formatPrice(savedAmount)} TDB
                        </span>
                      </div>
                    </div>
                    
                    {/* 限时提醒 */}
                    <div className="flex items-center justify-center gap-2 text-orange-400 mb-4">
                      <Timer className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">优惠活动限时进行，机会难得</span>
                      <Timer className="w-4 h-4 animate-pulse" />
                    </div>
                    
                    {purchaseError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{purchaseError}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className={cn(
                        "w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                        "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white",
                        "hover:shadow-xl hover:shadow-purple-500/30 animate-gradient",
                        "text-lg",
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
                          立即抢购 - 成为创世先锋
                          <Zap className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* 详细信息网格 */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* 基本信息 */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    基本信息
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID</span>
                      <span className="font-mono text-xs">{land.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">面积</span>
                      <span className="font-medium">{land.blueprint?.size_sqm || 0}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">坐标</span>
                      <span className="font-medium">({land.coordinate_x}, {land.coordinate_y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">交易次数</span>
                      <span className="font-medium">{land.transaction_count || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* 位置信息 */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    位置信息
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域</span>
                      <span className="font-medium">{land.region?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">上级</span>
                      <span className="font-medium">{land.region?.parent_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域代码</span>
                      <span className="font-mono text-xs">{land.region?.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域等级</span>
                      <span className="font-medium">Lv.{land.region?.level}</span>
                    </div>
                  </div>
                </div>
                
                {/* 资源信息 - 针对矿山类型 */}
                {land.blueprint?.land_type === 'stone_mine' ? (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                      <Pickaxe className="w-4 h-4" />
                      矿山信息
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">矿山类型</span>
                        <span className="font-medium">{land.blueprint?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">产出资源</span>
                        <span className="font-medium capitalize">
                          {land.blueprint?.output_resource || '石材'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">工具需求</span>
                        <span className="font-medium capitalize">
                          {land.blueprint?.tool_requirement || '镐'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">能耗</span>
                        <span className="font-medium">
                          {land.blueprint?.energy_consumption_rate || 0}/天
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 建筑信息 - 针对其他类型 */
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      建设信息
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">最大楼层</span>
                        <span className="font-medium">{land.blueprint?.max_floors || 0}层</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">建设成本</span>
                        <span className="font-medium">
                          {formatPrice(land.blueprint?.construction_cost_per_floor || 0)} TDB/层
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">能源消耗</span>
                        <span className="font-medium">
                          {land.blueprint?.energy_consumption_rate || 0}/天
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">当前等级</span>
                        <span className="font-medium">Lv.{land.construction_level || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 时间信息 */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  时间线
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">创建时间</p>
                    <p className="font-medium">
                      {new Date(land.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">最后更新</p>
                    <p className="font-medium">
                      {new Date(land.updated_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  {land.last_transaction_at && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">最后交易</p>
                      <p className="font-medium">
                        {new Date(land.last_transaction_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                  {land.owned_at && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">购买时间</p>
                      <p className="font-medium">
                        {new Date(land.owned_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 统计信息 */}
              {(land.total_transaction_volume || land.accumulated_output) && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    统计数据
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">总交易额</p>
                      <p className="text-2xl font-bold text-gold-500">
                        {formatPrice(land.total_transaction_volume || 0)} TDB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">累计产出</p>
                      <p className="text-2xl font-bold text-green-400">
                        {land.accumulated_output || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* 内测密码验证弹窗 */}
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => setShowBetaPassword(false)}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={discountedPrice}
        landId={land?.land_id || ''}
      />
    </>
  )
}
