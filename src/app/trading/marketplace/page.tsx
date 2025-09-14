// src/app/trading/marketplace/page.tsx
// 交易市场浏览页面 - 查看和购买在售商品
// 版本：2.0.0 - 支持商品直链、移动端优化、修复图标兼容

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：优化用户体验，支持商品直链访问
 * 主要修改：
 * 1. 支持 ?item=id 参数直接打开商品详情
 * 2. 修复购买按钮图标兼容问题
 * 3. 优化移动端布局和交互
 * 4. 增强筛选功能，支持价格区间
 * 5. 添加商品详情弹窗
 * 6. 优化加载和错误状态
 * 7. 移除搜索功能，默认展开筛选
 * 
 * 路由支持：
 * - /trading/marketplace - 商品列表
 * - /trading/marketplace?item=7 - 直接打开商品ID为7的详情
 * 
 * 依赖关系：
 * - /lib/api/trading.ts - 交易 API 接口
 * - /hooks/useTrading.ts - 交易相关 Hook
 * - /components/shared/* - 共享 UI 组件
 * 
 * ⚠️ 重要说明：
 * - 使用 useSearchParams 处理 URL 参数
 * - 移动端使用底部弹窗，桌面端使用中心弹窗
 * - 保持与现有设计风格一致
 * ============================================
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useAuth } from '@/hooks/useAuth'
import { useTradingMarket } from '@/hooks/useTrading'
import { useWallet } from '@/hooks/useWallet'
import { RESOURCE_INFO, TOOL_INFO } from '@/lib/api/resources'
import { 
  Filter, 
  ShoppingCart,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  Sparkles,
  ArrowLeft,
  Info,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// 商品类型选项
const ITEM_TYPES = [
  { value: 'all', label: '全部商品', icon: '📊' },
  { value: 'material', label: '材料', icon: '📦' },
  { value: 'tool', label: '工具', icon: '🔧' },
]

// 材料类型选项
const MATERIAL_TYPES = [
  { value: 'all', label: '全部材料' },
  { value: 'iron', label: '铁矿', icon: '⛏️' },
  { value: 'stone', label: '石材', icon: '🪨' },
  { value: 'wood', label: '木材', icon: '🪵' },
  { value: 'yld', label: 'YLD陨石', icon: '💎' },
  { value: 'food', label: '粮食', icon: '🌾' },
]

// 工具类型选项
const TOOL_TYPES = [
  { value: 'all', label: '全部工具' },
  { value: 'pickaxe', label: '镐头', icon: '⛏️' },
  { value: 'axe', label: '斧头', icon: '🪓' },
  { value: 'hoe', label: '锄头', icon: '🌾' },
]

// 排序选项
const SORT_OPTIONS = [
  { value: 'price_asc', label: '价格从低到高', icon: '💰' },
  { value: 'price_desc', label: '价格从高到低', icon: '💎' },
  { value: 'time_desc', label: '最新发布', icon: '🆕' },
  { value: 'quantity_desc', label: '库存最多', icon: '📦' },
]

// 价格区间选项
const PRICE_RANGES = [
  { value: 'all', label: '全部价格' },
  { value: '0-50', label: '50 TDB以下' },
  { value: '50-100', label: '50-100 TDB' },
  { value: '100-500', label: '100-500 TDB' },
  { value: '500+', label: '500 TDB以上' },
]

// 内部组件包装，处理 searchParams
function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { balance } = useWallet()
  const [isMobile, setIsMobile] = useState(false)
  
  // URL参数：商品ID
  const itemIdFromUrl = searchParams.get('item')
  
  // 筛选状态
  const [itemType, setItemType] = useState('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('time_desc')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(true) // 默认展开筛选
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // 购买弹窗状态
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [buyQuantity, setBuyQuantity] = useState(1)
  
  // 获取市场数据
  const { 
    items, 
    loading, 
    hasMore,
    currentPage,
    totalPages,
    fetchItems,
    buyItem,
    buying
  } = useTradingMarket({
    type: itemType === 'all' ? undefined : itemType,
    category: category === 'all' ? undefined : category,
    sort: sortBy
  })
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/trading/marketplace')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 处理URL中的商品ID参数
  useEffect(() => {
    if (itemIdFromUrl && items.length > 0) {
      const item = items.find(i => i.order_id.toString() === itemIdFromUrl)
      if (item) {
        handleOpenDetailModal(item)
      }
    }
  }, [itemIdFromUrl, items])
  
  // 处理筛选变化
  useEffect(() => {
    fetchItems(1)
  }, [itemType, category, sortBy, priceRange])
  
  // 打开商品详情
  const handleOpenDetailModal = (item: any) => {
    setSelectedItem(item)
    setBuyQuantity(1)
    setShowDetailModal(true)
    // 更新URL
    const url = new URL(window.location.href)
    url.searchParams.set('item', item.order_id.toString())
    window.history.pushState({}, '', url)
  }
  
  // 关闭商品详情
  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
    // 清除URL参数
    const url = new URL(window.location.href)
    url.searchParams.delete('item')
    window.history.pushState({}, '', url)
  }
  
  // 打开购买弹窗
  const handleOpenBuyModal = (item: any) => {
    setSelectedItem(item)
    setBuyQuantity(1)
    setShowBuyModal(true)
    setShowDetailModal(false)
  }
  
  // 处理购买
  const handleBuy = async () => {
    if (!selectedItem) return
    
    const result = await buyItem(selectedItem.order_id, buyQuantity)
    if (result.success) {
      toast.success('购买成功！')
      setShowBuyModal(false)
      handleCloseDetailModal()
      fetchItems(currentPage)
    }
  }
  
  // 获取商品信息
  const getItemInfo = (item: any) => {
    if (item.item_type in RESOURCE_INFO) {
      return RESOURCE_INFO[item.item_type as keyof typeof RESOURCE_INFO]
    }
    if (item.item_type in TOOL_INFO) {
      return TOOL_INFO[item.item_type as keyof typeof TOOL_INFO]
    }
    return { icon: '📦', name: item.item_name, description: '' }
  }
  
  // 计算剩余时间
  const getTimeRemaining = (expireAt: string) => {
    const now = new Date()
    const expire = new Date(expireAt)
    const diff = expire.getTime() - now.getTime()
    
    if (diff <= 0) return '已过期'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}天${hours % 24}小时`
    }
    
    return `${hours}小时${minutes}分钟`
  }
  
  // 过滤价格区间
  const filterByPrice = (items: any[]) => {
    if (priceRange === 'all') return items
    
    return items.filter(item => {
      const price = item.unit_price
      switch (priceRange) {
        case '0-50': return price <= 50
        case '50-100': return price > 50 && price <= 100
        case '100-500': return price > 100 && price <= 500
        case '500+': return price > 500
        default: return true
      }
    })
  }
  
  const filteredItems = filterByPrice(items)
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }
  
  // 移动端布局
  if (isMobile) {
    return (
      <div className="min-h-screen pb-20">
        {/* 移动端头部 */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <button onClick={() => router.back()} className="p-2">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-lg font-bold">浏览市场</h1>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="p-2 relative"
              >
                <Filter className="w-5 h-5 text-gray-400" />
                {(itemType !== 'all' || category !== 'all' || priceRange !== 'all') && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
          
          {/* 快速筛选标签 */}
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
            {SORT_OPTIONS.map(sort => (
              <button
                key={sort.value}
                onClick={() => setSortBy(sort.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all",
                  sortBy === sort.value
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
                )}
              >
                <span className="mr-1">{sort.icon}</span>
                {sort.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 移动端商品列表 */}
        <div className="p-3">
          {loading && currentPage === 1 ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <MobileItemCard
                    key={item.order_id}
                    item={item}
                    index={index}
                    onDetail={() => handleOpenDetailModal(item)}
                    getItemInfo={getItemInfo}
                    getTimeRemaining={getTimeRemaining}
                  />
                ))}
              </div>
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-3">
                  <PixelButton
                    onClick={() => fetchItems(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                    size="sm"
                  >
                    上一页
                  </PixelButton>
                  
                  <span className="text-xs text-gray-400">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <PixelButton
                    onClick={() => fetchItems(currentPage + 1)}
                    disabled={!hasMore}
                    variant="secondary"
                    size="sm"
                  >
                    下一页
                  </PixelButton>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-400 mb-2">暂无在售商品</p>
              <p className="text-gray-500 text-sm">试试调整筛选条件</p>
            </div>
          )}
        </div>
        
        {/* 移动端筛选弹窗 */}
        <AnimatePresence>
          {showMobileFilters && (
            <MobileFilterSheet
              itemType={itemType}
              setItemType={setItemType}
              category={category}
              setCategory={setCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClose={() => setShowMobileFilters(false)}
            />
          )}
        </AnimatePresence>
        
        {/* 商品详情弹窗 */}
        <ItemDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          item={selectedItem}
          onBuy={() => handleOpenBuyModal(selectedItem)}
          getItemInfo={getItemInfo}
          getTimeRemaining={getTimeRemaining}
          isMobile={isMobile}
        />
        
        {/* 购买确认弹窗 */}
        <BuyConfirmModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          item={selectedItem}
          quantity={buyQuantity}
          setQuantity={setBuyQuantity}
          balance={balance?.tdb_balance || 0}
          onConfirm={handleBuy}
          buying={buying}
          getItemInfo={getItemInfo}
          isMobile={isMobile}
        />
      </div>
    )
  }
  
  // 桌面端布局
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-gold-500" />
              浏览市场
            </h1>
            <p className="text-gray-400 mt-1">
              发现并购买其他玩家出售的商品
            </p>
          </div>
          
          {/* 余额显示 */}
          {balance && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg">
              <Coins className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-gray-400">余额：</span>
              <span className="font-bold text-gold-500">
                {balance.tdb_balance.toFixed(2)} TDB
              </span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        {/* 筛选按钮 */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all flex items-center gap-2",
              showFilters 
                ? "bg-gold-500/20 border-gold-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400"
            )}
          >
            <Filter className="w-5 h-5" />
            筛选
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {/* 筛选选项 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {/* 商品类型选择 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">类型：</span>
                {ITEM_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setItemType(type.value)
                      setCategory('all')
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm flex items-center gap-1",
                      itemType === type.value
                        ? "bg-gold-500/20 border-gold-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
              
              {/* 具体分类选择 */}
              {itemType !== 'all' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">分类：</span>
                  {(itemType === 'material' ? MATERIAL_TYPES : TOOL_TYPES).map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg border transition-all text-sm flex items-center gap-1",
                        category === cat.value
                          ? "bg-gold-500/20 border-gold-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                      )}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 价格区间 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">价格：</span>
                {PRICE_RANGES.map(range => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      priceRange === range.value
                        ? "bg-gold-500/20 border-gold-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              {/* 排序选择 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">排序：</span>
                {SORT_OPTIONS.map(sort => (
                  <button
                    key={sort.value}
                    onClick={() => setSortBy(sort.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      sortBy === sort.value
                        ? "bg-gold-500/20 border-gold-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* 商品列表 */}
      {loading && currentPage === 1 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PixelCard key={i} className="p-6 animate-pulse">
              <div className="h-8 bg-gray-800 rounded mb-4" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
            </PixelCard>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredItems.map((item, index) => (
              <ItemCard
                key={item.order_id}
                item={item}
                index={index}
                onDetail={() => handleOpenDetailModal(item)}
                onBuy={() => handleOpenBuyModal(item)}
                getItemInfo={getItemInfo}
                getTimeRemaining={getTimeRemaining}
              />
            ))}
          </motion.div>
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-3">
              <PixelButton
                onClick={() => fetchItems(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                上一页
              </PixelButton>
              
              <span className="text-sm text-gray-400">
                第 {currentPage} / {totalPages} 页
              </span>
              
              <PixelButton
                onClick={() => fetchItems(currentPage + 1)}
                disabled={!hasMore}
                variant="secondary"
                size="sm"
              >
                下一页
              </PixelButton>
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg mb-2">暂无在售商品</p>
          <p className="text-gray-500 text-sm">试试调整筛选条件或稍后再来</p>
        </motion.div>
      )}
      
      {/* 商品详情弹窗 */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        item={selectedItem}
        onBuy={() => handleOpenBuyModal(selectedItem)}
        getItemInfo={getItemInfo}
        getTimeRemaining={getTimeRemaining}
        isMobile={false}
      />
      
      {/* 购买确认弹窗 */}
      <BuyConfirmModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        item={selectedItem}
        quantity={buyQuantity}
        setQuantity={setBuyQuantity}
        balance={balance?.tdb_balance || 0}
        onConfirm={handleBuy}
        buying={buying}
        getItemInfo={getItemInfo}
        isMobile={false}
      />
    </div>
  )
}

// 主页面组件，包装 Suspense
export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  )
}

// ==================== 子组件 ====================

// 桌面端商品卡片
interface ItemCardProps {
  item: any
  index: number
  onDetail: () => void
  onBuy: () => void
  getItemInfo: (item: any) => any
  getTimeRemaining: (expireAt: string) => string
}

function ItemCard({ item, index, onDetail, onBuy, getItemInfo, getTimeRemaining }: ItemCardProps) {
  const info = getItemInfo(item)
  const isExpiringSoon = new Date(item.expire_at).getTime() - Date.now() < 6 * 60 * 60 * 1000
  const isTool = item.item_type in TOOL_INFO
  const isRare = item.remaining_quantity < 10
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <PixelCard className="p-6 hover:border-gold-500/50 transition-all h-full flex flex-col group">
        {/* 商品信息 */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <span className="text-4xl">{info.icon}</span>
            {isRare && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.item_name}</h3>
            <p className="text-sm text-gray-400">{info.description}</p>
            <span className={cn(
              "inline-block px-2 py-0.5 text-xs rounded mt-1",
              isTool ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
            )}>
              {isTool ? '工具' : '材料'}
            </span>
          </div>
        </div>
        
        {/* 价格和数量 */}
        <div className="space-y-3 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">单价</span>
            <span className="font-bold text-gold-500">
              {item.unit_price} TDB
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">剩余数量</span>
            <span className="font-bold">
              {item.remaining_quantity.toFixed(item.item_type === 'food' ? 0 : 2)}
              <span className="text-xs text-gray-400 ml-1">
                {isTool ? '件' : '个'}
              </span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">卖家</span>
            <span className="text-sm flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.seller_nickname}
            </span>
          </div>
        </div>
        
        {/* 剩余时间 */}
        <div className={cn(
          "flex items-center gap-2 mt-4 mb-4 text-sm",
          isExpiringSoon ? "text-orange-400" : "text-gray-400"
        )}>
          <Clock className="w-4 h-4" />
          <span>剩余 {getTimeRemaining(item.expire_at)}</span>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <PixelButton onClick={onDetail} variant="secondary" className="flex-1">
            <Info className="w-4 h-4 mr-2" />
            详情
          </PixelButton>
          <PixelButton onClick={onBuy} className="flex-1">
            <Coins className="w-4 h-4 mr-2" />
            购买
          </PixelButton>
        </div>
      </PixelCard>
    </motion.div>
  )
}

// 移动端商品卡片
interface MobileItemCardProps {
  item: any
  index: number
  onDetail: () => void
  getItemInfo: (item: any) => any
  getTimeRemaining: (expireAt: string) => string
}

function MobileItemCard({ item, index, onDetail, getItemInfo, getTimeRemaining }: MobileItemCardProps) {
  const info = getItemInfo(item)
  const isTool = item.item_type in TOOL_INFO
  const isRare = item.remaining_quantity < 10
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onDetail}
      className="p-4 bg-gray-800/50 rounded-lg active:bg-gray-800/70 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <span className="text-3xl">{info.icon}</span>
          {isRare && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h4 className="font-medium">{item.item_name}</h4>
              <span className={cn(
                "inline-block px-1.5 py-0.5 text-xs rounded mt-0.5",
                isTool ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
              )}>
                {isTool ? '工具' : '材料'}
              </span>
            </div>
            <span className="text-lg font-bold text-gold-500">
              {item.unit_price} TDB
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>剩余: {item.remaining_quantity}{isTool ? '件' : '个'}</span>
            <span>{item.seller_nickname}</span>
            <span>{getTimeRemaining(item.expire_at)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 移动端筛选弹窗
interface MobileFilterSheetProps {
  itemType: string
  setItemType: (type: string) => void
  category: string
  setCategory: (cat: string) => void
  priceRange: string
  setPriceRange: (range: string) => void
  onClose: () => void
}

function MobileFilterSheet({
  itemType,
  setItemType,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  onClose
}: MobileFilterSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">筛选商品</h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 筛选内容 */}
        <div className="space-y-4">
          {/* 类型 */}
          <div>
            <p className="text-sm text-gray-400 mb-2">商品类型</p>
            <div className="grid grid-cols-3 gap-2">
              {ITEM_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    setItemType(type.value)
                    setCategory('all')
                  }}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    itemType === type.value
                      ? "bg-gold-500/20 border-gold-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  )}
                >
                  <span className="block text-lg mb-1">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 价格区间 */}
          <div>
            <p className="text-sm text-gray-400 mb-2">价格区间</p>
            <div className="space-y-2">
              {PRICE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(range.value)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-sm text-left",
                    priceRange === range.value
                      ? "bg-gold-500/20 border-gold-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <PixelButton
            variant="secondary"
            onClick={() => {
              setItemType('all')
              setCategory('all')
              setPriceRange('all')
            }}
            className="flex-1"
          >
            重置
          </PixelButton>
          <PixelButton onClick={onClose} className="flex-1">
            确定
          </PixelButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 商品详情弹窗
interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  onBuy: () => void
  getItemInfo: (item: any) => any
  getTimeRemaining: (expireAt: string) => string
  isMobile: boolean
}

function ItemDetailModal({
  isOpen,
  onClose,
  item,
  onBuy,
  getItemInfo,
  getTimeRemaining,
  isMobile
}: ItemDetailModalProps) {
  if (!item) return null
  
  const info = getItemInfo(item)
  const isTool = item.item_type in TOOL_INFO
  const isRare = item.remaining_quantity < 10
  const totalValue = item.unit_price * item.remaining_quantity
  
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 内容 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">商品详情</h3>
                <button onClick={onClose} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <ItemDetailContent
                item={item}
                info={info}
                isTool={isTool}
                isRare={isRare}
                totalValue={totalValue}
                getTimeRemaining={getTimeRemaining}
              />
              
              <div className="mt-6">
                <PixelButton onClick={onBuy} className="w-full">
                  <Coins className="w-4 h-4 mr-2" />
                  立即购买
                </PixelButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="商品详情"
      size="medium"
    >
      <ItemDetailContent
        item={item}
        info={info}
        isTool={isTool}
        isRare={isRare}
        totalValue={totalValue}
        getTimeRemaining={getTimeRemaining}
      />
      
      <div className="mt-6 flex gap-3">
        <PixelButton variant="secondary" onClick={onClose} className="flex-1">
          关闭
        </PixelButton>
        <PixelButton onClick={onBuy} className="flex-1">
          <Coins className="w-4 h-4 mr-2" />
          立即购买
        </PixelButton>
      </div>
    </PixelModal>
  )
}

// 商品详情内容
function ItemDetailContent({ item, info, isTool, isRare, totalValue, getTimeRemaining }: any) {
  return (
    <div className="space-y-4">
      {/* 商品信息 */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <span className="text-5xl">{info.icon}</span>
          {isRare && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold mb-1">{item.item_name}</h4>
          <p className="text-sm text-gray-400 mb-2">{info.description}</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 text-xs rounded",
              isTool ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
            )}>
              {isTool ? '工具' : '材料'}
            </span>
            {isRare && (
              <span className="px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400">
                库存紧张
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
        <div>
          <p className="text-xs text-gray-400 mb-1">单价</p>
          <p className="text-lg font-bold text-gold-500">{item.unit_price} TDB</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">剩余数量</p>
          <p className="text-lg font-bold">{item.remaining_quantity}{isTool ? '件' : '个'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">总价值</p>
          <p className="text-lg font-bold">{totalValue.toFixed(0)} TDB</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">剩余时间</p>
          <p className="text-lg font-bold">{getTimeRemaining(item.expire_at)}</p>
        </div>
      </div>
      
      {/* 卖家信息 */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-400 mb-2">卖家信息</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{item.seller_nickname}</span>
          </div>
          <span className="text-xs text-gray-500">
            发布于 {new Date(item.created_at).toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  )
}

// 购买确认弹窗
interface BuyConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  quantity: number
  setQuantity: (q: number) => void
  balance: number
  onConfirm: () => void
  buying: boolean
  getItemInfo: (item: any) => any
  isMobile: boolean
}

function BuyConfirmModal({
  isOpen,
  onClose,
  item,
  quantity,
  setQuantity,
  balance,
  onConfirm,
  buying,
  getItemInfo,
  isMobile
}: BuyConfirmModalProps) {
  if (!item) return null
  
  const info = getItemInfo(item)
  const totalCost = item.unit_price * quantity
  const maxQuantity = Math.min(
    item.remaining_quantity,
    Math.floor(balance / item.unit_price)
  )
  
  // 快速选择数量
  const quickAmounts = [1, 10, 50, 100].filter(n => n <= maxQuantity)
  
  const content = (
    <div className="space-y-4">
      {/* 商品信息 */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h3 className="font-bold">{item.item_name}</h3>
            <p className="text-sm text-gray-400">
              卖家：{item.seller_nickname}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">单价</p>
            <p className="font-bold text-gold-500">{item.unit_price} TDB</p>
          </div>
          <div>
            <p className="text-gray-400">剩余数量</p>
            <p className="font-bold">{item.remaining_quantity}</p>
          </div>
        </div>
      </div>
      
      {/* 购买数量 */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          购买数量
        </label>
        <div className="flex gap-2 mb-2">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setQuantity(amount)}
              className={cn(
                "flex-1 py-2 rounded border transition-all text-sm",
                amount === quantity
                  ? "bg-gold-500/20 border-gold-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              )}
            >
              {amount}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1
            setQuantity(Math.min(Math.max(1, val), maxQuantity))
          }}
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 focus:border-gold-500 rounded outline-none"
        />
      </div>
      
      {/* 费用汇总 */}
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>商品金额</span>
            <span>{totalCost.toFixed(2)} TDB</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>手续费</span>
            <span>买方免手续费</span>
          </div>
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span>总计</span>
              <span className="font-bold text-gold-500 text-lg">
                {totalCost.toFixed(2)} TDB
              </span>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-400">
              <span>余额</span>
              <span>{balance.toFixed(2)} TDB</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 余额不足提示 */}
      {totalCost > balance && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">
            余额不足，还需要 {(totalCost - balance).toFixed(2)} TDB
          </p>
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="flex gap-3">
        <PixelButton
          variant="secondary"
          onClick={onClose}
          className="flex-1"
          disabled={buying}
        >
          取消
        </PixelButton>
        <PixelButton
          onClick={onConfirm}
          disabled={buying || totalCost > balance || quantity <= 0}
          className="flex-1"
        >
          {buying ? '购买中...' : '确认购买'}
        </PixelButton>
      </div>
    </div>
  )
  
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">确认购买</h3>
                <button onClick={onClose} className="p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title="确认购买"
      size="small"
    >
      {content}
    </PixelModal>
  )
}
