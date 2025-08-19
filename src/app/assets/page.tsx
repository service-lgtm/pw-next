// src/app/assets/page.tsx
// 资产总览页面 - v2.0.0 优化版
// 
// 功能说明：
// 1. 双通证展示（TDB和YLD）
// 2. 资产分类展示（土地、材料、工具、提货单）
// 3. 快捷操作入口
// 4. 响应式设计，完美适配移动端
// 
// 关联文件：
// - 使用 @/hooks/useAuth 进行认证
// - 使用 @/hooks/useLands 获取土地数据
// - 使用 @/hooks/useInventory 获取库存数据
// - 使用 @/components/shared 系列组件
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12-26 v2.0.0: 全面优化UI/UX
//   * 移除资产总价值显示
//   * 优化双通证卡片设计
//   * 改进资产分类展示
//   * 增强移动端体验
//   * 优化加载和空状态

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api, ApiError, TokenManager } from '@/lib/api'
import { useMyLands } from '@/hooks/useLands'
import { useInventory, formatValue, getResourceIcon } from '@/hooks/useInventory'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 资产类型定义
type AssetTab = 'overview' | 'land' | 'material' | 'tool' | 'voucher'

// 通证配置
const TOKEN_CONFIG = {
  tdb: {
    name: '黄金通证',
    symbol: 'TDB',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500',
    textColor: 'text-yellow-400',
    description: '稳定交易通证',
    features: ['游戏内通用货币', '可兑换现实资产']
  },
  yld: {
    name: '陨石通证',
    symbol: 'YLD',
    icon: '💎',
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-400',
    description: '治理通证',
    features: ['参与治理投票', '挖矿产出', '限量发行']
  }
} as const

// 材料配置
const MATERIAL_CONFIG = {
  iron: { name: '铁矿', icon: '⚙️', color: 'text-gray-400' },
  stone: { name: '石材', icon: '🪨', color: 'text-blue-400' },
  wood: { name: '木材', icon: '🪵', color: 'text-green-400' },
  food: { name: '粮食', icon: '🌾', color: 'text-yellow-400' },
  seed: { name: '种子', icon: '🌱', color: 'text-green-300' },
  brick: { name: '砖头', icon: '🧱', color: 'text-orange-400' }
} as const

// 工具配置
const TOOL_CONFIG = {
  pickaxe: { name: '镐头', icon: '⛏️', usage: '开采矿石' },
  axe: { name: '斧头', icon: '🪓', usage: '砍伐木材' },
  hoe: { name: '锄头', icon: '🌾', usage: '农业生产' }
} as const

/**
 * 通证卡片组件
 */
function TokenCard({ 
  type, 
  balance, 
  value,
  onAction 
}: { 
  type: 'tdb' | 'yld'
  balance: number
  value?: number
  onAction?: (action: string) => void
}) {
  const config = TOKEN_CONFIG[type]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <PixelCard className="p-4 sm:p-6">
        {/* 背景渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
        
        <div className="relative z-10">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.icon}</span>
                <h3 className="font-bold text-lg">{config.name}</h3>
              </div>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-800 rounded">
              {config.symbol}
            </span>
          </div>
          
          {/* 余额 */}
          <div className="mb-4">
            <p className={`text-3xl font-black ${config.textColor}`}>
              {balance.toLocaleString(undefined, { 
                minimumFractionDigits: type === 'yld' ? 4 : 2,
                maximumFractionDigits: type === 'yld' ? 4 : 2
              })}
            </p>
            {value !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {value.toLocaleString()} TDB
              </p>
            )}
          </div>
          
          {/* 特性列表 */}
          <div className="space-y-1 mb-4">
            {config.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-green-400">✓</span>
                {feature}
              </div>
            ))}
          </div>
          
          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-2">
            {type === 'tdb' ? (
              <>
                <button 
                  onClick={() => onAction?.('buy')}
                  className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm rounded transition-all"
                >
                  购买
                </button>
                <button 
                  onClick={() => onAction?.('exchange')}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded transition-all"
                >
                  兑换
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onAction?.('stake')}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded transition-all opacity-50 cursor-not-allowed"
                  disabled
                >
                  质押
                </button>
                <button 
                  onClick={() => onAction?.('governance')}
                  className="px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 text-sm rounded transition-all opacity-50 cursor-not-allowed"
                  disabled
                >
                  治理
                </button>
              </>
            )}
          </div>
        </div>
      </PixelCard>
    </motion.div>
  )
}

/**
 * 资产卡片组件
 */
function AssetCard({ 
  title, 
  icon, 
  items,
  onViewMore 
}: {
  title: string
  icon: string
  items: Array<{ label: string; value: string | number; subValue?: string }>
  onViewMore?: () => void
}) {
  return (
    <PixelCard className="p-4 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </h4>
        {onViewMore && (
          <button
            onClick={onViewMore}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            查看全部 →
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{item.label}</span>
            <div className="text-right">
              <span className="text-sm font-bold">{item.value}</span>
              {item.subValue && (
                <span className="text-xs text-gray-500 ml-1">{item.subValue}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

/**
 * 资产页面主组件
 */
export default function AssetsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { lands, loading: landsLoading } = useMyLands()
  const { inventory, loading: inventoryLoading } = useInventory({ category: 'all' })
  
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<AssetTab>('overview')
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/assets')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 获取用户资料
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
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, router])
  
  // 计算统计数据
  const stats = useMemo(() => {
    const tdbBalance = profileData?.tdb_balance ? parseFloat(profileData.tdb_balance) : 0
    const yldBalance = profileData?.yld_balance ? parseFloat(profileData.yld_balance) : 0
    const yldValue = yldBalance * 2.84 // 1 YLD = 2.84 TDB
    
    // 计算材料总价值
    const materialValue = Object.values(inventory?.materials || {}).reduce((sum: number, item: any) => {
      return sum + (item.value || 0)
    }, 0)
    
    // 计算工具总数
    const toolCount = Object.values(inventory?.tools || {}).reduce((sum: number, item: any) => {
      return sum + (item.count || 0)
    }, 0)
    
    return {
      tdbBalance,
      yldBalance,
      yldValue,
      landCount: lands.length,
      materialValue,
      toolCount
    }
  }, [profileData, lands, inventory])
  
  // 处理操作
  const handleTokenAction = (token: 'tdb' | 'yld', action: string) => {
    switch (action) {
      case 'buy':
        window.open('https://www.pxsj.net.cn/shop/tdb', '_blank')
        break
      case 'exchange':
        setShowExchangeModal(true)
        break
      case 'stake':
      case 'governance':
        toast('功能开发中', { icon: '🚧' })
        break
    }
  }
  
  // 加载状态
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4 inline-block"
          >
            ⏳
          </motion.div>
          <p className="text-gray-400">加载资产数据...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
              我的资产
            </h1>
            <p className="text-sm text-gray-500">
              管理您在平行世界的数字资产
            </p>
          </div>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={() => router.push('/shop')}
          >
            商城
          </PixelButton>
        </div>
      </motion.div>
      
      {/* 双通证展示 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <TokenCard
          type="tdb"
          balance={stats.tdbBalance}
          onAction={(action) => handleTokenAction('tdb', action)}
        />
        <TokenCard
          type="yld"
          balance={stats.yldBalance}
          value={stats.yldValue}
          onAction={(action) => handleTokenAction('yld', action)}
        />
      </div>
      
      {/* 快捷统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 rounded-lg p-3 border border-blue-900/30">
          <p className="text-xs text-blue-400 mb-1">土地资产</p>
          <p className="text-xl font-bold">{stats.landCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-lg p-3 border border-green-900/30">
          <p className="text-xs text-green-400 mb-1">工具数量</p>
          <p className="text-xl font-bold">{stats.toolCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 rounded-lg p-3 border border-purple-900/30">
          <p className="text-xs text-purple-400 mb-1">材料价值</p>
          <p className="text-xl font-bold">{Math.floor(stats.materialValue)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/20 to-orange-900/10 rounded-lg p-3 border border-orange-900/30">
          <p className="text-xs text-orange-400 mb-1">活跃度</p>
          <p className="text-xl font-bold">100%</p>
        </div>
      </motion.div>
      
      {/* 资产分类标签 */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: '总览', icon: '📊' },
            { key: 'land', label: '土地', icon: '🏞️' },
            { key: 'material', label: '材料', icon: '📦' },
            { key: 'tool', label: '工具', icon: '🔧' },
            { key: 'voucher', label: '提货单', icon: '🎫' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AssetTab)}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-1",
                activeTab === tab.key
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {/* 总览 */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* 土地资产 */}
            {lands.length > 0 && (
              <AssetCard
                title="土地资产"
                icon="🏞️"
                items={[
                  { label: '总数量', value: lands.length, subValue: '块' },
                  { label: '总面积', value: lands.reduce((sum, l) => sum + l.size_sqm, 0), subValue: 'm²' },
                  { label: '最新土地', value: lands[0]?.land_type_display || '-' }
                ]}
                onViewMore={() => setActiveTab('land')}
              />
            )}
            
            {/* 材料资产 */}
            <AssetCard
              title="材料资产"
              icon="📦"
              items={[
                { label: '铁矿', value: inventory?.materials?.iron?.amount || 0 },
                { label: '木材', value: inventory?.materials?.wood?.amount || 0 },
                { label: '石材', value: inventory?.materials?.stone?.amount || 0 }
              ]}
              onViewMore={() => setActiveTab('material')}
            />
            
            {/* 工具资产 */}
            <AssetCard
              title="工具资产"
              icon="🔧"
              items={[
                { label: '镐头', value: inventory?.tools?.pickaxe?.count || 0 },
                { label: '斧头', value: inventory?.tools?.axe?.count || 0 },
                { label: '锄头', value: inventory?.tools?.hoe?.count || 0 }
              ]}
              onViewMore={() => setActiveTab('tool')}
            />
          </motion.div>
        )}
        
        {/* 土地详情 */}
        {activeTab === 'land' && (
          <motion.div
            key="land"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {lands.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lands.map((land) => (
                  <PixelCard
                    key={land.id}
                    className="p-4 hover:border-purple-500 transition-all cursor-pointer"
                    onClick={() => router.push(`/assets/land/${land.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold">{land.land_type_display}</h4>
                        <p className="text-xs text-gray-500">#{land.land_id.slice(-8)}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                        {land.region_name}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">面积</span>
                        <span>{land.size_sqm} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">坐标</span>
                        <span>({land.coordinate_x}, {land.coordinate_y})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">价值</span>
                        <span className="text-yellow-400">
                          {parseFloat(land.current_price).toFixed(2)} TDB
                        </span>
                      </div>
                    </div>
                  </PixelCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">暂无土地资产</p>
                <PixelButton onClick={() => router.push('/shop/land')}>
                  前往购买
                </PixelButton>
              </div>
            )}
          </motion.div>
        )}
        
        {/* 材料详情 */}
        {activeTab === 'material' && (
          <motion.div
            key="material"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(MATERIAL_CONFIG).map(([key, config]) => {
              const material = inventory?.materials?.[key]
              const amount = material?.amount || 0
              const value = material?.value || 0
              
              return (
                <PixelCard key={key} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h4 className="font-bold">{config.name}</h4>
                      <p className={`text-xs ${config.color}`}>基础材料</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">数量</span>
                      <span className="font-bold">{Math.floor(amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">价值</span>
                      <span className="text-yellow-400">{value.toFixed(2)} TDB</span>
                    </div>
                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>单价</span>
                        <span>{amount > 0 ? (value / amount).toFixed(4) : '0'} TDB</span>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )
            })}
          </motion.div>
        )}
        
        {/* 工具详情 */}
        {activeTab === 'tool' && (
          <motion.div
            key="tool"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {Object.entries(TOOL_CONFIG).map(([key, config]) => {
              const tool = inventory?.tools?.[key]
              const count = tool?.count || 0
              const working = tool?.working || 0
              const value = tool?.value || 0
              
              return (
                <PixelCard key={key} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h4 className="font-bold">{config.name}</h4>
                      <p className="text-xs text-gray-500">{config.usage}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">总数量</span>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">使用中</span>
                      <span className="text-green-400">{working}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">闲置</span>
                      <span className="text-yellow-400">{count - working}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">总价值</span>
                        <span className="text-yellow-400 font-bold">{value.toFixed(2)} TDB</span>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )
            })}
            
            {/* 砖头特殊处理 */}
            {inventory?.special?.brick && (
              <PixelCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🧱</span>
                  <div>
                    <h4 className="font-bold">砖头</h4>
                    <p className="text-xs text-gray-500">建筑材料</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">数量</span>
                    <span className="font-bold">{inventory.special.brick.amount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">价值</span>
                    <span className="text-yellow-400">
                      {(inventory.special.brick.value || 0).toFixed(2)} TDB
                    </span>
                  </div>
                </div>
              </PixelCard>
            )}
          </motion.div>
        )}
        
        {/* 提货单 */}
        {activeTab === 'voucher' && (
          <motion.div
            key="voucher"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-xl font-bold mb-2">提货单功能即将上线</p>
            <p className="text-gray-400">
              商品提货单将支持实物商品的链上交易和分红
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 兑换弹窗 */}
      <AnimatePresence>
        {showExchangeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExchangeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold mb-2">兑换功能开发中</h3>
                <p className="text-gray-400 mb-6">
                  TDB兑换功能正在开发中，敬请期待
                </p>
                <PixelButton onClick={() => setShowExchangeModal(false)}>
                  知道了
                </PixelButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
