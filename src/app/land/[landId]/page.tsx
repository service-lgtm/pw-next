// src/app/land/[landId]/page.tsx
// 生产版本 - 完全独立，不依赖外部组件
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// 内联样式类
const styles = {
  container: "min-h-screen bg-[#0A0F1B]",
  header: "border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-10",
  headerContent: "container mx-auto px-4",
  headerFlex: "flex items-center gap-4 h-16",
  backButton: "p-2 hover:bg-gray-800 rounded-lg transition-colors text-white",
  mainContent: "container mx-auto px-4 py-6",
  gridLayout: "grid lg:grid-cols-3 gap-6",
  leftColumn: "lg:col-span-2 space-y-6",
  rightColumn: "space-y-6",
  card: "bg-gray-800/50 rounded-xl p-6",
  banner: "bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-5",
  giftCard: "bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-5 border border-green-500/30",
  priceCard: "bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-xl p-6 border border-gold-500/30",
  button: "w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25",
  buttonDisabled: "opacity-50 cursor-not-allowed",
  errorContainer: "min-h-screen bg-[#0A0F1B] flex items-center justify-center",
  errorCard: "text-center bg-gray-800 rounded-xl p-8 max-w-md",
  loadingContainer: "min-h-screen bg-[#0A0F1B] flex items-center justify-center",
  loadingContent: "text-center",
  successMessage: "p-4 rounded-lg text-center font-medium bg-green-500/20 text-green-400 border border-green-500/30",
  errorMessage: "p-4 rounded-lg text-center font-medium bg-red-500/20 text-red-400 border border-red-500/30",
}

// 简单的图标组件
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const LoaderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const CoinsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
  </svg>
)

const StarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const GiftIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

// API 请求函数
async function fetchLandDetail(id: number) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  const response = await fetch(`${API_BASE_URL}/assets/lands/${id}/`, {
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function purchaseLand(landId: number) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mg.pxsj.net.cn/api/v1'
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  if (!token) {
    throw new Error('请先登录')
  }
  
  const response = await fetch(`${API_BASE_URL}/assets/lands/buy/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ land_id: landId })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || '购买失败')
  }
  
  return data
}

// 格式化函数
const formatPrice = (price: any): string => {
  if (!price) return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0' : Math.floor(numPrice).toLocaleString('zh-CN')
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

// 赠品配置
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
  
  const [land, setLand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  useEffect(() => {
    if (!landId || isNaN(landId)) {
      setError('无效的土地ID')
      setLoading(false)
      return
    }
    
    const loadData = async () => {
      try {
        const data = await fetchLandDetail(landId)
        setLand(data)
      } catch (err: any) {
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [landId])
  
  const handlePurchase = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push(`/login?redirect=/land/${landId}`)
      return
    }
    
    setPurchasing(true)
    setMessage(null)
    
    try {
      const result = await purchaseLand(landId)
      setMessage({ type: 'success', text: '购买成功！' })
      setTimeout(() => {
        router.push('/assets')
      }, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '购买失败' })
    } finally {
      setPurchasing(false)
    }
  }
  
  // 加载状态
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoaderIcon className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  // 错误状态
  if (error || !land) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className="text-2xl font-bold text-red-500 mb-4">出错了</h2>
          <p className="text-gray-400 mb-6">{error || '土地不存在'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            返回
          </button>
        </div>
      </div>
    )
  }
  
  // 计算价格
  const landType = land?.blueprint?.land_type || 'unknown'
  const isUnowned = land?.status === 'unowned'
  const originalPrice = parseFloat(land?.current_price || '0')
  const discountedPrice = originalPrice * 0.3
  const savedAmount = originalPrice - discountedPrice
  const giftInfo = landTypeGifts[landType] || null
  const shouldShowOwnedAt = land?.owner && land?.owned_at
  
  return (
    <div className={styles.container}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerFlex}>
            <button onClick={() => router.back()} className={styles.backButton}>
              <ArrowLeftIcon />
            </button>
            <h1 className="text-xl font-bold text-white">土地详情 - {land.land_id}</h1>
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className={styles.mainContent}>
        {/* 消息提示 */}
        {message && (
          <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {message.text}
          </div>
        )}
        
        <div className={styles.gridLayout}>
          {/* 左侧内容 */}
          <div className={styles.leftColumn}>
            {/* 优惠横幅 */}
            {isUnowned && (
              <div className={styles.banner}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarIcon />
                      <h2 className="text-xl font-bold text-white">平行世界土地狂欢</h2>
                    </div>
                    <p className="text-white/90">全平台虚拟地块3折开抢！</p>
                  </div>
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                    -70% OFF
                  </div>
                </div>
              </div>
            )}
            
            {/* 赠品信息 */}
            {isUnowned && giftInfo && (
              <div className={styles.giftCard}>
                <div className="flex items-center gap-3 mb-3">
                  <GiftIcon />
                  <span className="font-bold text-green-400 text-lg">购买即送专属道具礼包</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-white">专属工具</p>
                    <p className="text-xs text-gray-300">{giftInfo.tools}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-white">粮食补给</p>
                    <p className="text-xs text-gray-300">{giftInfo.food}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 基本信息 */}
            <div className={styles.card}>
              <h2 className="text-2xl font-bold mb-6 text-white">{land.land_id}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3 text-white">基本信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">类型</span>
                      <span className="text-white">{land.blueprint?.land_type_display || '未知'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">面积</span>
                      <span className="text-white">{land.blueprint?.size_sqm || 0}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">坐标</span>
                      <span className="text-white">({land.coordinate_x}, {land.coordinate_y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域</span>
                      <span className="text-white">{land.region?.name || '未知'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-white">所有权信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">状态</span>
                      <span className={isUnowned ? "text-green-400" : "text-yellow-400"}>
                        {isUnowned ? '可购买' : '已拥有'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">所有者</span>
                      <span className="text-white">
                        {land.owner_info?.nickname || land.owner_info?.username || '—'}
                      </span>
                    </div>
                    {shouldShowOwnedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">购买时间</span>
                        <span className="text-white">{formatDate(land.owned_at)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">交易次数</span>
                      <span className="text-white">{land.transaction_count || 0}次</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* YLD矿山储量信息 */}
              {land.blueprint?.land_type === 'yld_mine' && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-bold mb-3 text-white">矿山储量信息</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">初始储量</span>
                      <span className="text-white">{formatPrice(land.initial_reserves)} YLD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">剩余储量</span>
                      <span className="text-yellow-400">{formatPrice(land.remaining_reserves)} YLD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">开采进度</span>
                      <span className="text-white">{land.depletion_percentage || 0}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 右侧价格信息 */}
          <div className={styles.rightColumn}>
            <div className={styles.priceCard}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                <CoinsIcon />
                价格信息
              </h3>
              
              {isUnowned ? (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-400 mb-2">狂欢价</p>
                    <div className="flex items-center justify-center gap-2">
                      <CoinsIcon className="w-8 h-8 text-gold-500" />
                      <p className="text-4xl font-bold text-gold-500">{formatPrice(discountedPrice)}</p>
                      <span className="text-xl text-gold-400">TDB</span>
                    </div>
                    <p className="text-sm text-gray-500 line-through mt-2">
                      原价 {formatPrice(originalPrice)} TDB
                    </p>
                    <div className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 inline-block mt-2 text-xs font-bold">
                      节省 {formatPrice(savedAmount)} TDB
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className={`${styles.button} ${purchasing ? styles.buttonDisabled : ''}`}
                  >
                    {purchasing ? (
                      <>
                        <LoaderIcon />
                        处理中...
                      </>
                    ) : (
                      '立即抢购'
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">当前价值</p>
                  <div className="flex items-center justify-center gap-2">
                    <CoinsIcon className="w-8 h-8 text-gold-500" />
                    <p className="text-4xl font-bold text-gold-500">{formatPrice(land.current_price)}</p>
                    <span className="text-xl text-gold-400">TDB</span>
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
        </div>
      </div>
    </div>
  )
}
