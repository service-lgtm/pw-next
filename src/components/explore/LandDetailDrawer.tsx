// src/components/explore/LandDetailDrawer.tsx
// 调试版本 - 用于精确定位问题
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  console.log('[LandDetailDrawer] Rendering with props:', {
    isOpen,
    land: propLand,
    landId
  })
  
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
      console.log('[LandDetailDrawer] Fetching details for ID:', id)
      const landDetail = await assetsApi.lands.get(id)
      console.log('[LandDetailDrawer] Fetched land:', landDetail)
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
  
  // 调试：确保永远不返回 undefined
  if (!isOpen) {
    console.log('[LandDetailDrawer] Not open, returning null')
    return null
  }
  
  // 计算价格
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const landType = land?.blueprint?.land_type || ''
  const giftInfo = landType && landTypeGifts[landType] ? landTypeGifts[landType] : null
  
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  console.log('[LandDetailDrawer] Render state:', {
    land,
    loading,
    landType,
    giftInfo
  })
  
  // 简化版本 - 只渲染基本内容
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
            {/* 基本信息 */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-white mb-3">基本信息</h4>
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
            
            {/* 调试信息 */}
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
              <h4 className="font-bold text-red-400 mb-3">调试信息</h4>
              <pre className="text-xs text-gray-300 overflow-auto">
                {JSON.stringify({
                  landType: land?.blueprint?.land_type,
                  toolRequirement: land?.blueprint?.tool_requirement,
                  outputResource: land?.blueprint?.output_resource,
                  status: land?.status
                }, null, 2)}
              </pre>
            </div>
            
            {/* 特殊属性渲染测试 */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-white mb-3">特殊属性测试</h4>
              {(() => {
                console.log('[DEBUG] Rendering special attributes for type:', landType)
                
                if (landType === 'forest' || landType === 'stone_mine' || landType === 'iron_mine') {
                  const result = (
                    <div className="space-y-2 text-sm">
                      <div>类型匹配: {landType}</div>
                      <div>工具: {land?.blueprint?.tool_requirement || 'none'}</div>
                      <div>产出: {land?.blueprint?.output_resource || 'none'}</div>
                    </div>
                  )
                  console.log('[DEBUG] Special card result:', result)
                  return result
                }
                
                const defaultResult = <div>默认类型: {landType || 'unknown'}</div>
                console.log('[DEBUG] Default card result:', defaultResult)
                return defaultResult
              })()}
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
  
  console.log('[LandDetailDrawer] Final render, content type:', typeof content)
  
  // 渲染组件
  return (
    <>
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
      
      {/* 确认弹窗 */}
      {showBetaConfirm && land && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">购买确认</h3>
            <p className="text-gray-400 mb-4">确认购买土地 {land?.land_id}？</p>
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
      )}
    </>
  )
}
