// src/components/explore/LandDetailModal.tsx
// 土地详情查看和购买弹窗组件 - 3折特惠版（移除密码验证）
// 修改说明：
// 1. 将原4折(0.4)改为3折(0.3)计算，折扣标签改为-70%
// 2. 移除BetaPasswordModal，使用内测确认弹窗
// 3. 添加特色地块专属道具赠送展示
// 4. 优化营销文案，突出"平行世界土地狂欢"主题
// 关联文件：LandDetailDrawer.tsx, LandDetailView.tsx, LandCard.tsx
// 最后修改：2024-12-20 - 调整为3折并移除密码验证

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, 
  Building2, Coins, Zap, Timer, Gift, Star, Trophy, 
  Mountain, Pickaxe, Layers, Battery, Calendar, Hash,
  Shield, Wheat, AlertCircle
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface LandDetailModalProps {
  isOpen: boolean
  onClose: () => void
  land?: any
  landId?: number
  onPurchaseSuccess?: () => void
}

// 特色地块赠送配置
const landTypeGifts: Record<string, { tools: string; food: string; icon: any }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包', icon: Wheat },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包', icon: Pickaxe },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包', icon: Pickaxe },
  forest: { tools: '专属工具×1', food: '基础粮食包', icon: Pickaxe },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包', icon: Pickaxe },
}

export function LandDetailModal({ 
  isOpen, 
  onClose, 
  land: propLand, 
  landId,
  onPurchaseSuccess 
}: LandDetailModalProps) {
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaConfirm, setShowBetaConfirm] = useState(false)
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) {
      // 关闭时重置状态
      setLand(null)
      setLoading(false)
      setError(null)
      return
    }
    
    // 优先使用 landId 获取完整数据
    if (landId && typeof landId === 'number') {
      fetchLandDetails(landId)
    } else if (propLand && propLand.id && typeof propLand.id === 'number') {
      fetchLandDetails(propLand.id)
    } else if (propLand) {
      setLand(propLand)
      setLoading(false)
      setError(null)
    } else {
      setLoading(false)
      setError('没有土地信息')
    }
  }, [isOpen, landId])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err: any) {
      console.error('获取土地详情失败:', err)
      setError(err.message || '获取土地详情失败')
      // 如果获取失败，使用传入的数据
      if (propLand) {
        setLand(propLand)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }
  
  // 安全的价格格式化函数
  const safeFormatPrice = (price: any): string => {
    if (price === null || price === undefined || price === '') return '0'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '0'
    return Math.floor(numPrice).toLocaleString('zh-CN')
  }
  
  const formatPrice = safeFormatPrice  // 兼容旧代码
  
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
  
  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaConfirm(true)
  }
  
  const handleBetaConfirm = async () => {
    setShowBetaConfirm(false)
    
    if (!land) return
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land?.id,
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
  
  // 价格计算 - 只对 unowned 状态的土地计算折扣
  let originalPrice = 0
  let discountedPrice = 0
  let savedAmount = 0
  const discountPercentage = 70  // 3折 = 70% OFF
  
  if (land?.status === 'unowned' && land?.current_price) {
    const rawPrice = land.current_price
    console.log('[LandDetailModal] Raw price:', rawPrice, typeof rawPrice)
    
    originalPrice = Math.floor(parseFloat(rawPrice || '0'))
    console.log('[LandDetailModal] Original price after floor:', originalPrice)
    
    discountedPrice = Math.floor(originalPrice * 0.3)  // 3折价格，向下取整
    console.log('[LandDetailModal] Discounted price (30%):', originalPrice * 0.3, '→ floored:', discountedPrice)
    
    savedAmount = originalPrice - discountedPrice
  }
  
  const LandTypeIcon = getLandTypeIcon(land?.blueprint?.land_type || '')
  const giftInfo = land?.land_type ? landTypeGifts[land.land_type] : null
  
  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
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
              
              {/* 创世土地横幅 - 3折特惠 */}
              {land?.status === 'unowned' && (
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-3">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Star className="w-5 h-5" />
                    <span className="text-lg font-bold">平行世界土地狂欢 · 限时3折</span>
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-white/80" />
                      <span className="text-xs text-white/80">区块链确权</span>
                    </div>
                    <span className="text-white/60">·</span>
                    <span className="text-xs text-white/80">9月15日截止</span>
                  </div>
                </div>
              )}
              
              {/* 主体内容 */}
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
                      <p className="text-gray-400">加载土地详情...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      关闭
                    </button>
                  </div>
                ) : land ? (
                  <>
                    {/* 土地标识和类型 */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <LandTypeIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2">{land?.land_id || 'Loading...'}</h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                              {land?.blueprint?.land_type_display || land?.land_type_display || '未知类型'}
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                              {land?.region?.name || '未知区域'}
                            </span>
                            {land?.owner_info && (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                拥有者: {land.owner_info.nickname || land.owner_info.username}
                              </span>
                            )}
                            <span className={cn(
                              "px-3 py-1 rounded-full text-sm font-bold",
                              land?.status === 'unowned' 
                                ? "bg-green-500/20 text-green-500" 
                                : land?.status === 'owned'
                                ? "bg-red-500/20 text-red-500"
                                : "bg-gray-700 text-gray-400"
                            )}>
                              {land?.status === 'unowned' ? '可购买' : 
                               land?.status === 'owned' ? '已拥有' : '已售出'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 赠品提示 - 特色地块专属 */}
                    {land?.status === 'unowned' && giftInfo && (
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-5 border border-green-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Gift className="w-6 h-6 text-green-400" />
                          <span className="font-bold text-green-400 text-lg">购买即送专属道具礼包</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <giftInfo.icon className="w-5 h-5 text-yellow-400" />
                              <span className="text-white font-medium">专属工具</span>
                            </div>
                            <p className="text-sm text-gray-300">{giftInfo.tools}</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Wheat className="w-5 h-5 text-yellow-400" />
                              <span className="text-white font-medium">粮食补给</span>
                            </div>
                            <p className="text-sm text-gray-300">{giftInfo.food}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">
                          助您快速开启平行世界生产建设，解锁领地专属收益
                        </p>
                      </div>
                    )}
                    
                    {/* 购买区域 - 只对 unowned 状态显示 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50 relative overflow-hidden">
                        <div className="relative">
                          {/* 优惠信息 */}
                          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg p-3 mb-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Gift className="w-5 h-5" />
                              <span className="font-bold">限时优惠 -{discountPercentage}%</span>
                              <Gift className="w-5 h-5" />
                            </div>
                            <p className="text-xs mt-1 opacity-90">平行世界土地狂欢特惠</p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {/* 原价 */}
                            <div className="bg-black/30 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-1">原始价格</p>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl text-gray-500 line-through">
                                  {originalPrice.toLocaleString('zh-CN')}
                                </p>
                                <span className="text-sm text-gray-500">TDB</span>
                              </div>
                            </div>
                            
                            {/* 现价 */}
                            <div className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 rounded-lg p-4 border border-gold-500/30">
                              <p className="text-xs text-gold-400 font-bold mb-1">狂欢价</p>
                              <div className="flex items-center gap-2">
                                <Coins className="w-6 h-6 text-gold-500" />
                                <p className="text-3xl font-bold text-gold-500">
                                  {discountedPrice.toLocaleString('zh-CN')}
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
                                {savedAmount.toLocaleString('zh-CN')} TDB
                              </span>
                            </div>
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
                              "hover:shadow-xl hover:shadow-purple-500/30",
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
                                立即抢购 - 成为元宇宙地主
                                <Zap className="w-5 h-5" />
                              </>
                            )}
                          </button>
                          
                          <p className="text-center text-xs text-orange-400 mt-3">
                            活动截止：9月15日 23:59
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* 如果是自己的土地，显示管理信息 */}
                    {land?.status === 'owned' && land?.owner_info && (
                      <div className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 rounded-xl p-6 border-2 border-gold-500/50">
                        <h3 className="font-bold text-lg mb-4 text-gold-400">土地管理</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-xs text-gray-400 mb-1">购买时间</p>
                            <p className="text-white">
                              {land?.owned_at ? new Date(land.owned_at).toLocaleString('zh-CN') : '-'}
                            </p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-xs text-gray-400 mb-1">购买价格</p>
                            <p className="text-white">{land?.last_transaction_price ? Math.floor(parseFloat(land.last_transaction_price)).toLocaleString('zh-CN') : '0'} TDB</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-xs text-gray-400 mb-1">当前价值</p>
                            <p className="text-gold-400 font-bold">{land?.current_price ? Math.floor(parseFloat(land.current_price)).toLocaleString('zh-CN') : '0'} TDB</p>
                          </div>
                          <div className="bg-black/30 rounded-lg p-4">
                            <p className="text-xs text-gray-400 mb-1">交易次数</p>
                            <p className="text-white">{land?.transaction_count || 0}次</p>
                          </div>
                        </div>
                        
                        {/* 显示生产状态 - 针对矿山类型 */}
                        {land?.blueprint?.land_type === 'stone_mine' && (
                          <div className="mt-4 p-4 bg-black/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">生产状态</p>
                                <p className={cn(
                                  "font-bold",
                                  land?.is_producing ? "text-green-400" : "text-gray-400"
                                )}>
                                  {land?.is_producing ? '生产中' : '未生产'}
                                </p>
                                {land?.accumulated_output && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    累计产出: {land.accumulated_output} {land?.blueprint?.output_resource || '石材'}
                                  </p>
                                )}
                              </div>
                              {land?.can_produce && !land?.is_producing && (
                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                  开始生产
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 显示建设状态 - 针对城市类型 */}
                        {land?.blueprint?.land_type !== 'stone_mine' && land?.can_build && (
                          <div className="mt-4 p-4 bg-black/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">建设等级</p>
                                <p className="font-bold text-white">
                                  Lv.{land?.construction_level || 0} / {land?.blueprint?.max_floors || 0}
                                </p>
                              </div>
                              {!land?.is_under_construction && (
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                  升级建筑
                                </button>
                              )}
                            </div>
                          </div>
                        )}
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
                            <span className="font-mono text-xs">{land?.id || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">面积</span>
                            <span className="font-medium">{land?.blueprint?.size_sqm || 0}㎡</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">坐标</span>
                            <span className="font-medium">({land?.coordinate_x || 0}, {land?.coordinate_y || 0})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">交易次数</span>
                            <span className="font-medium">{land?.transaction_count || 0}</span>
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
                            <span className="font-medium">{land?.region?.name || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">上级</span>
                            <span className="font-medium">{land?.region?.parent_name || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">区域代码</span>
                            <span className="font-mono text-xs">{land?.region?.code || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">区域等级</span>
                            <span className="font-medium">Lv.{land?.region?.level || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 资源信息 */}
                      {land?.blueprint?.land_type === 'stone_mine' ? (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                            <Pickaxe className="w-4 h-4" />
                            矿山信息
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">矿山类型</span>
                              <span className="font-medium">{land?.blueprint?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">产出资源</span>
                              <span className="font-medium capitalize">
                                {land?.blueprint?.output_resource || '石材'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">工具需求</span>
                              <span className="font-medium capitalize">
                                {land?.blueprint?.tool_requirement || '镐'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">能耗</span>
                              <span className="font-medium">
                                {land?.blueprint?.energy_consumption_rate || 0}/天
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <h3 className="font-bold mb-3 text-gray-300 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            建设信息
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">最大楼层</span>
                              <span className="font-medium">{land?.blueprint?.max_floors || 0}层</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">建设成本</span>
                              <span className="font-medium">
                                {formatPrice(land?.blueprint?.construction_cost_per_floor || 0)} TDB/层
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">能源消耗</span>
                              <span className="font-medium">
                                {land?.blueprint?.energy_consumption_rate || 0}/天
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">当前等级</span>
                              <span className="font-medium">Lv.{land?.construction_level || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    暂无数据
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 内测确认弹窗 - 无需密码 */}
      <BetaConfirmModal
        isOpen={showBetaConfirm}
        onClose={() => setShowBetaConfirm(false)}
        onConfirm={handleBetaConfirm}
        landPrice={discountedPrice || 0}  // 折后价（实际支付价格）
        originalPrice={originalPrice || 0}  // 原价（用于显示对比）
        landId={land?.land_id || ''}
        hasGift={!!giftInfo}
        giftInfo={giftInfo}
      />
    </>
  )
}

// 内测确认弹窗组件
function BetaConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  landPrice, 
  originalPrice,
  landId,
  hasGift,
  giftInfo
}: any) {
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
              <p className="text-sm text-gray-300 mb-2">土地编号：{landId}</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-500 line-through text-sm">原价 {Math.round(originalPrice).toLocaleString()} TDB</span>
                <span className="text-gold-500 font-bold text-lg">
                  3折价 {Math.round(landPrice).toLocaleString()} TDB
                </span>
              </div>
              {hasGift && giftInfo && (
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
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                确认购买
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
