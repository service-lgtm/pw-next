// src/components/explore/LandDetailDrawer.tsx
// 基于调试版本的生产版 - 渐进式添加功能
'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, MapPin, Coins, Gift, Star, 
  Pickaxe, Building2, Hash, Calendar,
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
  
  // 不渲染
  if (!isOpen) return null
  
  // 计算价格
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const landType = land?.blueprint?.land_type || ''
  const giftInfo = landType && landTypeGifts[landType] ? landTypeGifts[landType] : null
  
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // 内容（基于调试版本的结构）
  const content = (
    <div className="h-full flex flex-col bg-gray-900">
      {/* 标题栏 */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {loading ? '加载中...' : (land?.land_id || '土地详情')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
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
              <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">购买即送专属道具</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded-lg p-2 flex items-center gap-2">
                    <Pickaxe className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">{giftInfo.tools}</span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">{giftInfo.food}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 基本信息 */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-bold mb-3 text-white">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID</span>
                    <span className="text-white">{land?.id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">类型</span>
                    <span className="text-white">{land?.blueprint?.land_type || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">价格</span>
                    <span className="text-white">{formatPrice(land?.current_price)} TDB</span>
                  </div>
                </div>
              </div>
              
              {/* 位置信息 */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-bold mb-3 text-white">位置信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">区域</span>
                    <span className="text-white">{land?.region?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">坐标</span>
                    <span className="text-white">({land?.coordinate_x || 0}, {land?.coordinate_y || 0})</span>
                  </div>
                </div>
              </div>
              
              {/* 特殊属性测试 */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="font-bold mb-3 text-white">特殊属性</h4>
                {(() => {
                  if (landType === 'forest' || landType === 'stone_mine' || landType === 'iron_mine') {
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">类型</span>
                          <span className="text-white">{landType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">工具</span>
                          <span className="text-white">{land?.blueprint?.tool_requirement || 'none'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">产出</span>
                          <span className="text-white">{land?.blueprint?.output_resource || 'none'}</span>
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="text-sm text-gray-400">
                      默认类型: {landType || 'unknown'}
                    </div>
                  )
                })()}
              </div>
            </div>
            
            {/* 简化的购买按钮 - 不使用复杂的条件渲染 */}
            {land?.status === 'unowned' && originalPrice > 0 ? (
              <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
                <div className="text-center mb-4">
                  <p className="text-xl font-bold text-white mb-2">
                    狂欢价：{formatPrice(discountedPrice)} TDB
                  </p>
                  <p className="text-sm text-gray-400 line-through">
                    原价：{formatPrice(originalPrice)} TDB
                  </p>
                </div>
                
                {purchaseError ? (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 text-center">{purchaseError}</p>
                  </div>
                ) : null}
                
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? '处理中...' : '立即抢购'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            暂无数据
          </div>
        )}
      </div>
    </div>
  )
  
  // 渲染组件
  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />
      
      {/* 主容器 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
          {content}
        </div>
      </div>
      
      {/* 简化的确认弹窗 */}
      {showBetaConfirm && land ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">购买确认</h3>
            <p className="text-gray-400 mb-4">
              确认购买土地 {land?.land_id}？
            </p>
            <p className="text-sm text-gray-300 mb-4">
              价格：{formatPrice(discountedPrice)} TDB
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBetaConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleBetaConfirm}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
