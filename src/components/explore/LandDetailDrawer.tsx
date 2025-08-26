// src/components/explore/LandDetailDrawer.tsx
// 修复版本 - 正确显示价格和手续费
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// API 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'

// API 函数
async function fetchLandDetail(id: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  const response = await fetch(`${API_BASE_URL}/assets/lands/${id}/`, {
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })
  
  if (!response.ok) {
    throw new Error(`获取土地详情失败: ${response.status}`)
  }
  
  return response.json()
}

async function purchaseLand(landId: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  if (!token) {
    throw new Error('请先登录')
  }
  
  // 确保 land_id 是整数
  const requestBody = { 
    land_id: Math.floor(landId)
  }
  
  console.log('[purchaseLand] 发送请求:', requestBody)
  
  const response = await fetch(`${API_BASE_URL}/assets/lands/buy/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  })
  
  const data = await response.json()
  console.log('[purchaseLand] 响应数据:', data)
  
  if (!response.ok) {
    // 提供更详细的错误信息
    let errorMessage = '购买失败'
    if (data.errors?.non_field_errors) {
      errorMessage = data.errors.non_field_errors[0]
    } else if (data.message) {
      errorMessage = data.message
    } else if (data.detail) {
      errorMessage = data.detail
    }
    throw new Error(errorMessage)
  }
  
  return data
}

// 简单的 SVG 图标组件
const Icons = {
  X: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Loader: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Star: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Gift: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  Coins: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
    </svg>
  ),
  MapPin: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Building: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Zap: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  AlertCircle: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Info: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Pickaxe: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.79,10.62L3.5,21.9l2.6,2.6L17.38,13.21L14.79,10.62z M19.27,7.73l-1.01-1.01c-0.47-0.47-1.15-0.68-1.81-0.55L14.22,6.7 l1.48,1.48l-0.7,0.71l-1.49-1.49l-0.54,2.23c-0.13,0.66,0.08,1.35,0.55,1.81l1.01,1.01c0.47,0.47,1.15,0.68,1.81,0.55l4.95-1.01 c0.35-0.07,0.56-0.42,0.49-0.77C21.72,11,21.63,10.81,21.49,10.67l-2.19-2.19l2.19-2.19c0.14-0.14,0.23-0.33,0.23-0.54 C21.72,5.35,21.45,5,21.14,4.93l-4.95-1.01C15.54,3.79,14.86,4,14.39,4.47l-1.92,1.92l1.41,1.41l1.92-1.92l2.63,0.53l-1.64,1.64 L18.74,9.99l1.63-1.64L19.85,11C19.72,11.65,19.93,12.33,19.27,7.73z M9.5,5.5C10.33,5.5,11,4.83,11,4S10.33,2.5,9.5,2.5S8,3.17,8,4 S8.67,5.5,9.5,5.5z"/>
    </svg>
  ),
  Wheat: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3,4.5C3,2.5 5.5,2.5 5.5,2.5C5.5,2.5 8,2.5 8,4.5C8,5.19 7.76,5.81 7.37,6.31L12,10.94L16.63,6.31C16.24,5.81 16,5.19 16,4.5C16,2.5 18.5,2.5 18.5,2.5C18.5,2.5 21,2.5 21,4.5C21,5.5 20.5,6.36 19.74,6.92L21.84,9C21.94,8.84 22,8.67 22,8.5C22,7.12 21.12,6 20,6V5C21.67,5 23,6.33 23,8C23,8.67 22.67,9.33 22.17,9.75L23.26,10.84C23.65,10.45 24,10 24.25,9.5C24.44,8.96 24.5,8.5 24.5,8C24.5,5.79 22.71,4 20.5,4V3C23.26,3 25.5,5.24 25.5,8C25.5,9.59 24.9,11.05 23.91,12.14L12,24.05L0.09,12.14C-0.9,11.05 -1.5,9.59 -1.5,8C-1.5,5.24 0.74,3 3.5,3V4C1.29,4 -0.5,5.79 -0.5,8C-0.5,8.5 -0.44,8.96 -0.25,9.5C0,10 0.35,10.45 0.74,10.84L1.83,9.75C1.33,9.33 1,8.67 1,8C1,6.33 2.33,5 4,5V6C2.88,6 2,7.12 2,8.5C2,8.67 2.06,8.84 2.16,9L4.26,6.92C3.5,6.36 3,5.5 3,4.5Z"/>
    </svg>
  )
}

// 赠品配置
const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包' },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包' },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包' },
  forest: { tools: '专属工具×1', food: '基础粮食包' },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包' },
}

// 精确计算折扣价格（避免浮点数精度问题）
const calculateDiscountPrice = (originalPrice: number): number => {
  // 保留2位小数，不要向下取整
  const discounted = originalPrice * 0.3
  return Math.round(discounted * 100) / 100  // 保留2位小数
}

// 格式化价格显示
const formatPrice = (price: any): string => {
  if (price === null || price === undefined || price === '') return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '0'
  
  // 如果是整数显示整数，如果有小数显示2位小数
  if (numPrice % 1 === 0) {
    return numPrice.toLocaleString('zh-CN')
  } else {
    return numPrice.toFixed(2)
  }
}

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
  const router = useRouter()
  const { user } = useAuth()
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // 获取土地详情
  useEffect(() => {
    if (!isOpen) {
      setLand(null)
      setLoading(false)
      setError(null)
      setPurchaseMessage(null)
      setShowConfirm(false)
      return
    }
    
    const idToFetch = landId || propLand?.id
    if (idToFetch && typeof idToFetch === 'number') {
      fetchLandDetails(idToFetch)
    } else if (propLand) {
      setLand(propLand)
    }
  }, [isOpen, landId, propLand])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const landDetail = await fetchLandDetail(id)
      console.log('[LandDetailDrawer] Fetched land detail:', landDetail)
      setLand(landDetail)
    } catch (err: any) {
      setError(err.message || '获取土地详情失败')
      if (propLand) setLand(propLand)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateStr: any): string => {
    if (!dateStr) return '—'
    try {
      const normalizedDate = String(dateStr).replace(' ', 'T')
      const date = new Date(normalizedDate)
      if (isNaN(date.getTime())) return '—'
      return date.toLocaleDateString('zh-CN')
    } catch {
      return '—'
    }
  }
  
  // 处理购买
  const handlePurchase = () => {
    if (!user) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setShowConfirm(true)
  }
  
  const confirmPurchase = async () => {
    setShowConfirm(false)
    if (!land) return
    
    setPurchasing(true)
    setPurchaseMessage(null)
    
    try {
      // 确保land_id是整数
      const landId = parseInt(land.id) || land.id
      
      const result = await purchaseLand(landId)
      setPurchaseMessage({ type: 'success', text: result.message || '购买成功！' })
      
      // 刷新土地数据
      await fetchLandDetails(landId)
      
      if (onPurchaseSuccess) {
        setTimeout(() => {
          onPurchaseSuccess()
        }, 1500)
      }
    } catch (err: any) {
      console.error('[购买失败] 详细错误:', err)
      setPurchaseMessage({ type: 'error', text: err.message || '购买失败，请稍后再试' })
    } finally {
      setPurchasing(false)
    }
  }
  
  // 点击详情页
  const handleViewDetail = () => {
    if (land?.id) {
      router.push(`/land/${land.id}`)
    }
  }
  
  if (!isOpen) return null
  
  // 安全地获取数据
  const landType = land?.blueprint?.land_type || 'unknown'
  const isUnowned = land?.status === 'unowned'
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = calculateDiscountPrice(originalPrice)
  const savedAmount = originalPrice - discountedPrice
  const feeAmount = discountedPrice * 0.03  // 3% 手续费
  const totalAmount = discountedPrice + feeAmount  // 总计金额
  const giftInfo = landTypeGifts[landType] || null
  const shouldShowOwnedAt = land?.owner && land?.owned_at
  
  // 安全地获取储量信息
  const getReserves = () => {
    if (!land) return { initial: 0, remaining: 0, depletion: 0 }
    
    const initial = land.initial_reserves || 0
    const remaining = land.remaining_reserves || 0
    const depletion = land.depletion_percentage || 0
    
    return { initial, remaining, depletion }
  }
  
  const reserves = getReserves()
  
  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 抽屉 */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-gray-900 shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 标题栏 */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {loading ? '加载中...' : (land?.land_id || '土地详情')}
              </h3>
              <div className="flex items-center gap-2">
                {land && (
                  <button
                    onClick={handleViewDetail}
                    className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
                  >
                    查看详情页
                  </button>
                )}
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Icons.Loader className="w-8 h-8 text-purple-500" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <Icons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400">{error}</p>
              </div>
            ) : land ? (
              <div className="p-6 space-y-6">
                {/* 消息提示 */}
                {purchaseMessage && (
                  <div className={cn(
                    "p-4 rounded-lg text-center font-medium",
                    purchaseMessage.type === 'success' 
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  )}>
                    {purchaseMessage.text}
                  </div>
                )}
                
                {/* 优惠横幅 */}
                {isUnowned && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-white mb-2">
                      <Icons.Star className="w-5 h-5" />
                      <span className="font-bold text-lg">限时3折优惠</span>
                      <Icons.Star className="w-5 h-5" />
                    </div>
                    <p className="text-white/90 text-sm">平行世界土地狂欢 · 9月15日截止</p>
                  </div>
                )}
                
                {/* 赠品提示 */}
                {isUnowned && giftInfo && (
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Icons.Gift className="w-5 h-5 text-green-400" />
                      <span className="font-bold text-green-400">购买即送专属道具礼包</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-lg p-2 flex items-center gap-2">
                        <Icons.Pickaxe className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-xs font-medium text-white">专属工具</p>
                          <p className="text-xs text-gray-400">{giftInfo.tools}</p>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2 flex items-center gap-2">
                        <Icons.Wheat className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-xs font-medium text-white">粮食补给</p>
                          <p className="text-xs text-gray-400">{giftInfo.food}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 基本信息 */}
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Icons.Building className="w-5 h-5 text-gold-500" />
                    基本信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">类型</span>
                        <span className="text-white text-sm">{land.blueprint?.land_type_display || '未知'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">面积</span>
                        <span className="text-white text-sm">{land.blueprint?.size_sqm || 0}㎡</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">坐标</span>
                        <span className="text-white text-sm">({land.coordinate_x || 0}, {land.coordinate_y || 0})</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">区域</span>
                        <span className="text-white text-sm">{land.region?.name || '未知'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">状态</span>
                        <span className={cn(
                          "text-sm font-medium",
                          isUnowned ? "text-green-400" : "text-yellow-400"
                        )}>
                          {isUnowned ? '可购买' : '已拥有'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">交易次数</span>
                        <span className="text-white text-sm">{land.transaction_count || 0}次</span>
                      </div>
                    </div>
                  </div>
                  
                  {land.owner_info && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">所有者</span>
                        <span className="text-white text-sm">
                          {land.owner_info.nickname || land.owner_info.username}
                        </span>
                      </div>
                      {shouldShowOwnedAt && (
                        <div className="flex justify-between mt-2">
                          <span className="text-gray-400 text-sm">购买时间</span>
                          <span className="text-white text-sm">{formatDate(land.owned_at)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* YLD矿山储量信息 */}
                {land.blueprint?.land_type === 'yld_mine' && (
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Icons.Pickaxe className="w-5 h-5 text-purple-500" />
                      矿山储量信息
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">初始储量</span>
                        <span className="text-white text-sm">{formatPrice(reserves.initial)} YLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">剩余储量</span>
                        <span className="text-yellow-400 text-sm font-medium">
                          {formatPrice(reserves.remaining)} YLD
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">开采进度</span>
                        <span className="text-white text-sm">{reserves.depletion}%</span>
                      </div>
                      {land.accumulated_output !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">累计产出</span>
                          <span className="text-white text-sm">{formatPrice(land.accumulated_output)} YLD</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 价格信息和购买按钮 */}
                <div className="bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-xl p-5 border border-gold-500/30">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Icons.Coins className="w-5 h-5 text-gold-400" />
                    价格信息
                  </h4>
                  
                  {isUnowned ? (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-400 mb-2">狂欢价</p>
                        <div className="flex items-center justify-center gap-2">
                          <Icons.Coins className="w-6 h-6 text-gold-500" />
                          <p className="text-3xl font-bold text-gold-500">
                            {formatPrice(discountedPrice)}
                          </p>
                          <span className="text-lg text-gold-400">TDB</span>
                        </div>
                        <p className="text-sm text-gray-500 line-through mt-2">
                          原价 {formatPrice(originalPrice)} TDB
                        </p>
                        <div className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 inline-block mt-2 text-xs font-bold">
                          节省 {formatPrice(savedAmount)} TDB
                        </div>
                        
                        {/* 费用明细 */}
                        <div className="mt-4 p-3 bg-black/30 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">土地价格</span>
                            <span className="text-white">{formatPrice(discountedPrice)} TDB</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">手续费 (3%)</span>
                            <span className="text-white">{formatPrice(feeAmount)} TDB</span>
                          </div>
                          <div className="border-t border-gray-600 pt-2 flex justify-between">
                            <span className="text-yellow-400 font-medium">总计需要</span>
                            <span className="text-yellow-400 font-bold">{formatPrice(totalAmount)} TDB</span>
                          </div>
                        </div>
                      </div>
                      
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
                            <Icons.Loader className="w-5 h-5" />
                            处理中...
                          </>
                        ) : (
                          <>
                            <Icons.Zap className="w-5 h-5" />
                            立即抢购
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-2">当前价值</p>
                      <div className="flex items-center justify-center gap-2">
                        <Icons.Coins className="w-6 h-6 text-gold-500" />
                        <p className="text-3xl font-bold text-gold-500">
                          {formatPrice(land.current_price)}
                        </p>
                        <span className="text-lg text-gold-400">TDB</span>
                      </div>
                      {land.last_transaction_price && (
                        <p className="text-sm text-gray-400 mt-2">
                          最后成交价：{formatPrice(land.last_transaction_price)} TDB
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 购买确认弹窗 */}
      {showConfirm && land && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Icons.AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-white">购买确认</h3>
              <p className="text-gray-400 mb-4">
                确认购买土地编号：{land.land_id}
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                {/* 价格明细 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">原价</span>
                    <span className="text-gray-500 line-through">{formatPrice(originalPrice)} TDB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">3折价</span>
                    <span className="text-white">{formatPrice(discountedPrice)} TDB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">手续费</span>
                    <span className="text-white">{formatPrice(feeAmount)} TDB</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between">
                    <span className="text-gold-400 font-medium">总计</span>
                    <span className="text-gold-500 font-bold text-lg">{formatPrice(totalAmount)} TDB</span>
                  </div>
                </div>
                
                {giftInfo && (
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <p className="text-xs text-green-400">
                      <Icons.Gift className="w-3 h-3 inline mr-1" />
                      赠送：{giftInfo.tools} + {giftInfo.food}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-400">
                  <Icons.Shield className="w-3 h-3 inline mr-1" />
                  区块链确权，永久拥有您的数字资产
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  取消
                </button>
                <button
                  onClick={confirmPurchase}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  确认购买
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
