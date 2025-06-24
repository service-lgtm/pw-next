'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  type: 'land' | 'tool' | 'mineral' | 'house'
  name: string
  quantity?: number
  value: number
  icon: string
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'land' | 'tool' | 'mineral' | 'house'>('all')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  const assets: Asset[] = [
    { id: '1', type: 'land', name: '铁矿山', value: 50000, icon: '⛏️' },
    { id: '2', type: 'land', name: '农田', value: 20000, icon: '🌾' },
    { id: '3', type: 'tool', name: '镐头', quantity: 3, value: 500, icon: '⛏️' },
    { id: '4', type: 'house', name: '商铺', value: 100000, icon: '🏪' },
    { id: '5', type: 'mineral', name: '铁矿', quantity: 500, value: 10, icon: '⚒️' },
  ]

  const totalValue = assets.reduce((sum, asset) => 
    sum + (asset.quantity ? asset.quantity * asset.value : asset.value), 0
  )

  const tabs = [
    { key: 'all', label: '全部', icon: '📦' },
    { key: 'land', label: '土地', icon: '🏞️' },
    { key: 'tool', label: '工具', icon: '🔨' },
    { key: 'mineral', label: '矿产', icon: '💎' },
    { key: 'house', label: '房产', icon: '🏠' },
  ]

  const filteredAssets = activeTab === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === activeTab)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black">
          <span className="text-gold-500">NFT仓库</span>
        </h1>
        <div className="text-lg">
          总价值: <span className="text-gold-500 font-black">¥{totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
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

        {/* 视图切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'card' ? 'text-gold-500' : 'text-gray-400'
            )}
          >
            <span className="text-xl">⊞</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'list' ? 'text-gold-500' : 'text-gray-400'
            )}
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>

      {/* 资产展示 */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <PixelCard className="p-4 text-center hover:border-gold-500 cursor-pointer">
                <div className="text-5xl mb-3">{asset.icon}</div>
                <h3 className="font-bold text-sm mb-1">{asset.name}</h3>
                {asset.quantity && (
                  <p className="text-xs text-gray-400 mb-1">
                    数量: {asset.quantity}
                  </p>
                )}
                <p className="text-sm text-gold-500 font-bold">
                  ¥{asset.value.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 text-xs py-1 bg-gold-500/20 text-gold-500 hover:bg-gold-500/30 transition-colors">
                    使用
                  </button>
                  <button className="flex-1 text-xs py-1 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors">
                    出售
                  </button>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <PixelCard noPadding>
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-4">资产</th>
                <th className="text-center p-4">类型</th>
                <th className="text-center p-4">数量</th>
                <th className="text-right p-4">价值</th>
                <th className="text-center p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, index) => (
                <motion.tr
                  key={asset.id}
                  className="border-t border-gray-700 hover:bg-gray-800/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{asset.icon}</span>
                      <span className="font-bold">{asset.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm text-gray-400">{asset.type}</span>
                  </td>
                  <td className="p-4 text-center">
                    {asset.quantity || '-'}
                  </td>
                  <td className="p-4 text-right text-gold-500 font-bold">
                    ¥{asset.value.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="text-xs px-2 py-1 bg-gold-500/20 text-gold-500 hover:bg-gold-500/30 transition-colors">
                        使用
                      </button>
                      <button className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors">
                        出售
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </PixelCard>
      )}
    </div>
  )
}
