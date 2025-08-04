// src/app/market/page.tsx
// NFT 交易市场页面 - C2C 交易平台

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// NFT 资产类型
type AssetType = 'all' | 'land' | 'tool' | 'building' | 'mine'
type ViewMode = 'grid' | 'list'
type SortOption = 'latest' | 'price_asc' | 'price_desc'

interface NFTAsset {
  id: string
  name: string
  type: 'land' | 'tool' | 'building' | 'mine'
  icon: string
  price: number
  owner: string
  ownerId: string
  status: 'selling' | 'sold'
  attributes: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  type: 'mint' | 'list' | 'sale' | 'cancel'
  price?: number
  from: string
  to: string
  date: string
}

export default function MarketPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // 状态管理
  const [selectedType, setSelectedType] = useState<AssetType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<NFTAsset | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<NFTAsset[]>([])
  const [userTdbBalance, setUserTdbBalance] = useState(10000) // 模拟用户余额

  // 模拟交易历史
  const mockTransactions: Transaction[] = [
    { id: '1', type: 'mint', from: '系统', to: '张*明', date: '2025-01-20 10:00' },
    { id: '2', type: 'list', price: 5000, from: '张*明', to: '市场', date: '2025-01-21 14:30' },
    { id: '3', type: 'sale', price: 5000, from: '张*明', to: '李*华', date: '2025-01-22 09:15' },
  ]

  // 资产类型配置
  const assetTypes = [
    { value: 'all', label: '全部', count: 156 },
    { value: 'land', label: '土地', count: 45, icon: '🏞️' },
    { value: 'mine', label: '矿山', count: 38, icon: '⛏️' },
    { value: 'tool', label: '工具', count: 52, icon: '🔨' },
    { value: 'building', label: '房产', count: 21, icon: '🏠' },
  ]

  // 价格区间选项
  const priceRanges = [
    { label: '全部价格', value: [0, 999999] },
    { label: '0 - 10K', value: [0, 10000] },
    { label: '10K - 50K', value: [10000, 50000] },
    { label: '50K+', value: [50000, 999999] },
  ]

  // 模拟获取资产数据
  useEffect(() => {
    fetchAssets()
  }, [selectedType, sortBy, priceRange, searchQuery])

  const fetchAssets = () => {
    setLoading(true)
    // 模拟 API 调用
    setTimeout(() => {
      const mockAssets: NFTAsset[] = [
        {
          id: '1',
          name: '陨石矿山 #YLD-007',
          type: 'mine',
          icon: '💎',
          price: 88888,
          owner: '王*明',
          ownerId: '12345',
          status: 'selling',
          attributes: {
            '类型': '陨石矿',
            '储量': '10,000 YLD',
            '日产量': '10 YLD',
            'ROI': '15%/月',
            '坐标': '(120.123, 31.456)',
          },
          createdAt: '2025-01-20',
          updatedAt: '2025-01-22',
        },
        {
          id: '2',
          name: '铁矿山 #12345',
          type: 'mine',
          icon: '⛏️',
          price: 15000,
          owner: '李*华',
          ownerId: '23456',
          status: 'selling',
          attributes: {
            '类型': '铁矿',
            '储量': '50,000',
            '日产量': '100',
            '坐标': '(121.789, 31.012)',
          },
          createdAt: '2025-01-19',
          updatedAt: '2025-01-21',
        },
        {
          id: '3',
          name: '商业地块 #CBD-001',
          type: 'land',
          icon: '🏞️',
          price: 35000,
          owner: '张*三',
          ownerId: '34567',
          status: 'selling',
          attributes: {
            '面积': '300 m²',
            '区域': '陆家嘴CBD',
            '建设状态': '可建设',
            '溢价': '300%',
          },
          createdAt: '2025-01-18',
          updatedAt: '2025-01-20',
        },
        {
          id: '4',
          name: '锄头 #HOE-888',
          type: 'tool',
          icon: '🔨',
          price: 2500,
          owner: '赵*六',
          ownerId: '45678',
          status: 'selling',
          attributes: {
            '类型': '锄头',
            '耐久度': '1450/1500',
            '用途': '开采陨石矿',
            '品质': '精良',
          },
          createdAt: '2025-01-17',
          updatedAt: '2025-01-19',
        },
      ]

      // 应用筛选
      let filtered = [...mockAssets]
      
      // 类型筛选
      if (selectedType !== 'all') {
        filtered = filtered.filter(asset => asset.type === selectedType)
      }
      
      // 价格筛选
      filtered = filtered.filter(asset => 
        asset.price >= priceRange[0] && asset.price <= priceRange[1]
      )
      
      // 搜索筛选
      if (searchQuery) {
        filtered = filtered.filter(asset => 
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // 排序
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price
          case 'price_desc':
            return b.price - a.price
          case 'latest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })

      setAssets(filtered)
      setLoading(false)
    }, 500)
  }

  // 处理购买
  const handlePurchase = () => {
    if (!selectedAsset) return
    
    if (userTdbBalance < selectedAsset.price) {
      toast.error('TDB余额不足')
      return
    }
    
    // 模拟购买过程
    setLoading(true)
    setTimeout(() => {
      setUserTdbBalance(prev => prev - selectedAsset.price)
      toast.success('购买成功！')
      setShowPurchaseModal(false)
      setSelectedAsset(null)
      fetchAssets() // 刷新列表
      setLoading(false)
    }, 1000)
  }

  // 获取交易类型的中文名
  const getTransactionTypeName = (type: Transaction['type']) => {
    const typeMap = {
      mint: '铸造',
      list: '上架',
      sale: '出售',
      cancel: '取消'
    }
    return typeMap[type]
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          NFT 交易市场
        </h1>
        <p className="text-gray-400 mt-1">发现并交易游戏内的稀有资产</p>
      </motion.div>

      {/* 资产分类 Tabs */}
      <div className="flex flex-wrap gap-2">
        {assetTypes.map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(type.value as AssetType)}
            className={cn(
              "px-4 py-2 rounded-md font-bold transition-all",
              selectedType === type.value
                ? "bg-gold-500 text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            {type.icon && <span className="mr-2">{type.icon}</span>}
            {type.label}
            <span className="ml-2 text-sm opacity-70">({type.count})</span>
          </motion.button>
        ))}
      </div>

      {/* 筛选和排序栏 */}
      <PixelCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索资产名称或编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          
          {/* 筛选按钮 */}
          <PixelButton
            onClick={() => setShowFilterModal(true)}
            variant="secondary"
          >
            <span className="mr-2">🔍</span>
            高级筛选
          </PixelButton>
          
          {/* 排序下拉 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="latest">最新上架</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
          </select>
          
          {/* 视图切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded",
                viewMode === 'grid' ? 'bg-gold-500 text-black' : 'bg-gray-800 text-gray-300'
              )}
            >
              <span className="text-xl">⊞</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded",
                viewMode === 'list' ? 'bg-gold-500 text-black' : 'bg-gray-800 text-gray-300'
              )}
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </PixelCard>

      {/* 资产展示区 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <PixelCard className="p-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400">没有找到符合条件的资产</p>
        </PixelCard>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
        )}>
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedAsset(asset)}
              className="cursor-pointer"
            >
              {viewMode === 'grid' ? (
                // 网格视图卡片
                <PixelCard className="h-full hover:border-gold-500 transition-colors">
                  <div className="p-4 space-y-3">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{asset.icon}</div>
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                      <p className="text-sm text-gray-400">{asset.type}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">价格</span>
                        <span className="text-xl font-bold text-gold-500">
                          {asset.price.toLocaleString()} TDB
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-400">状态</span>
                        <span className={cn(
                          "text-sm font-bold",
                          asset.status === 'selling' ? 'text-green-500' : 'text-gray-500'
                        )}>
                          {asset.status === 'selling' ? '出售中' : '已售出'}
                        </span>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              ) : (
                // 列表视图
                <PixelCard className="hover:border-gold-500 transition-colors">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{asset.icon}</span>
                      <div>
                        <h3 className="font-bold">{asset.name}</h3>
                        <p className="text-sm text-gray-400">
                          {asset.type} · 所有者: {asset.owner}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gold-500">
                        {asset.price.toLocaleString()} TDB
                      </p>
                      <p className={cn(
                        "text-sm",
                        asset.status === 'selling' ? 'text-green-500' : 'text-gray-500'
                      )}>
                        {asset.status === 'selling' ? '出售中' : '已售出'}
                      </p>
                    </div>
                  </div>
                </PixelCard>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 高级筛选弹窗 */}
      <PixelModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="高级筛选"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              价格区间
            </label>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange[0] === range.value[0] && priceRange[1] === range.value[1]}
                    onChange={() => setPriceRange(range.value as [number, number])}
                    className="text-gold-500"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              自定义价格区间
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="最低价"
                className="flex-1 px-3 py-2 bg-gray-800 rounded"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="最高价"
                className="flex-1 px-3 py-2 bg-gray-800 rounded"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <PixelButton
              className="flex-1"
              onClick={() => {
                setShowFilterModal(false)
                fetchAssets()
              }}
            >
              应用筛选
            </PixelButton>
            <PixelButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPriceRange([0, 999999])
                setShowFilterModal(false)
              }}
            >
              重置
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      {/* 资产详情弹窗 */}
      <AnimatePresence>
        {selectedAsset && (
          <PixelModal
            isOpen={!!selectedAsset}
            onClose={() => setSelectedAsset(null)}
            title="资产详情"
            size="large"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左侧 - 视觉展示 */}
              <div className="text-center">
                <div className="text-[120px] mb-4">{selectedAsset.icon}</div>
                <h2 className="text-2xl font-black mb-2">{selectedAsset.name}</h2>
                <p className="text-gray-400">类型: {selectedAsset.type}</p>
              </div>
              
              {/* 右侧 - 核心信息 */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">所有者</p>
                  <p className="font-bold">{selectedAsset.owner}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">当前价格</p>
                  <p className="text-3xl font-black text-gold-500">
                    {selectedAsset.price.toLocaleString()} TDB
                  </p>
                </div>
                
                {selectedAsset.ownerId === user?.id ? (
                  <PixelButton className="w-full" variant="secondary">
                    下架商品
                  </PixelButton>
                ) : (
                  <PixelButton
                    className="w-full"
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={selectedAsset.status === 'sold'}
                  >
                    {selectedAsset.status === 'selling' ? '立即购买' : '已售出'}
                  </PixelButton>
                )}
              </div>
            </div>
            
            {/* 下方 - 属性与历史 */}
            <div className="mt-6 space-y-6">
              {/* 属性 */}
              <div>
                <h3 className="text-lg font-bold mb-3">属性</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedAsset.attributes).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-800 rounded">
                      <p className="text-xs text-gray-400">{key}</p>
                      <p className="font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 交易历史 */}
              <div>
                <h3 className="text-lg font-bold mb-3">交易历史</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-gray-800 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold">{getTransactionTypeName(tx.type)}</p>
                        <p className="text-sm text-gray-400">
                          {tx.from} → {tx.to}
                        </p>
                      </div>
                      <div className="text-right">
                        {tx.price && (
                          <p className="font-bold text-gold-500">{tx.price.toLocaleString()} TDB</p>
                        )}
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PixelModal>
        )}
      </AnimatePresence>

      {/* 购买确认弹窗 */}
      <PixelModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="确认购买"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{selectedAsset.icon}</div>
              <h3 className="font-bold">{selectedAsset.name}</h3>
            </div>
            
            <div className="space-y-2 p-4 bg-gray-800 rounded">
              <div className="flex justify-between">
                <span className="text-gray-400">购买价格</span>
                <span className="font-bold text-gold-500">
                  {selectedAsset.price.toLocaleString()} TDB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">当前余额</span>
                <span className="font-bold">{userTdbBalance.toLocaleString()} TDB</span>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between">
                <span className="text-gray-400">购买后余额</span>
                <span className={cn(
                  "font-bold",
                  userTdbBalance >= selectedAsset.price ? "text-green-500" : "text-red-500"
                )}>
                  {(userTdbBalance - selectedAsset.price).toLocaleString()} TDB
                </span>
              </div>
            </div>
            
            {userTdbBalance < selectedAsset.price && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-red-500 text-sm">TDB余额不足，请先充值</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <PixelButton
                className="flex-1"
                onClick={handlePurchase}
                disabled={userTdbBalance < selectedAsset.price || loading}
              >
                {loading ? '处理中...' : '确认支付'}
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowPurchaseModal(false)}
              >
                取消
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>
    </div>
  )
}
