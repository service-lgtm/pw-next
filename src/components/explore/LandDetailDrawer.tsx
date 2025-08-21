/**
 * 文件: /src/components/explore/LandDetailDrawer.tsx
 * 描述: 土地详情抽屉组件 - 简化的底部滑出式设计
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, Coins, Gift, Star, 
  Mountain, Pickaxe, Building2, Hash, Calendar,
  Loader2, ChevronDown, Zap
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import { cn } from '@/lib/utils'

interface LandDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  land?: any
  landId?: number
  onPurchaseSuccess?: () => void
}

export function LandDetailDrawer({ 
  isOpen, 
  onClose, 
  land: propLand, 
  landId,
  onPurchaseSuccess 
}: LandDetailDrawerProps) {
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false)
      return
    }
    
    if (landId) {
      fetchLandDetails(landId)
    } else if (propLand && propLand.id) {
      fetchLandDetails(propLand.id)
    } else if (propLand) {
      setLand(propLand)
      setLoading(false)
    }
  }, [isOpen, landId])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err: any) {
      console.error('获取土地详情失败:', err)
      // 如果获取失败，使用传入的数据
      if (propLand) {
        setLand(propLand)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setShowBetaPassword(true)
  }
  
  const handleBetaPasswordConfirm = async () => {
    setShowBetaPassword(false)
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
  
  const originalPrice = parseFloat(land?.current_price || 0)
  const discountedPrice = originalPrice * 0.4
  const savedAmount = originalPrice - discountedPrice
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* 抽屉内容 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ 
                y: isMinimized ? 'calc(100% - 80px)' : 0,
              }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "bg-gray-900 rounded-t-3xl shadow-2xl",
                "max-h-[90vh] md:max-h-[85vh]",
                "w-full md:max-w-3xl md:mx-auto md:left-auto md:right-auto"
              )}
            >
              {/* 拖动条和标题栏 */}
              <div 
                className="sticky top-0 bg-gray-900 rounded-t-3xl border-b border-gray-800 cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      isMinimized && "rotate-180"
                    )} />
                    <h3 className="text-lg font-bold">
                      {loading ? '加载中...' : (land?.land_id || '土地详情')}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : land ? (
                  <div className="p-4 md:p-6 space-y-6">
                    {/* 创世优惠横幅 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-white mb-2">
                          <Star className="w-5 h-5" />
                          <span className="font-bold">创世纪元 · 限时4折</span>
                          <Star className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/90">首批数字地产，独享创世优惠</p>
                      </div>
                    )}
                    
                    {/* 基本信息卡片 */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        {land?.blueprint?.land_type === 'stone_mine' ? (
                          <Mountain className="w-6 h-6 text-purple-400" />
                        ) : (
                          <Building2 className="w-6 h-6 text-purple-400" />
                        )}
                        <div>
                          <h4 className="font-bold">{land?.blueprint?.land_type_display || '未知类型'}</h4>
                          <p className="text-sm text-gray-400">{land?.region?.name || '未知区域'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">面积</p>
                          <p className="font-medium">{land?.blueprint?.size_sqm || 0}㎡</p>
                        </div>
                        <div>
                          <p className="text-gray-400">坐标</p>
                          <p className="font-medium">({land?.coordinate_x || 0}, {land?.coordinate_y || 0})</p>
                        </div>
                        <div>
                          <p className="text-gray-400">区域代码</p>
                          <p className="font-medium text-xs">{land?.region?.code || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">交易次数</p>
                          <p className="font-medium">{land?.transaction_count || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 价格信息 - 只在可购买时显示 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                        {/* 优惠标签 */}
                        <div className="bg-red-600 text-white text-center py-2 rounded-lg mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Gift className="w-4 h-4" />
                            <span className="font-bold">限时优惠 -60%</span>
                          </div>
                        </div>
                        
                        {/* 价格对比 */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">原价</span>
                            <span className="text-xl text-gray-500 line-through">
                              {formatPrice(originalPrice)} TDB
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gold-400 font-bold">现价</span>
                            <div className="flex items-center gap-2">
                              <Coins className="w-5 h-5 text-gold-500" />
                              <span className="text-2xl font-bold text-gold-500">
                                {formatPrice(discountedPrice)} TDB
                              </span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-700">
                            <div className="flex justify-between items-center text-green-400">
                              <span>您将节省</span>
                              <span className="font-bold">{formatPrice(savedAmount)} TDB</span>
                            </div>
                          </div>
                        </div>
                        
                        {purchaseError && (
                          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">{purchaseError}</p>
                          </div>
                        )}
                        
                        {/* 购买按钮 */}
                        <button
                          onClick={handlePurchase}
                          disabled={purchasing}
                          className={cn(
                            "w-full mt-4 py-3 rounded-xl font-bold transition-all",
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
                      </div>
                    )}
                    
                    {/* 特殊属性 - 矿山 */}
                    {land?.blueprint?.land_type === 'stone_mine' && (
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <Pickaxe className="w-5 h-5 text-purple-400" />
                          矿山属性
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">矿山类型</p>
                            <p className="font-medium">{land?.blueprint?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">产出资源</p>
                            <p className="font-medium">{land?.blueprint?.output_resource || '石材'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">工具需求</p>
                            <p className="font-medium">{land?.blueprint?.tool_requirement || '镐'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">能源消耗</p>
                            <p className="font-medium">{land?.blueprint?.energy_consumption_rate || 0}/天</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 时间信息 */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        时间记录
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">创建时间</span>
                          <span>{land?.created_at ? new Date(land.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">更新时间</span>
                          <span>{land?.updated_at ? new Date(land.updated_at).toLocaleDateString('zh-CN') : '-'}</span>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 内测密码验证弹窗 */}
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => setShowBetaPassword(false)}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={discountedPrice || 0}
        landId={land?.land_id || ''}
      />
    </>
  )
}
