// src/app/assets/page.tsx
// 资产总览页面 - 增强版（基于原型图重构）

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

interface MineralAsset {
  id: string
  name: string
  amount: number
  price: number
  icon: string
}

interface ToolAsset {
  id: string
  name: string
  type: 'axe' | 'pickaxe' | 'hoe'
  amount: number
  icon: string
}

export default function AssetsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { lands, loading: landsLoading } = useMyLands()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  
  // 主视图切换：总览、NFT仓库、交易中心
  const [activeView, setActiveView] = useState<'overview' | 'nft-warehouse' | 'exchange'>('overview')
  
  // NFT仓库子视图
  const [warehouseTab, setWarehouseTab] = useState<'lands' | 'minerals' | 'tools' | 'seeds' | 'foods'>('lands')
  
  // 兑换相关状态
  const [exchangeAmount, setExchangeAmount] = useState('')
  const [exchangeType, setExchangeType] = useState<'tdb-to-cash' | 'cash-to-tdb'>('tdb-to-cash')
  
  // 模拟的矿产数据
  const [minerals] = useState<MineralAsset[]>([
    { id: '1', name: '铁矿', amount: 123.12, price: 0, icon: '🪨' },
    { id: '2', name: '石矿', amount: 123.12, price: 0, icon: '⛰️' },
    { id: '3', name: '木材', amount: 123.12, price: 0, icon: '🪵' },
    { id: '4', name: '砖头', amount: 123, price: 0, icon: '🧱' },
    { id: '5', name: '锤头', amount: 123, price: 0, icon: '🔨' },
    { id: '6', name: '斧头', amount: 123, price: 0, icon: '🪓' },
  ])
  
  // 模拟的工具数据
  const [tools] = useState<ToolAsset[]>([
    { id: '1', name: '镐头', type: 'pickaxe', amount: 123, icon: '⛏️' },
    { id: '2', name: '斧头', type: 'axe', amount: 123, icon: '🪓' },
    { id: '3', name: '锄头', type: 'hoe', amount: 123, icon: '🔧' },
  ])
  
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
        energyLevel: 100,
        miningPower: lands.length * 5,
      })
    }
  }, [lands, landsLoading, profileData])

  // 处理兑换
  const handleExchange = () => {
    toast('兑换功能待开放', { icon: '🚧' })
  }
  
  // 处理合成
  const handleSynthesize = (item: string) => {
    toast(`合成${item}功能待开放`, { icon: '🚧' })
  }
  
  // 处理出售
  const handleSell = (item: string) => {
    toast(`出售${item}功能待开放`, { icon: '🚧' })
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
          平行世界
        </h1>
        <p className="text-gray-400 mt-1">
          {activeView === 'overview' && '资产总览'}
          {activeView === 'nft-warehouse' && 'NFT仓库'}
          {activeView === 'exchange' && '兑换中心'}
        </p>
      </motion.div>

      {/* 主导航标签 */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-3">
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
          onClick={() => setActiveView('nft-warehouse')}
          className={cn(
            "px-4 py-2 font-bold rounded transition-all",
            activeView === 'nft-warehouse'
              ? "bg-gold-500 text-black"
              : "bg-gray-800 text-gray-400 hover:text-white"
          )}
        >
          我的NFT仓库
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
        {/* 资产总览视图 */}
        {activeView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* 总资产卡片 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <PixelCard className="p-8 bg-gradient-to-br from-gold-500/20 to-yellow-600/20 border-gold-500">
                <div className="text-center">
                  <p className="text-lg text-gray-300 mb-2">资产总价值</p>
                  <p className="text-5xl font-black text-gold-500">
                    {assetSummary.totalValue.toLocaleString()}
                    <span className="text-2xl ml-2">TDB</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    ≈ {(assetSummary.totalValue * 0.01).toFixed(2)} 克黄金
                  </p>
                </div>
              </PixelCard>
            </motion.div>

            {/* 双币种展示区 */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* 黄金通证TDB */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PixelCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">黄金通证TDB</h3>
                    <button
                      onClick={() => toast('购买TDB功能待开放', { icon: '🚧' })}
                      className="text-sm text-gold-500 hover:text-gold-400"
                    >
                      购买TDB
                    </button>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-4xl font-black text-gold-500">
                      {assetSummary.tdbBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      ≈ {(assetSummary.tdbBalance * 0.01).toFixed(2)} 克黄金
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setActiveView('exchange')}
                      className="w-full py-2 text-center text-sm text-gold-500 hover:text-gold-400 bg-gray-800 rounded"
                    >
                      兑换
                    </button>
                  </div>
                </PixelCard>
              </motion.div>

              {/* 陨石通证YLD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <PixelCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">陨石通证YLD</h3>
                    <button
                      onClick={() => toast('兑换YLD功能待开放', { icon: '🚧' })}
                      className="text-sm text-purple-500 hover:text-purple-400"
                    >
                      兑换
                    </button>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-4xl font-black text-purple-500">
                      {assetSummary.yldBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      ≈ {(assetSummary.yldBalance * 0.01).toFixed(2)} TDB
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-center text-gray-400">
                      限量发行：21亿枚
                    </p>
                  </div>
                </PixelCard>
              </motion.div>
            </div>

            {/* 资产分布网格 */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <PixelCard 
                className="p-4 hover:border-green-500 transition-all cursor-pointer"
                onClick={() => router.push('/assets/land')}
              >
                <div className="text-center">
                  <span className="text-3xl">🏞️</span>
                  <p className="text-sm text-gray-400 mt-2">土地</p>
                  <p className="text-xl font-bold text-green-500">{assetSummary.landCount}</p>
                </div>
              </PixelCard>

              <PixelCard className="p-4 opacity-75">
                <div className="text-center">
                  <span className="text-3xl">⛏️</span>
                  <p className="text-sm text-gray-400 mt-2">矿产</p>
                  <p className="text-xl font-bold text-gray-500">待开放</p>
                </div>
              </PixelCard>

              <PixelCard className="p-4 opacity-75">
                <div className="text-center">
                  <span className="text-3xl">🔧</span>
                  <p className="text-sm text-gray-400 mt-2">工具</p>
                  <p className="text-xl font-bold text-gray-500">待开放</p>
                </div>
              </PixelCard>

              <PixelCard className="p-4 opacity-75">
                <div className="text-center">
                  <span className="text-3xl">🏗️</span>
                  <p className="text-sm text-gray-400 mt-2">房产</p>
                  <p className="text-xl font-bold text-gray-500">待开放</p>
                </div>
              </PixelCard>
            </div>

            {/* 快速操作区 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4">快速操作</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <PixelButton
                  onClick={() => router.push('/explore/lands')}
                  className="w-full justify-center"
                >
                  <span className="mr-2">🛒</span>
                  购买土地
                </PixelButton>
                
                <PixelButton
                  onClick={() => toast('NFT市场待开放', { icon: '🚧' })}
                  variant="secondary"
                  className="w-full justify-center opacity-75"
                  disabled
                >
                  <span className="mr-2">💱</span>
                  NFT市场
                  <span className="ml-1 text-xs text-yellow-500">待开放</span>
                </PixelButton>
                
                <PixelButton
                  onClick={() => toast('招聘市场待开放', { icon: '🚧' })}
                  variant="secondary"
                  className="w-full justify-center opacity-75"
                  disabled
                >
                  <span className="mr-2">👥</span>
                  招聘市场
                  <span className="ml-1 text-xs text-yellow-500">待开放</span>
                </PixelButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* NFT仓库视图 */}
        {activeView === 'nft-warehouse' && (
          <motion.div
            key="nft-warehouse"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* NFT仓库子标签 */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {(['lands', 'minerals', 'tools', 'seeds', 'foods'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWarehouseTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold rounded whitespace-nowrap transition-all",
                    warehouseTab === tab
                      ? "bg-purple-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  {tab === 'lands' && '土地'}
                  {tab === 'minerals' && '矿产'}
                  {tab === 'tools' && '工具'}
                  {tab === 'seeds' && '种子'}
                  {tab === 'foods' && '粮食'}
                </button>
              ))}
            </div>

            {/* NFT内容区 */}
            <AnimatePresence mode="wait">
              {/* 土地列表 */}
              {warehouseTab === 'lands' && (
                <motion.div
                  key="lands"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-3 gap-4"
                >
                  {lands.slice(0, 6).map((land) => (
                    <PixelCard 
                      key={land.id}
                      className="p-4 hover:border-gold-500 transition-all cursor-pointer"
                      onClick={() => router.push(`/assets/land/${land.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{land.land_id}</h4>
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                          {land.land_type_display}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{land.region_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{land.size_sqm} m²</span>
                        <span className="text-sm font-bold text-gold-500">
                          {parseFloat(land.current_price).toLocaleString()} TDB
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toast('出售功能待开放', { icon: '🚧' })
                          }}
                          className="flex-1 text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
                        >
                          出售
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toast('建设功能待开放', { icon: '🚧' })
                          }}
                          className="flex-1 text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
                        >
                          建设
                        </button>
                      </div>
                    </PixelCard>
                  ))}
                </motion.div>
              )}

              {/* 矿产列表 */}
              {warehouseTab === 'minerals' && (
                <motion.div
                  key="minerals"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-4 gap-4"
                >
                  {minerals.map((mineral) => (
                    <PixelCard key={mineral.id} className="p-4 opacity-75">
                      <div className="text-center">
                        <span className="text-3xl">{mineral.icon}</span>
                        <h4 className="font-bold mt-2">{mineral.name}</h4>
                        <p className="text-2xl font-bold text-gray-500 mt-2">
                          <span className="line-through">{mineral.amount}</span>
                        </p>
                        <p className="text-xs text-yellow-500 mt-1">待开放</p>
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={() => handleSell(mineral.name)}
                            className="flex-1 text-xs py-1 bg-gray-800 rounded opacity-50 cursor-not-allowed"
                            disabled
                          >
                            出售
                          </button>
                          <button 
                            onClick={() => handleSynthesize(mineral.name)}
                            className="flex-1 text-xs py-1 bg-gray-800 rounded opacity-50 cursor-not-allowed"
                            disabled
                          >
                            合成
                          </button>
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                </motion.div>
              )}

              {/* 工具列表 */}
              {warehouseTab === 'tools' && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-3 gap-4"
                >
                  {tools.map((tool) => (
                    <PixelCard key={tool.id} className="p-4 opacity-75">
                      <div className="text-center">
                        <span className="text-4xl">{tool.icon}</span>
                        <h4 className="font-bold mt-2">{tool.name}</h4>
                        <p className="text-2xl font-bold text-gray-500 mt-2">
                          <span className="line-through">{tool.amount}</span>
                        </p>
                        <p className="text-xs text-yellow-500 mt-1">待开放</p>
                        <div className="mt-3 flex gap-2">
                          <button 
                            className="flex-1 text-xs py-1 bg-gray-800 rounded opacity-50 cursor-not-allowed"
                            disabled
                          >
                            使用
                          </button>
                          <button 
                            className="flex-1 text-xs py-1 bg-gray-800 rounded opacity-50 cursor-not-allowed"
                            disabled
                          >
                            出售
                          </button>
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                </motion.div>
              )}

              {/* 种子列表 */}
              {warehouseTab === 'seeds' && (
                <motion.div
                  key="seeds"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-64"
                >
                  <div className="text-center text-gray-400">
                    <span className="text-4xl">🌱</span>
                    <p className="mt-4">暂无种子</p>
                    <p className="text-sm mt-2 text-yellow-500">功能待开放</p>
                  </div>
                </motion.div>
              )}

              {/* 粮食列表 */}
              {warehouseTab === 'foods' && (
                <motion.div
                  key="foods"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-64"
                >
                  <div className="text-center text-gray-400">
                    <span className="text-4xl">🌾</span>
                    <p className="mt-4">暂无粮食</p>
                    <p className="text-sm mt-2 text-yellow-500">功能待开放</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 兑换中心视图 */}
        {activeView === 'exchange' && (
          <motion.div
            key="exchange"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* 兑换卡片 */}
              <PixelCard className="p-6">
                <h3 className="text-xl font-bold mb-6">选择兑换方式</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 rounded border-2 border-gray-700 hover:border-gold-500 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="exchange"
                      value="tdb-to-cash"
                      checked={exchangeType === 'tdb-to-cash'}
                      onChange={(e) => setExchangeType(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-bold">支付宝</p>
                      <p className="text-sm text-gray-400">银行卡</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 rounded border-2 border-gray-700 hover:border-gold-500 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="exchange"
                      value="cash-to-tdb"
                      checked={exchangeType === 'cash-to-tdb'}
                      onChange={(e) => setExchangeType(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-bold">银行卡</p>
                      <p className="text-sm text-gray-400">支付宝</p>
                    </div>
                  </label>
                </div>
                
                <div className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">收款人</label>
                      <input
                        type="text"
                        placeholder="请输入"
                        className="w-full px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">账户</label>
                      <input
                        type="text"
                        placeholder="请输入"
                        className="w-full px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">银行</label>
                      <input
                        type="text"
                        placeholder="请输入"
                        className="w-full px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm text-gray-400 mb-2">
                      兑换金额
                      <span className="float-right">可用余额：{assetSummary.tdbBalance.toLocaleString()} TDB</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={exchangeAmount}
                        onChange={(e) => setExchangeAmount(e.target.value)}
                        placeholder="最小兑换数量 100.00"
                        className="flex-1 px-4 py-2 bg-gray-800 text-white border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                      />
                      <span className="px-4 py-2 bg-gray-800 text-white rounded">TDB</span>
                    </div>
                  </div>
                  
                  {exchangeAmount && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">兑换税率：</span>
                        <span className="text-sm">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">预估到账：</span>
                        <span className="font-bold text-gold-500">
                          {(parseFloat(exchangeAmount) * 0.95).toFixed(2)} 元
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <PixelButton
                    onClick={handleExchange}
                    className="w-full mt-4 opacity-75"
                    disabled
                  >
                    提交
                    <span className="ml-2 text-xs text-yellow-500">待开放</span>
                  </PixelButton>
                </div>
              </PixelCard>
              
              {/* 兑换记录 */}
              <PixelCard className="p-6">
                <h3 className="text-xl font-bold mb-6">兑换记录</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-400">兑换单号：123123123</p>
                        <p className="text-xs text-gray-500 mt-1">兑换时间：2025/12/12-22:22:22</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">已完成</p>
                        <p className="text-sm text-gold-500 mt-1">12345.00 TDB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800/50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-400">兑换单号：123123123</p>
                        <p className="text-xs text-gray-500 mt-1">兑换时间：2025/12/12-22:22:22</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-500">已取回</p>
                        <p className="text-sm text-gold-500 mt-1">12345.00 TDB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-yellow-500">更多记录待开放</p>
                  </div>
                </div>
              </PixelCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
