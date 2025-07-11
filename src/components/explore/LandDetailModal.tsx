// src/components/explore/LandDetailModal.tsx
// 土地详情弹窗组件 - 使用独立的支付密码弹窗

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, MapPin, TrendingUp, User, ShoppingBag, Loader2, 
  Building2, Coins, Activity, Info, CheckCircle,
  AlertCircle, Lock, Sparkles, ChevronRight
} from 'lucide-react'
import { useLandDetail } from '@/hooks/useLands'
import { assetsApi } from '@/lib/api/assets'
import { useRequireAuth } from '@/hooks/useAuth'
import { PaymentPasswordModal } from '@/components/common/PaymentPasswordModal'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface LandDetailModalProps {
  landId: number
  isOpen: boolean
  onClose: () => void
  onPurchaseSuccess?: () => void
}

export function LandDetailModal({
  landId,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: LandDetailModalProps) {
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const { land, loading, error } = useLandDetail(landId)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  
  useEffect(() => {
    if (!isOpen) {
      setPurchaseSuccess(false)
      setShowPaymentModal(false)
    }
  }, [isOpen])
  
  const handlePurchaseClick = () => {
    // 先检查是否登录
    if (!requireAuth()) {
      return // requireAuth 会自动跳转到登录页
    }
    
    // 显示支付密码弹窗
    setShowPaymentModal(true)
  }
  
  const handlePaymentConfirm = async (password: string) => {
    try {
      const response = await assetsApi.lands.buy({
        land_id: landId,
        payment_password: password,
      })
      
      if (response.success) {
        setShowPaymentModal(false)
        setPurchaseSuccess(true)
        
        // 播放成功动画
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        })
        
        // 延迟关闭，让用户看到成功提示
        setTimeout(() => {
          onPurchaseSuccess?.()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      // 错误已在 PaymentPasswordModal 中处理
      throw err
    }
  }
  
  if (!isOpen) return null
  
  const isAvailable = land?.status === 'unowned'
  
  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-gray-700">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">土地详情</h2>
                  <p className="text-sm text-gray-400">查看土地信息并购买</p>
                </div>
              </div>
            </div>
            
            {/* 内容区域 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                  <p className="text-gray-400">加载土地信息中...</p>
                </div>
              )}
              
              {error && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {land && !purchaseSuccess && (
                <div className="space-y-6">
                  {/* 基本信息 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-5 border border-white/10"
                  >
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-purple-400" />
                      基本信息
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">土地编号</p>
                        <p className="font-mono font-bold text-sm">{land.land_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">类型</p>
                        <p className="font-bold flex items-center gap-2">
                          {land.blueprint.land_type_display}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">位置</p>
                        <p className="font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          {land.region.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">面积</p>
                        <p className="font-bold">{land.size_sqm}㎡</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* 价格信息 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "relative rounded-xl p-5 border overflow-hidden",
                      isAvailable 
                        ? "bg-gradient-to-br from-gold-500/20 to-yellow-500/20 border-gold-500/30"
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    {isAvailable && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          可购买
                        </span>
                      </div>
                    )}
                    
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-gold-400" />
                      价格信息
                    </h3>
                    
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-400 mb-2">当前价格</p>
                      <p className="text-4xl font-black text-gold-500">
                        ¥{Number(land.current_price).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">初始价格</p>
                        <p className="font-bold">¥{Number(land.initial_price).toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">涨幅</p>
                        <p className="font-bold text-green-500">
                          +{((Number(land.current_price) / Number(land.initial_price) - 1) * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">交易次数</p>
                        <p className="font-bold">{land.transaction_count}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
              
              {/* 购买成功提示 */}
              {purchaseSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">购买成功！</h3>
                  <p className="text-gray-400 mb-4">恭喜您成功购买了这块土地</p>
                  <p className="text-sm text-gray-500">正在跳转到我的资产...</p>
                </motion.div>
              )}
            </div>
            
            {/* 底部操作区 */}
            <div className="p-6 border-t border-gray-700 bg-gray-900">
              {land && !purchaseSuccess && (
                <div>
                  {isAvailable ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePurchaseClick}
                      className="w-full py-4 bg-gradient-to-r from-gold-500 to-yellow-600 text-black rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-gold-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>{isAuthenticated ? '立即购买' : '登录后购买'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800 rounded-xl">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="font-bold">已被占有</p>
                          <p className="text-sm text-gray-400">
                            所有者: {land?.owner_username}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* 支付密码弹窗 */}
      <PaymentPasswordModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        title="支付确认"
        amount={land ? Number(land.current_price) : undefined}
      />
    </>
  )
}
