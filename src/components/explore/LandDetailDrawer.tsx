// src/components/explore/LandDetailDrawer.tsx
// 生产版本 - 安全稳定（修复石矿山和森林兼容性）
// 修改说明：
// 1. 移除 AnimatePresence 的复杂使用
// 2. 简化条件渲染逻辑
// 3. 确保所有渲染分支都返回有效的 JSX
// 关联文件：RegionDetailPage.tsx
// 最后修改：2024-12-20 - 生产安全版

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, MapPin, Coins, Gift, Star, 
  Mountain, Pickaxe, Building2, Hash, Calendar,
  Loader2, Zap, Shield, Wheat, AlertCircle
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface LandDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  land?: any
  landId?: number
  onPurchaseSuccess?: () => void
}

// 特色地块赠送配置
const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包' },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包' },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包' },
  forest: { tools: '专属工具×1', food: '基础粮食包' },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包' },
}

export function LandDetailDrawer({ 
  isOpen = false, 
  onClose = () => {}, 
  land: propLand, 
  landId,
  onPurchaseSuccess = () => {}
}: LandDetailDrawerProps) {
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaConfirm, setShowBetaConfirm] = useState(false)
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) {
      setLand(null)
      setLoading(false)
      setPurchaseError('')
      setShowBetaConfirm(false)
      return
    }
    
    const idToFetch = landId || propLand?.id
    if (idToFetch && typeof idToFetch === 'number') {
      fetchLandDetails(idToFetch)
    } else if (propLand) {
      setLand(propLand)
      setLoading(false)
    }
  }, [isOpen, landId, propLand])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err: any) {
      console.error('[LandDetailDrawer] Failed to fetch:', err)
      if (propLand) {
        setLand(propLand)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const formatPrice = (price: any): string => {
    try {
      if (!price) return '0'
      const numPrice = typeof price === 'string' ? parseFloat(price) : price
      if (isNaN(numPrice)) return '0'
      return Math.floor(numPrice).toLocaleString('zh-CN')
    } catch {
      return '0'
    }
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
        onPurchaseSuccess()
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setPurchaseError(response.message || '购买失败')
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  if (!isOpen) return null
  
  // 计算价格
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const landType = land?.blueprint?.land_type || ''
  const giftInfo = landType && landTypeGifts[landType] ? landTypeGifts[landType] : null
  
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // 渲染特殊属性卡片
  const renderSpecialCard = () => {
    if (landType === 'stone_mine' || landType === 'iron_mine' || landType === 'yld_mine') {
      return (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
            <Pickaxe className="w-4 h-4 text-purple-400" />
            矿山属性
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">类型</span>
              <span>{land?.blueprint?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">产出</span>
              <span>
                {land?.blueprint?.output_resource === 'stone' ? '石头' :
                 land?.blueprint?.output_resource === 'iron' ? '铁矿' :
                 land?.blueprint?.output_resource === 'yld' ? 'YLD' :
                 land?.blueprint?.output_resource === 'none' ? '矿石' :
                 (land?.blueprint?.output_resource || '矿石')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">工具</span>
              <span>
                {land?.blueprint?.tool_requirement === 'pickaxe' ? '镐' :
                 land?.blueprint?.tool_requirement === 'none' ? '镐' :
                 (land?.blueprint?.tool_requirement || '镐')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">能耗</span>
              <span>{land?.blueprint?.energy_consumption_rate || 0}/天</span>
            </div>
          </div>
        </div>
      )
    }
    
    if (landType === 'farm' || landType === 'forest') {
      return (
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
            <Wheat className="w-4 h-4 text-purple-400" />
            资源属性
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">类型</span>
              <span>{land?.blueprint?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">产出</span>
              <span>
                {land?.blueprint?.output_resource === 'none' ? '资源' :
                 (land?.blueprint?.output_resource || '资源')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">面积</span>
              <span>{land?.blueprint?.size_sqm || 0}㎡</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">能耗</span>
              <span>{land?.blueprint?.energy_consumption_rate || 0}/天</span>
            </div>
          </div>
        </div>
      )
    }
    
    // 默认建筑信息
    return (
      <div className="bg-gray-800/50 rounded-xl p-4">
        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
          <Building2 className="w-4 h-4 text-purple-400" />
          建筑信息
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">楼层</span>
            <span>{land?.blueprint?.max_floors || 0}层</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">建设费</span>
            <span>{formatPrice(land?.blueprint?.construction_cost_per_floor)} TDB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">能耗</span>
            <span>{land?.blueprint?.energy_consumption_rate || 0}/天</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">等级</span>
            <span>Lv.{land?.construction_level || 0}</span>
          </div>
        </div>
      </div>
    )
  }
  
  // 主内容
  const mainContent = (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className={cn(
        "sticky top-0 bg-gray-900 border-b border-gray-800 z-10 shrink-0",
        isMobile ? "rounded-t-3xl" : "rounded-t-2xl"
      )}>
        {isMobile && (
          <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
        )}
        
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-bold">
            {loading ? '加载中...' : (land?.land_id || '土地详情')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : land ? (
          <div className="space-y-6">
            {/* 创世优惠横幅 */}
            {land?.status === 'unowned' && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-white mb-2">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">平行世界土地狂欢 · 限时3折</span>
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-sm text-white/90">区块链确权，成为元宇宙地主</p>
              </div>
            )}
            
            {/* 赠品提示 */}
            {land?.status === 'unowned' && giftInfo && (
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">购买即送专属道具</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Pickaxe className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">{giftInfo.tools}</span>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">{giftInfo.food}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 信息卡片网格 */}
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
            )}>
              {/* 基本信息 */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                  <Hash className="w-4 h-4 text-purple-400" />
                  基本信息
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID</span>
                    <span className="font-mono">{land?.id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">面积</span>
                    <span>{land?.blueprint?.size_sqm || 0}㎡</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">坐标</span>
                    <span>({land?.coordinate_x || 0}, {land?.coordinate_y || 0})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">交易次数</span>
                    <span>{land?.transaction_count || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* 位置信息 */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  位置信息
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">区域</span>
                    <span>{land?.region?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">上级</span>
                    <span>{land?.region?.parent_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">代码</span>
                    <span className="font-mono text-xs">{land?.region?.code || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">等级</span>
                    <span>Lv.{land?.region?.level || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* 特殊属性 */}
              {renderSpecialCard()}
            </div>
            
            {/* 购买区域 */}
            {land?.status === 'unowned' && originalPrice > 0 && (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-2 rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span className="font-bold">限时优惠 -70%</span>
                    <Gift className="w-4 h-4" />
                  </div>
                </div>
                
                <div className={cn(
                  "grid gap-4 mb-4",
                  isMobile ? "grid-cols-1" : "grid-cols-3"
                )}>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">原价</p>
                    <p className="text-xl text-gray-500 line-through">
                      {formatPrice(originalPrice)} TDB
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gold-400 font-bold mb-1">狂欢价</p>
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="w-5 h-5 text-gold-500" />
                      <p className="text-2xl font-bold text-gold-500">
                        {formatPrice(discountedPrice)} TDB
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-green-400 mb-1">节省</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatPrice(savedAmount)} TDB
                    </p>
                  </div>
                </div>
                
                {purchaseError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 text-center">{purchaseError}</p>
                  </div>
                )}
                
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold transition-all",
                    "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                    "hover:shadow-lg hover:shadow-purple-500/30",
                    "flex items-center justify-center gap-2",
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
                
                <p className="text-center text-xs text-orange-400 mt-3">
                  活动截止：9月15日 23:59
                </p>
              </div>
            )}
            
            {/* 时间信息 */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-purple-400" />
                时间记录
              </h4>
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div>
                  <p className="text-gray-400 mb-1 text-sm">创建时间</p>
                  <p className="text-sm">{land?.created_at ? new Date(land.created_at).toLocaleString('zh-CN') : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1 text-sm">更新时间</p>
                  <p className="text-sm">{land?.updated_at ? new Date(land.updated_at).toLocaleString('zh-CN') : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            暂无数据
          </div>
        )}
      </div>
    </div>
  )
  
  // 渲染组件 - 简化版，不使用 AnimatePresence
  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      
      {/* 主容器 */}
      {!isMobile ? (
        // PC端
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
          >
            {mainContent}
          </motion.div>
        </div>
      ) : (
        // 移动端
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 shadow-2xl rounded-t-3xl max-h-[90vh] overflow-hidden"
        >
          {mainContent}
        </motion.div>
      )}
      
      {/* 内测确认弹窗 */}
      {showBetaConfirm && land && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">购买确认</h3>
              <p className="text-gray-400 mb-4">
                确认购买此土地，将消耗您的TDB通证
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 mb-2">土地编号：{land?.land_id}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-500 line-through text-sm">
                    原价 {Math.round(originalPrice).toLocaleString()} TDB
                  </span>
                  <span className="text-gold-500 font-bold text-lg">
                    3折价 {Math.round(discountedPrice).toLocaleString()} TDB
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
                  区块链确权，永久拥有您的数字资产
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
        </div>
      )}
    </>
  )
}
