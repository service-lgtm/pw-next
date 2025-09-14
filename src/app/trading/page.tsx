// src/app/trading/page.tsx
// 交易市场主页 - C2C 材料和工具交易中心
// 版本：4.0.0 - 移动端优先设计，优化首屏体验

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：优化移动端体验，确保用户首屏看到最新上架
 * 主要修改：
 * 1. 移动端首屏优先展示最新上架商品
 * 2. 缩小移动端按钮和卡片尺寸
 * 3. 优化移动端布局顺序
 * 4. 简化移动端信息展示
 * 5. 改进触控交互体验
 * 
 * 移动端布局顺序：
 * 1. 精简头部
 * 2. 最新上架（首屏核心）
 * 3. 快速操作（缩小尺寸）
 * 4. 统计数据
 * 5. 最新成交
 * 
 * ⚠️ 重要说明：
 * - 移动端优先展示交易内容
 * - 减少装饰性元素
 * - 优化触控目标大小
 * ============================================
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { useTrading, useTradingMarket } from '@/hooks/useTrading'
import { RESOURCE_INFO, TOOL_INFO } from '@/lib/api/resources'
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Clock, 
  AlertCircle,
  Activity,
  Coins,
  Box,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Timer,
  Filter,
  User,
  Zap,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 商品分类配置
const ITEM_CATEGORIES = {
  all: { label: '全部', icon: '📊' },
  material: { 
    label: '材料', 
    icon: '📦',
    subcategories: {
      all: '全部材料',
      iron: '铁矿',
      stone: '石材', 
      wood: '木材',
      yld: 'YLD陨石',
      food: '粮食'
    }
  },
  tool: { 
    label: '工具', 
    icon: '🔧',
    subcategories: {
      all: '全部工具',
      pickaxe: '镐头',
      axe: '斧头',
      hoe: '锄头'
    }
  }
}

export default function TradingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'material' | 'tool'>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  
  const { 
    marketStats, 
    recentTransactions,
    hotItems,
    loading,
    error,
    refreshData
  } = useTrading()
  
  // 获取最新在售商品列表
  const { 
    items: latestItems, 
    loading: itemsLoading,
    setFilters 
  } = useTradingMarket({
    sort: 'time_desc',
    pageSize: 10,
    type: selectedCategory === 'all' ? undefined : selectedCategory,
    category: selectedSubcategory === 'all' ? undefined : selectedSubcategory
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
      router.push('/login?redirect=/trading')
    }
  }, [authLoading, isAuthenticated, router])

  // 自动刷新数据
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])
  
  // 处理分类切换
  const handleCategoryChange = (category: 'all' | 'material' | 'tool') => {
    setSelectedCategory(category)
    setSelectedSubcategory('all')
    setFilters(prev => ({
      ...prev,
      type: category === 'all' ? undefined : category,
      category: undefined
    }))
  }
  
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    setFilters(prev => ({
      ...prev,
      category: subcategory === 'all' ? undefined : subcategory
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载交易市场...</p>
        </div>
      </div>
    )
  }

  // 移动端布局
  if (isMobile) {
    return (
      <div className="p-3 pb-20">
        {/* 移动端精简头部 */}
        <div className="mb-4">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-gold-500" />
            交易市场
          </h1>
        </div>

        {/* 最新上架 - 移动端首屏核心内容 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <PixelCard className="p-4">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" />
                最新上架
                <span className="animate-pulse w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              </h2>
              <Link href="/trading/marketplace">
                <span className="text-xs text-gold-500 flex items-center gap-1">
                  全部
                  <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            
            {/* 分类筛选 - 移动端简化 */}
            <div className="mb-3">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {Object.entries(ITEM_CATEGORIES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap",
                      selectedCategory === key
                        ? "bg-gold-500/20 border border-gold-500 text-gold-400"
                        : "bg-gray-800 border border-gray-700 text-gray-400"
                    )}
                  >
                    <span className="text-sm">{value.icon}</span>
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 商品列表 - 移动端优化 */}
            {!itemsLoading && latestItems && latestItems.length > 0 ? (
              <div className="space-y-2">
                {latestItems.slice(0, 8).map((item, index) => (
                  <MobileItemRow key={item.order_id} item={item} index={index} />
                ))}
              </div>
            ) : itemsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 opacity-50">📦</div>
                <p className="text-sm text-gray-400">暂无在售商品</p>
              </div>
            )}
          </PixelCard>
        </motion.div>

        {/* 快速操作 - 移动端缩小尺寸 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <Link href="/trading/marketplace">
            <MobileQuickAction
              icon={<ShoppingBag className="w-5 h-5" />}
              label="浏览"
              count={marketStats?.active_orders}
              color="gold"
            />
          </Link>
          <Link href="/trading/sell">
            <MobileQuickAction
              icon={<Package className="w-5 h-5" />}
              label="出售"
              color="blue"
            />
          </Link>
          <Link href="/trading/orders">
            <MobileQuickAction
              icon={<Clock className="w-5 h-5" />}
              label="订单"
              color="purple"
            />
          </Link>
        </motion.div>

        {/* 统计数据 - 移动端横向滚动 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            <MobileStatCard
              title="24h交易"
              value={marketStats?.total_volume_24h || 0}
              unit="TDB"
              trend={marketStats?.volume_change_24h}
            />
            <MobileStatCard
              title="在售"
              value={marketStats?.active_orders || 0}
              unit="件"
            />
            <MobileStatCard
              title="均价"
              value={marketStats?.avg_order_size || 0}
              unit="TDB"
              precision={1}
            />
          </div>
        </motion.div>

        {/* 最新成交 - 移动端简化 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                最新成交
              </h2>
              <Link href="/trading/orders">
                <span className="text-xs text-gold-500 flex items-center gap-1">
                  更多
                  <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.slice(0, 5).map((tx, index) => (
                  <MobileTransactionRow key={tx.transaction_id} transaction={tx} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2 opacity-50">💱</div>
                <p className="text-sm text-gray-400">暂无成交记录</p>
              </div>
            )}
          </PixelCard>
        </motion.div>
      </div>
    )
  }

  // 桌面端布局（保持原有设计）
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-gold-500/20 to-yellow-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-gold-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-gold-500 to-yellow-500 bg-clip-text text-transparent">
            交易市场
          </h1>
        </div>
        <p className="text-gray-400 mt-1 text-lg">
          安全高效的玩家交易平台，让你的资源流动起来
        </p>
      </motion.div>

      {/* 市场统计概览 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <StatCard
          title="24小时交易额"
          value={marketStats?.total_volume_24h || 0}
          unit="TDB"
          icon={<Coins className="w-6 h-6" />}
          trend={marketStats?.volume_change_24h}
          color="gold"
        />
        
        <Link href="/trading/marketplace" className="block">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <StatCard
              title="在售商品"
              value={marketStats?.active_orders || 0}
              unit="件"
              icon={<Package className="w-6 h-6" />}
              color="blue"
              clickable
              actionText="查看全部"
            />
          </motion.div>
        </Link>
        
        <StatCard
          title="平均订单金额"
          value={marketStats?.avg_order_size || 0}
          unit="TDB"
          icon={<TrendingUp className="w-6 h-6" />}
          precision={2}
          color="purple"
        />
      </motion.div>

      {/* 快速操作区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        <QuickActionCard
          title="浏览市场"
          description="发现心仪的商品，快速购买"
          icon={<ShoppingBag className="w-8 h-8" />}
          href="/trading/marketplace"
          variant="primary"
          stats={`${marketStats?.active_orders || 0} 件在售`}
        />
        <QuickActionCard
          title="我要出售"
          description="将闲置资源变现，赚取收益"
          icon={<Package className="w-8 h-8" />}
          href="/trading/sell"
          variant="secondary"
          stats="快速上架"
        />
        <QuickActionCard
          title="我的订单"
          description="查看交易记录，管理订单"
          icon={<Clock className="w-8 h-8" />}
          href="/trading/orders"
          variant="tertiary"
          stats="实时追踪"
        />
      </motion.div>

      {/* 数据展示区 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* 最新上架 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-6 h-full bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                最新上架
                <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              </h2>
              <Link href="/trading/marketplace">
                <button className="text-sm text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            {/* 分类筛选栏 */}
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                {Object.entries(ITEM_CATEGORIES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                      selectedCategory === key
                        ? "bg-gold-500/20 border border-gold-500 text-gold-400"
                        : "bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    <span>{value.icon}</span>
                    {value.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 商品列表 */}
            {!itemsLoading && latestItems && latestItems.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                {latestItems.slice(0, 10).map((item, index) => (
                  <LatestItemRow key={item.order_id} item={item} index={index} />
                ))}
              </div>
            ) : itemsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-14 bg-gray-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">📦</div>
                <p className="text-gray-400">暂无在售商品</p>
              </div>
            )}
          </PixelCard>
        </motion.div>

        {/* 最新成交 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PixelCard className="p-6 h-full bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                最新成交
                <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>
              </h2>
              <Link href="/trading/orders">
                <button className="text-sm text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
                  交易记录
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentTransactions.slice(0, 10).map((tx, index) => (
                  <TransactionRow key={tx.transaction_id} transaction={tx} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">💱</div>
                <p className="text-gray-400">暂无成交记录</p>
              </div>
            )}
          </PixelCard>
        </motion.div>
      </div>
    </div>
  )
}

// ==================== 移动端专用组件 ====================

// 移动端商品行
function MobileItemRow({ item, index }: { item: any; index: number }) {
  const itemInfo = RESOURCE_INFO[item.item_type] || TOOL_INFO[item.item_type]
  const isTool = item.item_type in TOOL_INFO
  const isRare = item.remaining_quantity < 10
  
  return (
    <Link href={`/trading/marketplace?item=${item.order_id}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        className="p-2.5 bg-gray-800/30 rounded-lg active:bg-gray-800/50 transition-all"
      >
        <div className="flex items-center gap-2.5">
          {/* 图标 */}
          <div className="relative">
            <span className="text-xl">{itemInfo?.icon || '📦'}</span>
            {isRare && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            )}
          </div>
          
          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{item.item_name}</span>
              <span className={cn(
                "px-1 py-0.5 text-xs rounded shrink-0",
                isTool ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
              )}>
                {isTool ? '工具' : '材料'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span>{item.remaining_quantity}{isTool ? '件' : '个'}</span>
              <span className="text-gold-500 font-bold">{item.unit_price} TDB</span>
              <span className="truncate">{item.seller_nickname}</span>
            </div>
          </div>
          
          {/* 箭头 */}
          <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
        </div>
      </motion.div>
    </Link>
  )
}

// 移动端快速操作 - 统一高度设计
function MobileQuickAction({ 
  icon, 
  label,
  badge,
  color = 'gold' 
}: { 
  icon: React.ReactNode
  label: string
  badge?: string
  color?: 'gold' | 'blue' | 'purple'
}) {
  const colorClasses = {
    gold: 'from-gold-500/20 to-yellow-500/20 border-gold-500/30 text-gold-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
  }
  
  const iconColors = {
    gold: 'text-gold-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  }
  
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative h-full min-h-[80px] p-3 rounded-lg border bg-gradient-to-br flex flex-col items-center justify-center",
        colorClasses[color]
      )}
    >
      <div className={cn("mb-1", iconColors[color])}>
        {icon}
      </div>
      <span className="text-xs font-medium text-white">{label}</span>
      {badge && (
        <span className="text-xs text-gray-400 mt-1">{badge}</span>
      )}
    </motion.div>
  )
}

// 移动端统计卡片
function MobileStatCard({ 
  title, 
  value, 
  unit,
  trend,
  precision = 0
}: {
  title: string
  value: number
  unit: string
  trend?: number
  precision?: number
}) {
  return (
    <div className="min-w-[120px] p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-base font-bold">
        {value.toLocaleString('zh-CN', { maximumFractionDigits: precision })}
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </p>
      {trend !== undefined && trend !== 0 && (
        <div className={cn(
          "text-xs mt-1",
          trend > 0 ? "text-green-400" : "text-red-400"
        )}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

// 移动端成交记录
function MobileTransactionRow({ transaction, index }: { transaction: any; index: number }) {
  const itemInfo = RESOURCE_INFO[transaction.item_type] || TOOL_INFO[transaction.item_type]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center justify-between p-2 bg-gray-800/30 rounded"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base">{itemInfo?.icon || '📦'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">
            <span className="text-blue-400">{transaction.buyer}</span>
            <span className="text-gray-500 mx-1">买了</span>
            <span>{transaction.quantity}个</span>
          </p>
          <p className="text-xs text-gray-500">{transaction.time_ago}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-gold-500 shrink-0">
        {transaction.total_amount} TDB
      </p>
    </motion.div>
  )
}

// ==================== 桌面端组件（保持原有） ====================

// 统计卡片
function StatCard({ 
  title, 
  value, 
  unit, 
  icon, 
  trend, 
  precision = 0, 
  color = 'gold',
  clickable = false,
  actionText
}: any) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0
  
  const colorClasses = {
    gold: 'from-gold-500/20 to-yellow-500/20 text-gold-500',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-500',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-500',
    green: 'from-green-500/20 to-emerald-500/20 text-green-500'
  }

  return (
    <PixelCard className={cn(
      "p-6 relative overflow-hidden group transition-all",
      clickable ? "cursor-pointer hover:border-gold-500" : "hover:border-gold-500/50"
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity",
        colorClasses[color]
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", colorClasses[color])}>
            {icon}
          </div>
          {trend !== undefined && trend !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded",
              isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl md:text-3xl font-black">
            {value.toLocaleString('zh-CN', { maximumFractionDigits: precision })}
            <span className="text-base text-gray-400 ml-2">{unit}</span>
          </p>
          {clickable && actionText && (
            <span className="text-xs text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {actionText}
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </PixelCard>
  )
}

// 快速操作卡片和其他组件保持原样...
function QuickActionCard({ title, description, icon, href, variant, stats }: any) {
  const variants = {
    primary: {
      border: 'border-gold-500/30 hover:border-gold-500',
      bg: 'from-gold-900/20 to-yellow-900/20',
      iconBg: 'bg-gold-500/20 text-gold-400',
      hover: 'hover:shadow-gold-500/20'
    },
    secondary: {
      border: 'border-blue-500/30 hover:border-blue-500',
      bg: 'from-blue-900/20 to-cyan-900/20',
      iconBg: 'bg-blue-500/20 text-blue-400',
      hover: 'hover:shadow-blue-500/20'
    },
    tertiary: {
      border: 'border-purple-500/30 hover:border-purple-500',
      bg: 'from-purple-900/20 to-pink-900/20',
      iconBg: 'bg-purple-500/20 text-purple-400',
      hover: 'hover:shadow-purple-500/20'
    }
  }

  const style = variants[variant]

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }} 
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <PixelCard className={cn(
          "p-6 cursor-pointer transition-all h-full",
          "bg-gradient-to-br hover:shadow-lg",
          style.border,
          style.bg,
          style.hover
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-lg", style.iconBg)}>
                {icon}
              </div>
              <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">{title}</h3>
              <p className="text-sm text-gray-400 mb-3">{description}</p>
            </div>
            {stats && (
              <div className="pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">{stats}</span>
              </div>
            )}
          </div>
        </PixelCard>
      </motion.div>
    </Link>
  )
}

// 最新上架商品行
function LatestItemRow({ item, index }: any) {
  const itemInfo = RESOURCE_INFO[item.item_type] || TOOL_INFO[item.item_type]
  const isTool = item.item_type in TOOL_INFO
  const isRare = item.remaining_quantity < 10
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <span className="text-2xl">{itemInfo?.icon || '📦'}</span>
            {isRare && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{item.item_name}</h4>
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded",
                isTool ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
              )}>
                {isTool ? '工具' : '材料'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">
                剩余: {item.remaining_quantity}{isTool ? '件' : '个'}
              </span>
              <span className="text-gold-500 font-bold">
                {item.unit_price} TDB
              </span>
              <span className="text-gray-500 truncate">
                {item.seller_nickname}
              </span>
            </div>
          </div>
        </div>
        
        <Link href={`/trading/marketplace?item=${item.order_id}`}>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <PixelButton size="xs" variant="secondary">
              查看
            </PixelButton>
          </button>
        </Link>
      </div>
    </motion.div>
  )
}

// 交易记录行
function TransactionRow({ transaction, index }: any) {
  const itemInfo = RESOURCE_INFO[transaction.item_type] || TOOL_INFO[transaction.item_type]
  const isTool = transaction.item_type in TOOL_INFO
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-lg flex-shrink-0">
          {itemInfo?.icon || '📦'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            <span className="text-blue-400">{transaction.buyer || '匿名'}</span>
            <span className="text-gray-500 mx-1">购买</span>
            <span className="font-medium text-white">
              {transaction.quantity}{isTool ? '件' : '个'} {transaction.item_name}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {transaction.time_ago || '刚刚'}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gold-500">
          {transaction.total_amount} TDB
        </p>
      </div>
    </motion.div>
  )
}

// 自定义滚动条样式
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.5);
  }
`

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = scrollbarStyles
  document.head.appendChild(style)
}
