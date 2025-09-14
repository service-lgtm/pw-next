// src/app/trading/orders/page.tsx
// 订单管理页面 - 查看和管理所有交易订单
// 版本：1.0.0 - 支持出售订单和购买记录的管理

/**
 * ============================================
 * 文件创建说明
 * ============================================
 * 创建原因：集中管理用户的所有交易订单
 * 主要功能：
 * 1. 我的出售订单 - 查看和管理正在出售的订单
 * 2. 购买记录 - 查看历史购买记录
 * 3. 交易统计 - 显示交易数据汇总
 * 4. 订单操作 - 支持下架、查看详情等操作
 * 
 * 依赖关系：
 * - /lib/api/trading.ts - 交易 API 接口
 * - /hooks/useTrading.ts - 交易相关 Hook
 * - /trading/sell - 出售管理页面
 * 
 * ⚠️ 重要说明：
 * - 支持订单状态筛选和时间范围筛选
 * - 移动端使用标签页切换不同类型订单
 * - 保持与其他页面的视觉一致性
 * ============================================
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import { useTradingOrders } from '@/hooks/useTrading'
import { RESOURCE_INFO, TOOL_INFO } from '@/lib/api/resources'
import { 
  Package,
  ShoppingCart,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// 订单状态选项
const ORDER_STATUS = {
  all: '全部',
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  expired: '已过期'
}

// 时间范围选项
const TIME_RANGES = {
  today: '今天',
  week: '本周',
  month: '本月',
  all: '全部'
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  // 标签页状态
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell')
  
  // 筛选状态
  const [sellStatus, setSellStatus] = useState('all')
  const [buyStatus, setBuyStatus] = useState('all')
  const [timeRange, setTimeRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // 获取订单数据
  const { 
    sellOrders,
    buyOrders,
    orderStats,
    loading,
    refreshOrders,
    cancelOrder,
    exportOrders
  } = useTradingOrders({
    sellStatus: sellStatus === 'all' ? undefined : sellStatus,
    buyStatus: buyStatus === 'all' ? undefined : buyStatus,
    timeRange
  })
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/trading/orders')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 定期刷新订单
  useEffect(() => {
    const interval = setInterval(refreshOrders, 30000) // 30秒刷新
    return () => clearInterval(interval)
  }, [refreshOrders])
  
  // 处理下架订单
  const handleCancelOrder = async (orderId: number) => {
    const result = await cancelOrder(orderId)
    if (result.success) {
      toast.success('订单已下架')
      refreshOrders()
    }
  }
  
  // 导出订单数据
  const handleExportOrders = async () => {
    const result = await exportOrders(activeTab)
    if (result.success) {
      toast.success('订单数据已导出')
    }
  }
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载订单数据...</p>
        </div>
      </div>
    )
  }
  
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
            <h1 className="text-2xl md:text-3xl font-black text-white">
              我的订单
            </h1>
            <p className="text-gray-400 mt-1">
              管理你的交易订单和历史记录
            </p>
          </div>
          
          {/* 快捷操作 */}
          <div className="flex gap-3">
            <Link href="/trading/marketplace">
              <PixelButton variant="secondary" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                去购买
              </PixelButton>
            </Link>
            <Link href="/trading/sell">
              <PixelButton variant="secondary" size="sm">
                <Package className="w-4 h-4 mr-2" />
                去出售
              </PixelButton>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* 统计卡片 */}
      {orderStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            title="总交易额"
            value={orderStats.total_volume}
            unit="TDB"
            icon="💰"
            trend={orderStats.volume_trend}
          />
          <StatCard
            title="总收入"
            value={orderStats.total_income}
            unit="TDB"
            icon="📈"
            trend={orderStats.income_trend}
          />
          <StatCard
            title="总支出"
            value={orderStats.total_expense}
            unit="TDB"
            icon="💸"
            trend={orderStats.expense_trend}
          />
          <StatCard
            title="交易次数"
            value={orderStats.total_transactions}
            unit="笔"
            icon="🔄"
          />
        </motion.div>
      )}
      
      {/* 标签切换和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          {/* 标签切换 */}
          <div className="flex gap-4 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('sell')}
              className={cn(
                "pb-3 px-4 font-bold transition-all relative",
                activeTab === 'sell'
                  ? "text-gold-500"
                  : "text-gray-400 hover:text-white"
              )}
            >
              出售订单
              {sellOrders && sellOrders.filter(o => o.status === 'active').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                  {sellOrders.filter(o => o.status === 'active').length}
                </span>
              )}
              {activeTab === 'sell' && (
                <motion.div
                  layoutId="activeOrderTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={cn(
                "pb-3 px-4 font-bold transition-all relative",
                activeTab === 'buy'
                  ? "text-gold-500"
                  : "text-gray-400 hover:text-white"
              )}
            >
              购买记录
              {activeTab === 'buy' && (
                <motion.div
                  layoutId="activeOrderTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
                />
              )}
            </button>
          </div>
          
          {/* 筛选和导出按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-lg border transition-all flex items-center gap-2",
                showFilters
                  ? "bg-gold-500/20 border-gold-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">筛选</span>
            </button>
            <button
              onClick={handleExportOrders}
              className="px-4 py-2 rounded-lg border bg-gray-800 border-gray-700 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">导出</span>
            </button>
          </div>
        </div>
        
        {/* 筛选选项 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* 状态筛选 */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">状态：</span>
                {Object.entries(ORDER_STATUS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      if (activeTab === 'sell') {
                        setSellStatus(value)
                      } else {
                        setBuyStatus(value)
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      (activeTab === 'sell' ? sellStatus : buyStatus) === value
                        ? "bg-gold-500/20 border-gold-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {/* 时间筛选 */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 w-full md:w-auto md:mr-2">时间：</span>
                {Object.entries(TIME_RANGES).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setTimeRange(value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm",
                      timeRange === value
                        ? "bg-gold-500/20 border-gold-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* 订单列表 */}
      <AnimatePresence mode="wait">
        {activeTab === 'sell' ? (
          <SellOrderList
            orders={sellOrders || []}
            onCancel={handleCancelOrder}
          />
        ) : (
          <BuyOrderList
            orders={buyOrders || []}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== 子组件 ====================

// 统计卡片（复用之前的组件）
interface StatCardProps {
  title: string
  value: number
  unit: string
  icon: string
  trend?: number
}

function StatCard({ title, value, unit, icon, trend }: StatCardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <PixelCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && trend !== 0 && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-xl font-bold">
        {value.toLocaleString('zh-CN')}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </p>
    </PixelCard>
  )
}

// 出售订单列表
interface SellOrderListProps {
  orders: any[]
  onCancel: (orderId: number) => void
}

function SellOrderList({ orders, onCancel }: SellOrderListProps) {
  if (orders.length === 0) {
    return (
      <motion.div
        key="sell-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-400 text-lg mb-2">暂无出售订单</p>
        <Link href="/trading/sell">
          <PixelButton className="mt-4">
            去出售商品
          </PixelButton>
        </Link>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      key="sell-orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {orders.map((order, index) => (
        <motion.div
          key={order.order_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SellOrderCard
            order={order}
            onCancel={() => onCancel(order.order_id)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// 出售订单卡片
interface SellOrderCardProps {
  order: any
  onCancel: () => void
}

function SellOrderCard({ order, onCancel }: SellOrderCardProps) {
  const itemInfo = order.item_type in RESOURCE_INFO
    ? RESOURCE_INFO[order.item_type as keyof typeof RESOURCE_INFO]
    : TOOL_INFO[order.item_type as keyof typeof TOOL_INFO]
  
  const soldQuantity = order.quantity - order.remaining_quantity
  const soldPercentage = (soldQuantity / order.quantity) * 100
  const totalIncome = soldQuantity * order.unit_price * 0.97 // 扣除3%手续费
  
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: '销售中' },
      selling: { bg: 'bg-green-500/20', text: 'text-green-400', label: '销售中' }, // API返回'active'，显示为'销售中'
      completed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '已完成' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: '已下架' },
      expired: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '已过期' }
    }
    return badges[status] || badges.completed
  }
  
  const badge = getStatusBadge(order.status)
  
  return (
    <PixelCard className="p-6 hover:border-gold-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{itemInfo?.icon || '📦'}</span>
          <div>
            <h4 className="font-bold">{order.item_name}</h4>
            <p className="text-sm text-gray-400">
              订单号：{order.order_id}
            </p>
          </div>
        </div>
        <span className={cn("px-2 py-1 text-xs rounded", badge.bg, badge.text)}>
          {badge.label}
        </span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* 左侧信息 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">单价</p>
              <p className="font-bold text-gold-500">{order.unit_price} TDB</p>
            </div>
            <div>
              <p className="text-gray-400">总数量</p>
              <p className="font-bold">{order.quantity}</p>
            </div>
            <div>
              <p className="text-gray-400">已售出</p>
              <p className="font-bold text-green-400">{soldQuantity}</p>
            </div>
            <div>
              <p className="text-gray-400">剩余</p>
              <p className="font-bold">{order.remaining_quantity}</p>
            </div>
          </div>
          
          {/* 销售进度 */}
          {order.status === 'active' && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>销售进度</span>
                <span>{soldPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-yellow-500 transition-all"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧信息 */}
        <div className="space-y-3">
          <div className="p-3 bg-gray-800/50 rounded">
            <p className="text-xs text-gray-400 mb-1">当前收入（已扣手续费）</p>
            <p className="text-lg font-bold text-gold-500">
              {totalIncome.toFixed(2)} TDB
            </p>
          </div>
          
          {/* 时间信息 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>创建时间：{new Date(order.created_at).toLocaleString('zh-CN')}</p>
            {order.expire_at && (
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                过期时间：{new Date(order.expire_at).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
          
          {/* 操作按钮 */}
          {order.status === 'active' && order.can_cancel && (
            <PixelButton
              onClick={onCancel}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              下架订单
            </PixelButton>
          )}
        </div>
      </div>
    </PixelCard>
  )
}

// 购买记录列表
interface BuyOrderListProps {
  orders: any[]
}

function BuyOrderList({ orders }: BuyOrderListProps) {
  if (orders.length === 0) {
    return (
      <motion.div
        key="buy-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-400 text-lg mb-2">暂无购买记录</p>
        <Link href="/trading/marketplace">
          <PixelButton className="mt-4">
            去市场看看
          </PixelButton>
        </Link>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      key="buy-orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {orders.map((order, index) => (
        <motion.div
          key={order.transaction_id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <BuyOrderCard order={order} />
        </motion.div>
      ))}
    </motion.div>
  )
}

// 购买记录卡片
interface BuyOrderCardProps {
  order: any
}

function BuyOrderCard({ order }: BuyOrderCardProps) {
  const itemInfo = order.item_type in RESOURCE_INFO
    ? RESOURCE_INFO[order.item_type as keyof typeof RESOURCE_INFO]
    : TOOL_INFO[order.item_type as keyof typeof TOOL_INFO]
  
  return (
    <PixelCard className="p-6 hover:border-gold-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{itemInfo?.icon || '📦'}</span>
          <div>
            <h4 className="font-bold">{order.item_name}</h4>
            <p className="text-sm text-gray-400">
              交易号：{order.transaction_id}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">卖家</p>
          <p className="text-sm mb-2">{order.seller}</p>
          
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-400">
              {order.quantity} × {order.unit_price}
            </span>
            <span className="text-lg font-bold text-gold-500">
              {order.total_amount} TDB
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}
