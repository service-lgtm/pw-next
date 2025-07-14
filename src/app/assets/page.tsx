'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useMyLands } from '@/hooks/useLands'
import { useRouter } from 'next/navigation'

interface AssetItem {
  id: string
  type: 'tdb' | 'yld' | 'land' | 'tool' | 'mineral' | 'house'
  name: string
  quantity?: number
  value: number
  icon: string
  isActive: boolean
  unit?: string
}

export default function AssetsPage() {
  const { user } = useAuth()
  const { lands } = useMyLands()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked'>('all')

  // 所有资产列表
  const allAssets: AssetItem[] = [
    { 
      id: '1', 
      type: 'tdb', 
      name: 'TDB积分', 
      value: user?.tdbBalance || 0, 
      icon: '💎',
      isActive: true,
      unit: 'TDB'
    },
    { 
      id: '2', 
      type: 'yld', 
      name: 'YLD积分', 
      value: user?.yldBalance || 0, 
      icon: '⚡',
      isActive: true,
      unit: 'YLD'
    },
    { 
      id: '3', 
      type: 'land', 
      name: '土地资产', 
      quantity: lands.length, 
      value: 0, // 可以计算总价值
      icon: '🏞️',
      isActive: true,
      unit: '块'
    },
    { 
      id: '4', 
      type: 'tool', 
      name: '工具背包', 
      quantity: 0, 
      value: 0, 
      icon: '🎒',
      isActive: false
    },
    { 
      id: '5', 
      type: 'house', 
      name: 'NFT仓库', 
      value: 0, 
      icon: '📦',
      isActive: false
    },
    { 
      id: '6', 
      type: 'mineral', 
      name: '矿产仓库', 
      quantity: 0, 
      value: 0, 
      icon: '⛏️',
      isActive: false
    },
  ]

  // 计算总价值（简化版，只算TDB）
  const totalValue = user?.tdbBalance || 0

  const tabs = [
    { key: 'all', label: '全部资产', icon: '📦' },
    { key: 'active', label: '已激活', icon: '✅' },
    { key: 'locked', label: '未开放', icon: '🔒' },
  ]

  const filteredAssets = activeTab === 'all' 
    ? allAssets 
    : activeTab === 'active'
    ? allAssets.filter(asset => asset.isActive)
    : allAssets.filter(asset => !asset.isActive)

  const handleAssetClick = (asset: AssetItem) => {
    if (!asset.isActive) return
    
    if (asset.type === 'land') {
      router.push('/assets/land')
    }
    // 可以添加其他资产类型的跳转
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black">
          <span className="text-gold-500">我的资产</span>
        </h1>
        <div className="text-lg">
          总价值: <span className="text-gold-500 font-black">{totalValue.toLocaleString()} TDB</span>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="flex items-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-4 py-2 font-bold transition-all",
              "border-b-4",
              activeTab === tab.key
                ? "border-gold-500 text-gold-500"
                : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 资产展示 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleAssetClick(asset)}
          >
            <PixelCard 
              className={cn(
                "p-6 text-center cursor-pointer transition-all",
                asset.isActive 
                  ? "hover:border-gold-500 hover:scale-105" 
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="text-5xl mb-3">{asset.icon}</div>
              <h3 className="font-bold text-sm mb-1">{asset.name}</h3>
              
              {asset.isActive ? (
                <>
                  {asset.quantity !== undefined ? (
                    <p className="text-xs text-gray-400 mb-1">
                      数量: {asset.quantity} {asset.unit}
                    </p>
                  ) : (
                    <p className="text-lg text-gold-500 font-bold">
                      {asset.value.toLocaleString()} {asset.unit}
                    </p>
                  )}
                  
                  {asset.type === 'land' && (
                    <button className="mt-3 text-xs px-3 py-1 bg-gold-500/20 text-gold-500 hover:bg-gold-500/30 transition-colors">
                      查看详情
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-2">即将开放</p>
              )}
            </PixelCard>
          </motion.div>
        ))}
      </div>

      {/* 底部说明 */}
      <PixelCard className="p-4 bg-gray-800/50">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-gray-400">
            <p className="mb-2">
              <span className="text-gold-500 font-bold">TDB积分</span>：稳定币，1 TDB ≈ 0.01克黄金
            </p>
            <p className="mb-2">
              <span className="text-purple-500 font-bold">YLD积分</span>：治理币
            </p>
            <p>
              <span className="text-green-500 font-bold">土地资产</span>：数字地产，可建设和交易
            </p>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}
