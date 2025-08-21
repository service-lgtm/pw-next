/**
 * 文件: /src/components/explore/LandDetailModal.tsx
 * 描述: 土地详情查看和购买弹窗组件 - 创世土地4折优惠版
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, Building2, Coins, Zap, Timer, Gift, Star, Trophy } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import type { LandDetail } from '@/types/assets'
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
  const { user } = useAuth()
  const [land, setLand] = useState<LandDetail | null>(propLand || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  
  // 如果传入了 landId，获取土地详情
  useEffect(() => {
    if (isOpen && landId && !propLand) {
      fetchLandDetails(landId)
    } else if (propLand) {
      setLand(propLand)
    }
  }, [isOpen, landId, propLand])
  
  // 获取土地详情
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err: any) {
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
  const originalPrice = typeof land.current_price === 'string' ? parseFloat(land.current_price) : land.current_price
  const discountedPrice = originalPrice * 0.4  // 4折价 = 原价 * 0.4
  const savedAmount = originalPrice - discountedPrice
  const discountPercentage = 60  // 60% off
  
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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl"
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
              {/* 购买区域 - 创世土地特别版 */}
              {land.status === 'unowned' && (
                <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50 relative overflow-hidden">
                  {/* 背景动画效果 */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  
                  <div className="relative">
                    {/* 土地信息标题 */}
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-white">{land.land_id}</h2>
                      <p className="text-gray-400">{land.blueprint.land_type_display} · {land.region.name}</p>
                    </div>
                    
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
              
              {/* 基本信息和建设信息 - 保持原样 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 text-gray-300">基本信息</h3>
                  <div className="space-y-2">
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
                    <div className="flex justify-between">
                      <span className="text-gray-400">状态</span>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        land.status === 'unowned' ? "bg-green-500/20 text-green-500" : "bg-gray-700 text-gray-400"
                      )}>
                        {land.status_display}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-bold mb-3 text-gray-300">建设信息</h3>
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
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* 内测密码验证弹窗 */}
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => setShowBetaPassword(false)}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={Number(land?.current_price || 0)}
        landId={land?.land_id}
      />
    </>
  )
}
