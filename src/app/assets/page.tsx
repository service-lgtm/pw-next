// src/app/assets/page.tsx
// 资产总览页面 - 增强版

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError, TokenManager } from '@/lib/api'
import { useMyLands } from '@/hooks/useLands'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface AssetSummary {
  totalValue: number
  tdbBalance: number
  yldBalance: number
  landCount: number
  landValue: number
  energyLevel: number
  miningPower: number
}

export default function AssetsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { lands, loading: landsLoading } = useMyLands()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [activeView, setActiveView] = useState<'overview' | 'exchange'>('overview')
  const [exchangeAmount, setExchangeAmount] = useState('')
  const [exchangeType, setExchangeType] = useState<'tdb-to-cash' | 'cash-to-tdb'>('tdb-to-cash')
  
  const [assetSummary, setAssetSummary] = useState<AssetSummary>({
    totalValue: 0,
    tdbBalance: 0,
    yldBalance: 0,
    landCount: 0,
    landValue: 0,
    energyLevel: 100,
    miningPower: 0,
  })

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/assets')
    }
  }, [authLoading, isAuthenticated, router])

  // 获取最新的用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !TokenManager.getAccessToken()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await api.accounts.profile()
        
        if (response.success && response.data) {
          setProfileData(response.data)
        }
      } catch (error) {
        console.error('[Assets] Error fetching profile:', error)
        
        if (error instanceof ApiError && error.status === 401) {
          toast.error('登录已过期，请重新登录')
          router.push('/login?redirect=/assets')
        } else {
          toast.error('加载用户资料失败')
        }
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, router])

  // 计算资产汇总
  useEffect(() => {
    if (!landsLoading && profileData) {
      const tdb = profileData.tdb_balance ? parseFloat(profileData.tdb_balance) : 0
      const yld = profileData.yld_balance ? parseFloat(profileData.yld_balance) : 0
      const landValue = lands.reduce((total, land) => {
        return total + parseFloat(land.current_price || '0')
      }, 0)
      
      setAssetSummary({
        totalValue: tdb + landValue,
        tdbBalance: tdb,
        yldBalance: yld,
        landCount: lands.length,
        landValue: landValue,
        energyLevel: 100, // 模拟数据
        miningPower: lands.length * 5, // 模拟数据
      })
    }
  }, [lands, landsLoading, profileData])

  // 处理兑换
  const handleExchange = () => {
    toast('兑换功能待开放', { icon: '🚧' })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">验证登录状态...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading || landsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载资产数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          平行世界 · 资产中心
        </h1>
        <p className="text-gray-400 mt-1">
          管理您的数字资产与虚拟财富
        </p>
      </motion.div>

      {/* 切换视图标签 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('overview')}
          className={cn(
            "px-4 py-2 font-bold rounded transition-all",
            activeView === 'overview'
              ? "bg-gold-500 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          )}
        >
          资产总览
        </button>
        <button
          onClick={() => setActiveView('exchange')}
          className={cn(
            "px-4 py-2 font-bold rounded transition-all",
            activeView === 'exchange'
              ? "bg-gold-500 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          )}
        >
          兑换中心
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* 总资产卡片 - 增强版 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <PixelCard className="p-8 bg-gradient-to-br from-gold-500/20 to-yellow-600/20 border-gold-500">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-lg text-gray-300 mb-2">资产总价值</p>
                    <p className="text-5xl font-black text-gold-500">
                      {assetSummary.totalValue.toLocaleString()}
                      <span className="text-2xl ml-2">TDB</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      ≈ {(assetSummary.totalValue * 0.01).toFixed(2)} 克黄金
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      参考价：¥{(assetSummary.totalValue * 6.5).toFixed(2)} 
                      <span className="ml-2 text-yellow-500">待开放</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">能量值</p>
                      <div className="mt-1">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${assetSummary.energyLevel}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {assetSummary.energyLevel}/100
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">挖矿算力</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {assetSummary.miningPower}
                      </p>
                      <p className="text-xs text-gray-500">Hash/s</p>
                    </div>
                  </div>
                </div>
              </PixelCard>
            </motion.div>

            {/* 资产分布 - 增强版 */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {/* TDB 积分 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PixelCard className="p-6 hover:border-gold-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-300">黄金通证TDB</h3>
                    <span className="text-3xl">💎</span>
                  </div>
                  <p className="text-3xl font-black text-gold-500">
                    {assetSummary.tdbBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">稳定交易币</p>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      ≈ {(assetSummary.tdbBalance * 0.01).toFixed(2)} 克黄金
                    </p>
                    <button 
                      className="text-xs text-gold-500 hover:text-gold-400 mt-2"
                      onClick={() => toast('购买TDB功能待开放', { icon: '🚧' })}
                    >
                      购买TDB →
                    </button>
                  </div>
                </PixelCard>
              </motion.div>

              {/* YLD 积分 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <PixelCard className="p-6 hover:border-purple-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-300">陨石通证YLD</h3>
                    <span className="text-3xl">⚡</span>
                  </div>
                  <p className="text-3xl font-black text-purple-500">
                    {assetSummary.yldBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">治理代币</p>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      限量：21亿枚
                    </p>
                    <button 
                      className="text-xs text-purple-500 hover:text-purple-400 mt-2"
                      onClick={() => toast('兑换YLD功能待开放', { icon: '🚧' })}
                    >
                      兑换 →
                    </button>
                  </div>
                </PixelCard>
              </motion.div>

              {/* 土地资产 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PixelCard className="p-6 hover:border-green-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-300">土地资产</h3>
                    <span className="text-3xl">🏞️</span>
                  </div>
                  <p className="text-3xl font-black text-green-500">
                    {assetSummary.landCount}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">块土地</p>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      总价值：{assetSummary.landValue.toLocaleString()} TDB
                    </p>
                    <button 
                      className="text-xs text-green-500 hover:text-green-400 mt-2"
                      onClick={() => router.push('/assets/land')}
                    >
                      查看详情 →
                    </button>
                  </div>
                </PixelCard>
              </motion.div>

              {/* NFT矿产 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <PixelCard className="p-6 hover:border-orange-500 transition-all opacity-75">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-300">NFT矿产</h3>
                    <span className="text-3xl">⛏️</span>
                  </div>
                  <p className="text-3xl font-black text-orange-500">
                    待开放
                  </p>
                  <p className="text-sm text-gray-400 mt-1">矿产资源</p>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      铁矿、石矿、木材等
                    </p>
                    <button 
                      className="text-xs text-gray-500 mt-2 cursor-not-allowed"
                      disabled
                    >
                      即将开放
                    </button>
                  </div>
                </PixelCard>
              </motion.div>
            </div>

            {/* 快速操作 - 增强版 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <PixelButton
                onClick={() => router.push('/assets/land')}
                className="w-full justify-center"
              >
                <span className="mr-2">🏞️</span>
                我的土地
              </PixelButton>
              
              <PixelButton
                onClick={() => router.push('/explore/lands')}
                variant="secondary"
                className="w-full justify-center"
              >
                <span className="mr-2">🛒</span>
                购买土地
              </PixelButton>
              
              <PixelButton
                onClick={() => toast('NFT市场待开放', { icon: '🚧' })}
                variant="secondary"
                className="w-full justify-center opacity-75"
              >
                <span className="mr-2">💱</span>
                NFT市场
                <span className="ml-1 text-xs text-yellow-500">待开放</span>
              </PixelButton>
              
              <PixelButton
                onClick={() => toast('招聘市场待开放', { icon: '🚧' })}
                variant="secondary"
                className="w-full justify-center opacity-75"
              >
                <span className="mr-2">👥</span>
                招聘市场
                <span className="ml-1 text-xs text-yellow-500">待开放</span>
              </PixelButton>
              
              <PixelButton
                onClick={() => toast('提货单功能待开放', { icon: '🚧' })}
                variant="secondary"
                className="w-full justify-center opacity-75"
              >
                <span className="mr-2">📦</span>
                提货单
                <span className="ml-1 text-xs text-yellow-500">待开放</span>
              </PixelButton>
            </div>

            {/* 收益统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <PixelCard className="p-6">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <span>📊</span>
                  收益统计
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">今日收益</p>
                    <p className="text-2xl font-bold text-green-500">
                      <span className="text-gray-500">待开放</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">本月收益</p>
                    <p className="text-2xl font-bold text-blue-500">
                      <span className="text-gray-500">待开放</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">累计收益</p>
                    <p className="text-2xl font-bold text-purple-500">
                      <span className="text-gray-500">待开放</span>
                    </p>
                  </div>
                </div>
              </PixelCard>
            </motion.div>

            {/* 最近土地资产 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <PixelCard className="p-6">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <span>📋</span>
                  最近土地资产
                </h3>
                
                {lands.length > 0 ? (
                  <div className="space-y-3">
                    {lands.slice(0, 5).map((land) => (
                      <div
                        key={land.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => router.push(`/assets/land/${land.id}`)}
                      >
                        <div>
                          <p className="font-bold">{land.land_id}</p>
                          <p className="text-sm text-gray-400">
                            {land.land_type_display} · {land.region_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gold-500">
                            {parseFloat(land.current_price).toLocaleString()} TDB
                          </p>
                          <p className="text-xs text-gray-400">{land.size_sqm} m²</p>
                        </div>
                      </div>
                    ))}
                    
                    {lands.length > 5 && (
                      <button
                        onClick={() => router.push('/assets/land')}
                        className="w-full text-center text-sm text-gold-500 hover:text-gold-400 py-2"
                      >
                        查看全部 {lands.length} 块土地 →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>您还没有土地资产</p>
                    <button
                      onClick={() => router.push('/explore/lands')}
                      className="mt-4 text-gold-500 hover:text-gold-400"
                    >
                      去购买土地 →
                    </button>
                  </div>
                )}
              </PixelCard>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="exchange"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* 兑换中心 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 兑换卡片 */}
              <PixelCard className="p-6">
                <h3 className="text-xl font-bold mb-6">选择兑换方式</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setExchangeType('tdb-to-cash')}
                    className={cn(
                      "w-full p-4 rounded border-2 transition-all",
                      exchangeType === 'tdb-to-cash'
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-bold">TDB → 现金</p>
                        <p className="text-sm text-gray-400">
                          将TDB兑换为人民币
                        </p>
                      </div>
                      <span className="text-2xl">💱</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setExchangeType('cash-to-tdb')}
                    className={cn(
                      "w-full p-4 rounded border-2 transition-all",
                      exchangeType === 'cash-to-tdb'
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-bold">现金 → TDB</p>
                        <p className="text-sm text-gray-400">
                          使用人民币购买TDB
                        </p>
                      </div>
                      <span className="text-2xl">💰</span>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    兑换金额
                  </label>
                  <input
                    type="number"
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(e.target.value)}
                    placeholder={exchangeType === 'tdb-to-cash' ? "输入TDB数量" : "输入人民币金额"}
                    className="w-full px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                  />
                  
                  {exchangeAmount && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded">
                      <p className="text-sm text-gray-400">预估到账：</p>
                      <p className="text-xl font-bold text-gold-500">
                        {exchangeType === 'tdb-to-cash' 
                          ? `¥${(parseFloat(exchangeAmount) * 6.5 * 0.95).toFixed(2)}`
                          : `${(parseFloat(exchangeAmount) / 6.5 * 0.95).toFixed(2)} TDB`
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        手续费：5% <span className="text-yellow-500">(待开放)</span>
                      </p>
                    </div>
                  )}
                  
                  <PixelButton
                    onClick={handleExchange}
                    className="w-full mt-4 opacity-75"
                    disabled
                  >
                    立即兑换
                    <span className="ml-2 text-xs text-yellow-500">待开放</span>
                  </PixelButton>
                </div>
              </PixelCard>
              
              {/* 兑换记录 */}
              <PixelCard className="p-6">
                <h3 className="text-xl font-bold mb-6">兑换记录</h3>
                
                <div className="text-center py-12 text-gray-400">
                  <span className="text-4xl">📝</span>
                  <p className="mt-4">暂无兑换记录</p>
                  <p className="text-sm mt-2 text-yellow-500">功能待开放</p>
                </div>
              </PixelCard>
            </div>
            
            {/* 兑换说明 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <PixelCard className="p-6 bg-yellow-500/10 border-yellow-500/30">
                <h4 className="font-bold mb-3 text-yellow-500">兑换说明</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• 最小兑换金额：100 TDB 或 ¥650</li>
                  <li>• 兑换手续费：5%（待开放后生效）</li>
                  <li>• 预计到账时间：2-72小时</li>
                  <li>• 兑换比例：1 TDB ≈ ¥6.5（实时浮动）</li>
                  <li className="text-yellow-500">• 该功能目前处于待开放状态</li>
                </ul>
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// src/app/assets/land/[id]/page.tsx
// 土地详情页面 - 增强版

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { useLandDetail } from '@/hooks/useLands'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface PageProps {
  params: {
    id: string
  }
}

interface MiningRecord {
  id: string
  date: string
  resource: string
  amount: number
  status: 'completed' | 'mining' | 'pending'
}

export default function LandDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const landId = parseInt(params.id)
  const { land, loading, error } = useLandDetail(landId)
  const [activeTab, setActiveTab] = useState<'info' | 'mining' | 'history' | 'actions'>('info')
  const [miningRecords] = useState<MiningRecord[]>([
    {
      id: '1',
      date: '2025-12-12',
      resource: '石矿',
      amount: 123.12,
      status: 'completed'
    },
    {
      id: '2',
      date: '2025-12-12',
      resource: '铁矿',
      amount: 45.00,
      status: 'mining'
    }
  ])

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push(`/login?redirect=/assets/land/${landId}`)
    }
  }, [authLoading, isAuthenticated, router, landId])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error || !land) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500 mb-4">{error || '土地不存在'}</p>
          <PixelButton onClick={() => router.push('/assets/land')}>
            返回土地列表
          </PixelButton>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 返回按钮 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.push('/assets/land')}
          className="text-gray-400 hover:text-white flex items-center gap-2"
        >
          <span>←</span>
          返回土地列表
        </button>
      </motion.div>

      {/* 土地基本信息 - 增强版 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <PixelCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-white mb-2">{land.land_id}</h1>
              <p className="text-gray-400">{land.region.name} · {land.blueprint.land_type_display}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  已认证
                </span>
                {land.is_special && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    ⭐ 特殊地块
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  Level {land.construction_level}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">当前价值</p>
              <p className="text-3xl font-black text-gold-500">
                {parseFloat(land.current_price).toLocaleString()} TDB
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ≈ ¥<span className="text-yellow-500">待开放</span>
              </p>
            </div>
          </div>
        </PixelCard>
      </motion.div>

      {/* 标签页 - 增强版 */}
      <div className="mb-6">
        <div className="flex gap-2 border-b-2 border-gray-800 overflow-x-auto">
          {(['info', 'mining', 'history', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 font-bold transition-all whitespace-nowrap",
                activeTab === tab
                  ? "text-gold-500 border-b-2 border-gold-500 -mb-0.5"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {tab === 'info' && '基本信息'}
              {tab === 'mining' && '开采管理'}
              {tab === 'history' && '交易历史'}
              {tab === 'actions' && '操作'}
            </button>
          ))}
        </div>
      </div>

      {/* 标签内容 - 增强版 */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 土地属性 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">土地属性</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">类型</span>
                  <span className="font-bold">{land.blueprint.land_type_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">面积</span>
                  <span className="font-bold">{land.size_sqm.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">坐标</span>
                  <span className="font-mono">({land.coordinate_x}, {land.coordinate_y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">初始价格</span>
                  <span>{parseFloat(land.initial_price).toLocaleString()} TDB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">购买时间</span>
                  <span>{new Date(land.owned_at || land.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">储量</span>
                  <span className="text-yellow-500">待开放</span>
                </div>
              </div>
            </PixelCard>

            {/* 生产信息 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">生产信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">日产出</span>
                  <span className="font-bold">
                    <span className="text-yellow-500">待开放</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">建筑等级</span>
                  <span>{land.construction_level}/{land.blueprint.max_floors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">生产状态</span>
                  <span className="text-yellow-500">待开放</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">累计产出</span>
                  <span className="text-yellow-500">待开放</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">能耗率</span>
                  <span>{land.blueprint.energy_consumption_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">开采名额</span>
                  <span className="text-yellow-500">待开放</span>
                </div>
              </div>
            </PixelCard>

            {/* 蓝图信息 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">蓝图信息</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-300">{land.blueprint.description}</p>
                {land.blueprint.features.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-400 mb-2">特性：</p>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {land.blueprint.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </PixelCard>

            {/* 区域信息 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">所属区域</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">区域</span>
                  <span className="font-bold">{land.region.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域代码</span>
                  <span className="font-mono">{land.region.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">区域类型</span>
                  <span>{land.region.region_type}</span>
                </div>
                {land.region.parent_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">上级区域</span>
                    <span>{land.region.parent_name}</span>
                  </div>
                )}
              </div>
            </PixelCard>
          </motion.div>
        )}

        {activeTab === 'mining' && (
          <motion.div
            key="mining"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 开采状态 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">开采状态</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">当前开采</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      待开放
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-500">暂未开采</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800/30 rounded">
                    <p className="text-2xl">⛏️</p>
                    <p className="text-sm text-gray-400 mt-1">工具状态</p>
                    <p className="text-xs text-yellow-500">待开放</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded">
                    <p className="text-2xl">⚡</p>
                    <p className="text-sm text-gray-400 mt-1">能量值</p>
                    <p className="text-xs text-yellow-500">待开放</p>
                  </div>
                </div>
              </div>
            </PixelCard>

            {/* 开采记录 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">开采记录</h3>
              <div className="space-y-3">
                {miningRecords.map((record) => (
                  <div key={record.id} className="p-3 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{record.resource}</p>
                        <p className="text-xs text-gray-400">{record.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold-500">
                          <span className="text-gray-500 line-through">{record.amount}</span>
                        </p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          record.status === 'completed' && "bg-green-500/20 text-green-400",
                          record.status === 'mining' && "bg-blue-500/20 text-blue-400",
                          record.status === 'pending' && "bg-gray-500/20 text-gray-400"
                        )}>
                          待开放
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PixelCard>

            {/* 招聘管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">招聘管理</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  发布招聘，让其他玩家帮助您开采资源
                </p>
                <PixelButton
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  发布带工具招聘
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  发布无工具招聘
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
              </div>
            </PixelCard>

            {/* 能量管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">能量管理</h3>
              <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: '0%' }} />
                </div>
                <p className="text-center text-sm text-gray-400">
                  能量：<span className="text-yellow-500">待开放</span> / 100
                </p>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  补充能量
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
              </div>
            </PixelCard>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">交易历史</h3>
              {land.recent_transactions && land.recent_transactions.length > 0 ? (
                <div className="space-y-3">
                  {land.recent_transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-gray-800/50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{tx.transaction_type_display}</p>
                          <p className="text-sm text-gray-400">
                            {tx.from_username} → {tx.to_username}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gold-500">
                            {parseFloat(tx.price).toLocaleString()} TDB
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">暂无交易记录</p>
              )}
            </PixelCard>
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 生产管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">生产管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  开始生产
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  收取产出
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
              </div>
            </PixelCard>

            {/* 建筑管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">建筑管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  升级建筑
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                <p className="text-sm text-gray-400">
                  升级费用：<span className="text-yellow-500">待开放</span> TDB/层
                </p>
              </div>
            </PixelCard>

            {/* 交易管理 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">交易管理</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  出售土地
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  出租土地
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
              </div>
            </PixelCard>

            {/* 合成功能 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4">资源合成</h3>
              <div className="space-y-4">
                <PixelButton
                  disabled
                  variant="secondary"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  合成砖块
                  <span className="ml-2 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                <p className="text-xs text-gray-400">
                  需要：石矿80% + 木头20% + 0.08 YLD
                </p>
              </div>
            </PixelCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
