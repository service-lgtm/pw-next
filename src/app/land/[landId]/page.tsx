// src/app/land/[landId]/page.tsx
// 最终修复版本 - 确保没有任何地方直接渲染对象

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Star, Gift, Coins, MapPin, Hash, Building2, Pickaxe, Wheat } from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'

const landTypeGifts: Record<string, { tools: string; food: string }> = {
  farm: { tools: '专属工具×1', food: '基础粮食包' },
  iron_mine: { tools: '专属工具×1', food: '基础粮食包' },
  stone_mine: { tools: '专属工具×1', food: '基础粮食包' },
  forest: { tools: '专属工具×1', food: '基础粮食包' },
  yld_mine: { tools: '专属工具×1', food: '基础粮食包' },
}

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
        const data = await assetsApi.lands.get(landId)
        console.log('[LandPage] Data received:', data)
        
        // 立即检查 giftInfo 以确保我们理解数据
        const landType = data?.blueprint?.land_type || 'unknown'
        const giftInfo = landTypeGifts[landType] || null
        console.log('[LandPage] Land type:', landType)
        console.log('[LandPage] Gift info:', giftInfo)
        
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
  
  const handlePurchase = async () => {
    if (!land) return
    
    if (!confirm(`确认购买土地 ${land.land_id}？`)) return
    
    try {
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      if (response.success) {
        alert('购买成功！')
        router.push('/assets')
      } else {
        alert(response.message || '购买失败')
      }
    } catch (err: any) {
      alert(err.message || '购买失败')
    }
  }
  
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
  const savedAmount = originalPrice - discountedPrice
  
  // 获取赠品信息 - 这里是对象，不能直接渲染！
  const giftInfo = landTypeGifts[landType] || null
  
  // 为了调试，让我们打印出来看看
  console.log('[LandPage Render] giftInfo:', giftInfo)
  console.log('[LandPage Render] giftInfo type:', typeof giftInfo)
  
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
          
          {/* 优惠横幅 - 仅在可购买时显示 */}
          {isUnowned && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-white mb-2">
                <Star className="w-5 h-5" />
                <span className="font-bold text-xl">平行世界土地狂欢 · 限时3折</span>
                <Star className="w-5 h-5" />
              </div>
              <p className="text-white/90">区块链确权，成为元宇宙地主</p>
            </div>
          )}
          
          {/* 赠品提示 - 关键修复：必须渲染属性，不能渲染对象！ */}
          {isUnowned && giftInfo && (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-green-400" />
                <span className="text-xl font-bold text-green-400">购买即送专属道具</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <Pickaxe className="w-5 h-5 text-yellow-400" />
                  {/* ✅ 正确：渲染字符串属性 giftInfo.tools */}
                  <span className="text-white">{giftInfo.tools}</span>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <Wheat className="w-5 h-5 text-yellow-400" />
                  {/* ✅ 正确：渲染字符串属性 giftInfo.food */}
                  <span className="text-white">{giftInfo.food}</span>
                </div>
              </div>
              {/* 绝对不要这样做：{giftInfo} - 这会导致 Error #130 */}
            </div>
          )}
          
          {/* 价格卡片 */}
          {isUnowned && originalPrice > 0 && (
            <div className="bg-purple-900/30 rounded-2xl p-6 border border-purple-500/30">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-3 rounded-xl mb-6">
                <span className="text-lg font-bold">限时优惠 -70%</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">原价</p>
                  <p className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)} TDB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gold-400 font-bold mb-1">狂欢价</p>
                  <p className="text-2xl font-bold text-gold-500">
                    {formatPrice(discountedPrice)} TDB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">节省</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatPrice(savedAmount)} TDB
                  </p>
                </div>
              </div>
              
              <button
                onClick={handlePurchase}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Coins className="w-6 h-6" />
                立即抢购
              </button>
              
              <p className="text-center text-orange-400 mt-4 text-sm">
                活动截止：9月15日 23:59
              </p>
            </div>
          )}
          
          {/* 基本信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息卡片 */}
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
                  <span className={isUnowned ? 'text-green-400' : 'text-gray-400'}>
                    {isUnowned ? '可购买' : '已拥有'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">交易次数</span>
                  <span className="text-white">{land.transaction_count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 位置信息卡片 */}
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
          
          {/* 属性信息 */}
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
                {land.blueprint.max_floors > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">最大楼层</p>
                    <p className="text-white">{land.blueprint.max_floors}层</p>
                  </div>
                )}
                {land.blueprint.construction_cost_per_floor && parseFloat(land.blueprint.construction_cost_per_floor) > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">建设成本</p>
                    <p className="text-white">{land.blueprint.construction_cost_per_floor}/层</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
