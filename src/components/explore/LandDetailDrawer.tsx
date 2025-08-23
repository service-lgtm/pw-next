// src/components/explore/LandDetailDrawer.tsx
// 终极调试版 - 逐步测试每个功能
'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, Loader2, Star, Gift, Pickaxe, Wheat
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'

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

// 版本1：最基础版本
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
  const [version, setVersion] = useState(1) // 测试版本控制
  
  useEffect(() => {
    if (!isOpen) {
      setLand(null)
      setLoading(false)
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
    try {
      const landDetail = await assetsApi.lands.get(id)
      console.log('[DEBUG] Fetched land:', landDetail)
      setLand(landDetail)
    } catch (err) {
      console.error('[DEBUG] Error:', err)
      if (propLand) setLand(propLand)
    } finally {
      setLoading(false)
    }
  }
  
  const formatPrice = (price: any): string => {
    if (!price) return '0'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '0'
    return Math.floor(numPrice).toLocaleString('zh-CN')
  }
  
  if (!isOpen) return null
  
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const landType = land?.blueprint?.land_type || ''
  const giftInfo = landTypeGifts[landType] || null
  
  // 版本1：最基础内容
  if (version === 1) {
    return (
      <div className="fixed inset-0 z-50">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">土地详情（版本1）</h2>
              <button onClick={() => setVersion(2)} className="px-4 py-2 bg-blue-600 text-white rounded">
                测试版本2
              </button>
              <button onClick={onClose} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">
                关闭
              </button>
              {loading && <p className="text-white mt-4">加载中...</p>}
              {land && (
                <div className="mt-4 text-white">
                  <p>ID: {land.id}</p>
                  <p>类型: {landType}</p>
                  <p>价格: {formatPrice(land.current_price)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 版本2：添加标题栏
  if (version === 2) {
    return (
      <div className="fixed inset-0 z-50">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="h-full flex flex-col">
              {/* 标题栏 */}
              <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    {loading ? '加载中...' : (land?.land_id || '土地详情')}
                  </h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">版本2：带标题栏</h2>
                <button onClick={() => setVersion(3)} className="px-4 py-2 bg-blue-600 text-white rounded">
                  测试版本3
                </button>
                <button onClick={() => setVersion(1)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">
                  返回版本1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 版本3：添加优惠横幅
  if (version === 3) {
    return (
      <div className="fixed inset-0 z-50">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    {loading ? '加载中...' : (land?.land_id || '土地详情')}
                  </h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : land ? (
                  <div className="space-y-6">
                    {/* 优惠横幅 - 测试这个 */}
                    {land?.status === 'unowned' && (
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-white mb-2">
                          <Star className="w-5 h-5" />
                          <span className="font-bold text-lg">限时3折</span>
                          <Star className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    
                    <h2 className="text-xl font-bold text-white">版本3：带优惠横幅</h2>
                    <button onClick={() => setVersion(4)} className="px-4 py-2 bg-blue-600 text-white rounded">
                      测试版本4（赠品）
                    </button>
                    <button onClick={() => setVersion(2)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">
                      返回版本2
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">暂无数据</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 版本4：添加赠品提示（这可能是问题所在）
  if (version === 4) {
    return (
      <div className="fixed inset-0 z-50">
        <div onClick={onClose} className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    {loading ? '加载中...' : (land?.land_id || '土地详情')}
                  </h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : land ? (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">版本4：测试赠品组件</h2>
                    <p className="text-white">landType: {landType}</p>
                    <p className="text-white">giftInfo: {JSON.stringify(giftInfo)}</p>
                    
                    {/* 测试简单条件 */}
                    {giftInfo ? (
                      <div className="bg-green-600/20 rounded-xl p-4 border border-green-500/30">
                        <p className="text-green-400">有赠品信息</p>
                      </div>
                    ) : (
                      <div className="bg-gray-600/20 rounded-xl p-4">
                        <p className="text-gray-400">无赠品信息</p>
                      </div>
                    )}
                    
                    <button onClick={() => setVersion(5)} className="px-4 py-2 bg-blue-600 text-white rounded">
                      测试版本5（完整赠品）
                    </button>
                    <button onClick={() => setVersion(3)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">
                      返回版本3
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">暂无数据</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // 默认返回版本1
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-2xl p-6">
          <p className="text-white">默认版本</p>
          <button onClick={() => setVersion(1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            开始测试
          </button>
        </div>
      </div>
    </div>
  )
}
