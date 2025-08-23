// src/app/land/[landId]/page.tsx
// 独立的土地详情页面
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Loader2, Star, Gift, Coins, 
  Pickaxe, Building2, Hash, MapPin, Calendar,
  Zap, Shield, Wheat, AlertCircle
} from 'lucide-react'
import { assetsApi } from '@/lib/api/assets'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

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
  const landId = Number(params.landId)
  const { user } = useAuth()
  
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  
  useEffect(() => {
    if (landId) {
      fetchLandDetails(landId)
    }
  }, [landId])
  
  const fetchLandDetails = async (id: number) => {
    setLoading(true)
    try {
      const landDetail = await assetsApi.lands.get(id)
      setLand(landDetail)
    } catch (err) {
      console.error('[LandDetailPage] Error:', err)
      router.push('/explore')
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
  
  const handlePurchase = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setShowConfirm(true)
  }
  
  const handleConfirmPurchase = async () => {
    setShowConfirm(false)
    if (!land) return
    
    try {
      setPurchasing(true)
      setPurchaseError('')
      
      const response = await assetsApi.lands.buy({
        land_id: land.id,
      })
      
      if (response.success) {
        // 跳转到我的资产页面
        router.push('/assets')
      } else {
        setPurchaseError(response.message || '购买失败')
      }
    } catch (err: any) {
      setPurchaseError(err.message || '购买失败')
    } finally {
      setPurchasing(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    )
  }
  
  if (!land) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">土地不存在</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    )
  }
  
  const originalPrice = parseFloat(land.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const landType = land.blueprint?.land_type || ''
  const giftInfo = landTypeGifts[landType] || null
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <h1 className="text-lg font-bold">{land.land_id}</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 优惠横幅 */}
          {land.status === 'unowned' && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-center mb-8">
              <div className="flex items-center justify-center gap-3 text-white mb-3">
                <Star className="w-6 h-6" />
                <span className="text-2xl font-bold">平行世界土地狂欢 · 限时3折</span>
                <Star className="w-6 h-6" />
              </div>
              <p className="text-white/90">区块链确权，成为元宇宙地主</p>
            </div>
          )}
          
          {/* 赠品提示 */}
          {land.status === 'unowned' && giftInfo && (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-green-400" />
                <span className="text-xl font-bold text-green-400">购买即送专属道具</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <Pickaxe className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">{giftInfo.tools}</span>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <Wheat className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">{giftInfo.food}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 信息卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 基本信息 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
                基本信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID</span>
                  <span className="font-mono">{land.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span>{land.blueprint?.size_sqm || 0}㎡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span>({land.coordinate_x}, {land.coordinate_y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">交易次数</span>
                  <span>{land.transaction_count || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 位置信息 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                位置信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span>{land.region?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">上级</span>
                  <span>{land.region?.parent_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">代码</span>
                  <span className="font-mono text-sm">{land.region?.code || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">等级</span>
                  <span>Lv.{land.region?.level || 0}</span>
                </div>
              </div>
            </div>
            
            {/* 类型信息 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                类型信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型</span>
                  <span>{land.blueprint?.land_type_display || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">名称</span>
                  <span>{land.blueprint?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">能耗</span>
                  <span>{land.blueprint?.energy_consumption_rate || 0}/天</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 购买区域 */}
          {land.status === 'unowned' && originalPrice > 0 && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-3 rounded-xl mb-6">
                <span className="text-lg font-bold">限时优惠 -70%</span>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">原价</p>
                  <p className="text-2xl text-gray-500 line-through">
                    {formatPrice(originalPrice)} TDB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gold-400 font-bold mb-2">狂欢价</p>
                  <p className="text-3xl font-bold text-gold-500">
                    {formatPrice(discountedPrice)} TDB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-2">节省</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatPrice(savedAmount)} TDB
                  </p>
                </div>
              </div>
              
              {purchaseError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-center">{purchaseError}</p>
                </div>
              )}
              
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg",
                  "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
                  "hover:shadow-xl hover:shadow-purple-500/30",
                  "flex items-center justify-center gap-3",
                  "transition-all",
                  purchasing && "opacity-50 cursor-not-allowed"
                )}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    立即抢购
                  </>
                )}
              </button>
              
              <p className="text-center text-orange-400 mt-4">
                活动截止：9月15日 23:59
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">购买确认</h3>
              <p className="text-gray-400 mb-4">
                确认购买此土地，将消耗您的TDB通证
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300 mb-2">土地编号：{land.land_id}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-500 line-through text-sm">
                    原价 {formatPrice(originalPrice)} TDB
                  </span>
                  <span className="text-gold-500 font-bold text-lg">
                    3折价 {formatPrice(discountedPrice)} TDB
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold"
                >
                  确认购买
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
