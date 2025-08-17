/**
 * 文件: /src/components/explore/LandDetailModal.tsx
 * 描述: 土地详情查看和购买弹窗组件 - 调试版本
 * 
 * 调试改动：
 * - 添加了更多的 console.log 用于定位问题
 * - 简化了购买流程，先测试基础功能
 * - 添加了错误边界处理
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, TrendingUp, Clock, User, ShoppingBag, Loader2, Building2, Coins } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { BetaPasswordModal } from '@/components/common/BetaPasswordModal'
import type { LandDetail } from '@/types/assets'
import { cn } from '@/lib/utils'

interface LandDetailModalProps {
  isOpen: boolean
  onClose: () => void
  land: LandDetail | null
  onPurchaseSuccess?: () => void
}

export function LandDetailModal({ isOpen, onClose, land, onPurchaseSuccess }: LandDetailModalProps) {
  const { user } = useAuth()
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showBetaPassword, setShowBetaPassword] = useState(false)
  
  // 调试日志
  useEffect(() => {
    console.log('[LandDetailModal] Component mounted/updated', {
      isOpen,
      land: land?.land_id,
      landStatus: land?.status,
      user: user?.username || 'not logged in',
      showBetaPassword
    })
  }, [isOpen, land, user, showBetaPassword])
  
  if (!land) {
    console.log('[LandDetailModal] No land data, returning null')
    return null
  }
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  
  // 简化的购买处理函数
  const handlePurchase = () => {
    console.log('[LandDetailModal] handlePurchase called', {
      user: user?.username,
      landId: land.id,
      landStatus: land.status
    })
    
    if (!user) {
      console.log('[LandDetailModal] No user, redirecting to login')
      window.location.href = '/login'
      return
    }
    
    console.log('[LandDetailModal] Setting showBetaPassword to true')
    setShowBetaPassword(true)
  }
  
  // 测试函数 - 直接显示弹窗
  const testShowModal = () => {
    console.log('[TEST] Forcing modal to show')
    setShowBetaPassword(true)
  }
  
  const handleBetaPasswordConfirm = async () => {
    console.log('[LandDetailModal] handleBetaPasswordConfirm called')
    setShowBetaPassword(false)
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      console.log('[LandDetailModal] Calling API to buy land:', land.id)
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      console.log('[LandDetailModal] API response:', response)
      
      if (response.success) {
        onPurchaseSuccess?.()
        onClose()
      }
    } catch (err: any) {
      console.error('[LandDetailModal] Purchase error:', err)
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  // 判断是否显示购买按钮
  const showPurchaseButton = land.status === 'unowned'
  console.log('[LandDetailModal] Show purchase button?', showPurchaseButton, 'Land status:', land.status)
  
  return (
    <>
      <AnimatePresence>
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* 添加测试按钮 */}
              <div className="absolute top-4 left-4 z-10 space-y-2">
                <button
                  onClick={testShowModal}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                >
                  测试显示密码弹窗
                </button>
                <div className="text-xs text-white bg-black/50 p-2 rounded">
                  状态: {land.status}
                </div>
              </div>
              
              <div className="relative h-48 bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-t-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Building2 className="w-16 h-16 text-gold-500 mx-auto mb-3" />
                    <h2 className="text-3xl font-bold">{land.land_id}</h2>
                    <p className="text-gray-300 mt-2">{land.blueprint.land_type_display}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 购买区域 - 添加调试信息 */}
                {showPurchaseButton ? (
                  <div className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 rounded-xl p-6 border border-gold-500/30">
                    <div className="text-xs text-gray-400 mb-2">
                      调试信息: status={land.status}, showButton={showPurchaseButton.toString()}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">当前价格</p>
                        <div className="flex items-center gap-2">
                          <Coins className="w-6 h-6 text-gold-500" />
                          <p className="text-3xl font-bold text-gold-500">
                            {formatPrice(land.current_price)}
                          </p>
                          <span className="text-lg text-gold-400">TDB</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">单价</p>
                        <p className="text-xl font-bold">
                          {Math.round(Number(land.current_price) / land.size_sqm)} TDB/㎡
                        </p>
                      </div>
                    </div>
                    
                    {purchaseError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">{purchaseError}</p>
                      </div>
                    )}
                    
                    {/* 购买按钮 - 添加onClick日志 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('[Button] Click event triggered')
                        handlePurchase()
                      }}
                      disabled={purchasing}
                      className={cn(
                        "w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                        "bg-gradient-to-r from-gold-500 to-yellow-600 text-black",
                        "hover:shadow-lg hover:shadow-gold-500/25",
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
                          <ShoppingBag className="w-5 h-5" />
                          立即购买
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-center text-gray-400">
                      此土地状态为: {land.status_display || land.status}，不可购买
                    </p>
                  </div>
                )}
                
                {/* 其他信息区域保持不变 */}
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
                          {land.status_display} ({land.status})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* BetaPasswordModal - 确保正确渲染 */}
      {showBetaPassword && (
        <div className="fixed inset-0 z-[200] bg-red-500/20">
          <div className="fixed top-4 left-4 bg-white text-black p-4 rounded z-[201]">
            调试: BetaPasswordModal 应该显示
          </div>
        </div>
      )}
      
      <BetaPasswordModal
        isOpen={showBetaPassword}
        onClose={() => {
          console.log('[LandDetailModal] BetaPasswordModal onClose')
          setShowBetaPassword(false)
        }}
        onConfirm={handleBetaPasswordConfirm}
        landPrice={Number(land.current_price)}
        landId={land.land_id}
      />
    </>
  )
}
