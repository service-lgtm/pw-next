// src/app/land/[landId]/page.tsx
// 安全版土地详情页面 - 避开所有可能的渲染问题
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Star, Coins, MapPin, Hash, Building2 } from 'lucide-react'

export default function LandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const landId = params.landId ? Number(params.landId) : null
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (!landId) {
      setError('无效的土地ID')
      setLoading(false)
      return
    }
    
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`https://mg.pxsj.net.cn/api/v1/assets/lands/${landId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('[LandPage] Data received:', data)
        setLand(data)
      } catch (err: any) {
        console.error('[LandPage] Error:', err)
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLand()
  }, [landId])
  
  const formatPrice = (price: any): string => {
    if (!price) return '0'
    try {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price
      if (isNaN(numPrice)) return '0'
      return Math.floor(numPrice).toLocaleString('zh-CN')
    } catch {
      return '0'
    }
  }
  
  const handlePurchase = () => {
    alert('购买功能开发中...')
  }
  
  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  // 错误状态
  if (error || !land) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-xl p-8 max-w-md">
          <p className="text-xl text-red-400 mb-6">{error || '土地不存在'}</p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            返回探索
          </button>
        </div>
      </div>
    )
  }
  
  // 安全地获取数据
  const landType = land?.blueprint?.land_type || 'unknown'
  const landTypeName = land?.blueprint?.land_type_display || '未知类型'
  const isUnowned = land?.status === 'unowned'
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  
  // 主要渲染 - 使用最安全的方式
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/explore')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <h1 className="text-lg font-bold text-white">土地详情</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 标题卡片 */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {land.land_id || `土地 #${land.id}`}
                </h1>
                <p className="text-gray-400">{landTypeName}</p>
              </div>
              {isUnowned && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  可购买
                </span>
              )}
            </div>
          </div>
          
          {/* 价格卡片 - 仅在可购买时显示 */}
          {isUnowned && originalPrice > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  限时优惠
                </h2>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                  -70% OFF
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">原价</p>
                  <p className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)} TDB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gold-400 mb-1">狂欢价</p>
                  <p className="text-2xl font-bold text-gold-500">
                    {formatPrice(discountedPrice)} TDB
                  </p>
                </div>
              </div>
              
              <button
                onClick={handlePurchase}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                立即购买
              </button>
            </div>
          )}
          
          {/* 信息网格 - 使用简单的布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
                基本信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID</span>
                  <span className="text-white">{land.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">编号</span>
                  <span className="text-white text-sm">{land.land_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">状态</span>
                  <span className="text-white">
                    {isUnowned ? '可购买' : '已拥有'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">交易次数</span>
                  <span className="text-white">{land.transaction_count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 位置信息 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                位置信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="text-white">{land.region?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">上级</span>
                  <span className="text-white">{land.region?.parent_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="text-white">
                    ({land.coordinate_x || 0}, {land.coordinate_y || 0})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">等级</span>
                  <span className="text-white">Lv.{land.region?.level || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Blueprint 基本信息 - 安全渲染 */}
          {land.blueprint && (
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                属性信息
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">面积</p>
                  <p className="text-white">{land.blueprint.size_sqm || 0}㎡</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">能耗</p>
                  <p className="text-white">{land.blueprint.energy_consumption_rate || 0}/天</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">工具</p>
                  <p className="text-white">{land.blueprint.tool_requirement || 'none'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">产出</p>
                  <p className="text-white">{land.blueprint.output_resource || 'none'}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 所有者信息 */}
          {land.owner_info && (
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-lg mb-4">所有者信息</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">{land.owner_info.nickname || land.owner_info.username}</p>
                  <p className="text-gray-400 text-sm">等级 {land.owner_info.level}</p>
                </div>
                <p className="text-gray-400 text-sm">
                  拥有时间：{land.owned_at ? new Date(land.owned_at).toLocaleDateString('zh-CN') : '-'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
