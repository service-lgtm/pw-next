// src/app/trading/sell/page.tsx
// 出售管理页面 - 创建和管理出售订单
// 版本：1.1.0 - 优化工具提示，移除价格限制显示

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：优化用户体验，完善工具售卖提示
 * 主要修改：
 * 1. 添加工具耐久度100%要求的明确提示
 * 2. 移除价格限制±15%的显示
 * 3. 优化无工具可售时的空状态提示
 * 
 * 主要功能：
 * 1. 可售资源展示 - 显示用户可以出售的物品
 * 2. 创建出售订单 - 设置价格和数量上架商品
 * 3. 价格指导 - 显示昨日均价和允许的价格范围
 * 4. 订单管理 - 查看和管理正在出售的订单
 * 
 * 依赖关系：
 * - /lib/api/trading.ts - 交易 API 接口
 * - /hooks/useTrading.ts - 交易相关 Hook
 * - /hooks/useInventory.ts - 库存相关 Hook
 * 
 * ⚠️ 重要说明：
 * - 价格限制逻辑在 API 层面控制
 * - 工具只能出售耐久度 100% 且未投用的
 * - 出售时资源会被冻结，下架后返还
 * ============================================
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useAuth } from '@/hooks/useAuth'
import { useTradingSell } from '@/hooks/useTrading'
import { useInventory } from '@/hooks/useInventory'
import { RESOURCE_INFO, TOOL_INFO } from '@/lib/api/resources'
import {
  Package,
  TrendingUp,
  Info,
  AlertCircle,
  Clock,
  X,
  Plus,
  Minus,
  RefreshCw,
  Wrench,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { getResourceIcon } from '@/utils/resourceTool'

export default function SellPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // 获取可售资源和订单数据
  const {
    sellableResources,
    myOrders,
    priceGuidance,
    loading,
    refreshData,
    createSellOrder,
    confirmSellOrder,
    cancelOrder,
    creating
  } = useTradingSell()

  // 获取库存数据
  const {
    materials,
    tools,
    refetch: refetchInventory
  } = useInventory({
    category: 'all'
  })

  // 出售弹窗状态
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showSellModal, setShowSellModal] = useState(false)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [sellPrice, setSellPrice] = useState('')
  const [previewOrder, setPreviewOrder] = useState<any>(null)

  // 活动订单标签
  const [activeTab, setActiveTab] = useState<'sellable' | 'orders'>('sellable')

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/trading/sell')
    }
  }, [authLoading, isAuthenticated, router])

  // 定期刷新数据
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
      refetchInventory()
    }, 30000) // 30秒刷新
    return () => clearInterval(interval)
  }, [refreshData, refetchInventory])

  // 打开出售弹窗
  const handleOpenSellModal = (itemType: string, itemInfo: any) => {
    const guidance = priceGuidance?.[itemType]
    if (!guidance) {
      toast.error('无法获取价格信息')
      return
    }

    setSelectedItem({
      type: itemType,
      info: itemInfo,
      available: sellableResources?.materials?.[itemType]?.available ||
        sellableResources?.tools?.[itemType]?.available || 0,
      guidance
    })
    setSellQuantity(1)
    setSellPrice(guidance.yesterday_avg.toFixed(2))
    setPreviewOrder(null)
    setShowSellModal(true)
  }

  // 创建预览订单
  const handleCreatePreview = async () => {
    if (!selectedItem) return

    const result = await createSellOrder({
      item_type: selectedItem.type,
      quantity: sellQuantity,
      unit_price: parseFloat(sellPrice)
    })

    if (result.success && result.data) {
      setPreviewOrder(result.data)
    }
  }

  // 确认出售
  const handleConfirmSell = async () => {
    if (!previewOrder) return

    const result = await confirmSellOrder(previewOrder.order_id)
    if (result.success) {
      toast.success('挂单成功！')
      setShowSellModal(false)
      refreshData()
      refetchInventory()
    }
  }

  // 下架订单
  const handleCancelOrder = async (orderId: number) => {
    const result = await cancelOrder(orderId)
    if (result.success) {
      toast.success('订单已下架')
      refreshData()
      refetchInventory()
    }
  }

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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          出售中心
        </h1>
        <p className="text-gray-400 mt-1">
          将你的材料和工具上架交易市场
        </p>

        {/* 快速统计 */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">在售订单：</span>
            <span className="font-bold text-white">
              {myOrders?.filter(o => o.status === 'active').length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">今日成交：</span>
            <span className="font-bold text-green-400">
              {myOrders?.filter(o => {
                const today = new Date().toDateString()
                return new Date(o.created_at).toDateString() === today
              }).reduce((sum, o) => sum + (o.quantity - o.remaining_quantity), 0) || 0}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 标签切换 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('sellable')}
            className={cn(
              "pb-3 px-4 font-bold transition-all relative",
              activeTab === 'sellable'
                ? "text-gold-500"
                : "text-gray-400 hover:text-white"
            )}
          >
            可售资源
            {activeTab === 'sellable' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "pb-3 px-4 font-bold transition-all relative",
              activeTab === 'orders'
                ? "text-gold-500"
                : "text-gray-400 hover:text-white"
            )}
          >
            我的订单
            {myOrders?.filter(o => o.status === 'active').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                {myOrders.filter(o => o.status === 'active').length}
              </span>
            )}
            {activeTab === 'orders' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500"
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">123
        {activeTab === 'sellable' ? (
          <SellableResources
            materials={sellableResources?.materials || {}}
            tools={sellableResources?.tools || {}}
            priceGuidance={priceGuidance || {}}
            onSell={handleOpenSellModal}
          />
        ) : (
          <MyOrders
            orders={myOrders || []}
            onCancel={handleCancelOrder}
          />
        )}
      </AnimatePresence>

      {/* 交易规则提示 - 优化内容 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <PixelCard className="p-6 bg-blue-900/20 border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-bold text-blue-400">出售须知</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 成交后将收取 3% 手续费</li>
                <li>• 订单 48 小时后自动过期，剩余物品将返还</li>
                <li className="flex items-start gap-1">
                  <span>•</span>
                  <span>
                    工具需要 <span className="text-yellow-400 font-bold">耐久度100%</span> 且未投用才能出售
                  </span>
                </li>
                <li>• 挂单后资源会被冻结，无法用于其他用途</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </motion.div>

      {/* 出售弹窗 */}
      <SellModal
        isOpen={showSellModal}
        onClose={() => {
          setShowSellModal(false)
          setPreviewOrder(null)
        }}
        item={selectedItem}
        quantity={sellQuantity}
        setQuantity={setSellQuantity}
        price={sellPrice}
        setPrice={setSellPrice}
        previewOrder={previewOrder}
        onCreatePreview={handleCreatePreview}
        onConfirm={handleConfirmSell}
        creating={creating}
      />
    </div>
  )
}

// ==================== 子组件 ====================

// 可售资源列表
interface SellableResourcesProps {
  materials: any
  tools: any
  priceGuidance: any
  onSell: (itemType: string, itemInfo: any) => void
}

function SellableResources({ materials, tools, priceGuidance, onSell }: SellableResourcesProps) {
  const hasMaterials = Object.keys(materials).length > 0
  const hasTools = Object.keys(tools).length > 0
  const hasResources = hasMaterials || hasTools

  if (!hasResources) {
    return (
      <motion.div
        key="sellable"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-400 text-lg mb-2">暂无可售资源</p>
        <p className="text-gray-500 text-sm">去获取一些材料或工具吧！</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="sellable"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 材料 */}
      {hasMaterials && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📦</span>
            材料
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(materials).map(([type, data]: [string, any]) => {
              const info = RESOURCE_INFO[type as keyof typeof RESOURCE_INFO]
              const guidance = priceGuidance[type]

              return (
                <ResourceCard
                  key={type}
                  type={type}
                  data={data}
                  info={info}
                  guidance={guidance}
                  onSell={() => onSell(type, info)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* 工具 */}
      {hasTools ? (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🔧</span>
            工具
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tools).map(([type, data]: [string, any]) => {
              const info = TOOL_INFO[type as keyof typeof TOOL_INFO]
              const guidance = priceGuidance[type]

              return (
                <ResourceCard
                  key={type}
                  type={type}
                  data={data}
                  info={info}
                  guidance={guidance}
                  onSell={() => onSell(type, info)}
                  isTool
                />
              )
            })}
          </div>
        </div>
      ) : (
        // 没有工具可售时的特殊提示
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🔧</span>
            工具
          </h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-orange-900/20 border border-orange-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Wrench className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-400 mb-2">暂无可售工具</p>
                <p className="text-sm text-gray-300 mb-3">
                  工具需要满足以下条件才能出售：
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span>耐久度必须为 <span className="text-yellow-400 font-bold">100%（1500/1500）</span></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">🔒</span>
                    <span>工具未投入使用（未装备）</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  提示：只有全新的工具才能在市场上交易
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// 资源卡片
interface ResourceCardProps {
  type: string
  data: any
  info: any
  guidance: any
  onSell: () => void
  isTool?: boolean
}

function ResourceCard({ type, data, info, guidance, onSell, isTool }: ResourceCardProps) {
  if (!info || !data) return null

  return (
    <PixelCard className="p-6 hover:border-gold-500/50 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl">{getResourceIcon(info.icon, {
          iconSize: 36,
          haveBackgroundWarper: true,
        })}</span>
        <div className="flex-1">
          <h4 className="font-bold">{data.name}</h4>
          {isTool && (
            <p className="text-xs text-gray-400 mt-1">{data.conditions}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">可售数量</span>
          <span className="font-bold text-green-400">
            {data.available}
            {!isTool && <span className="text-xs text-gray-400 ml-1">个</span>}
          </span>
        </div>
        {data.frozen > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">冻结数量</span>
            <span className="text-orange-400">{data.frozen}</span>
          </div>
        )}
        {guidance && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">昨日均价</span>
              <span className="font-bold text-gold-500">
                {guidance.yesterday_avg} TDB
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">价格范围</span>
              <span className="text-xs">
                {guidance.min_allowed} - {guidance.max_allowed} TDB
              </span>
            </div>
          </>
        )}
      </div>

      <PixelButton
        onClick={onSell}
        disabled={data.available === 0}
        className="w-full"
        size="sm"
      >
        {data.available > 0 ? '出售' : '无货'}
      </PixelButton>
    </PixelCard>
  )
}

// 我的订单列表
interface MyOrdersProps {
  orders: any[]
  onCancel: (orderId: number) => void
}

function MyOrders({ orders, onCancel }: MyOrdersProps) {
  const activeOrders = orders.filter(o => o.status === 'active')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')

  if (orders.length === 0) {
    return (
      <motion.div
        key="orders"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-16"
      >
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-400 text-lg mb-2">暂无订单</p>
        <p className="text-gray-500 text-sm">出售一些商品来开始交易吧</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* 进行中的订单 */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-green-400">●</span>
            进行中 ({activeOrders.length})
          </h3>
          <div className="space-y-4">
            {activeOrders.map(order => (
              <OrderCard
                key={order.order_id}
                order={order}
                onCancel={() => onCancel(order.order_id)}
                showCancelButton
              />
            ))}
          </div>
        </div>
      )}

      {/* 已完成的订单 */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-gray-400">●</span>
            已完成 ({completedOrders.length})
          </h3>
          <div className="space-y-4">
            {completedOrders.slice(0, 5).map(order => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* 已取消的订单 */}
      {cancelledOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-red-400">●</span>
            已下架 ({cancelledOrders.length})
          </h3>
          <div className="space-y-4">
            {cancelledOrders.slice(0, 3).map(order => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// 订单卡片
interface OrderCardProps {
  order: any
  onCancel?: () => void
  showCancelButton?: boolean
}

function OrderCard({ order, onCancel, showCancelButton }: OrderCardProps) {
  // 安全获取商品信息
  const itemInfo = (() => {
    if (order.item_type && RESOURCE_INFO && order.item_type in RESOURCE_INFO) {
      return RESOURCE_INFO[order.item_type as keyof typeof RESOURCE_INFO]
    }
    if (order.item_type && TOOL_INFO && order.item_type in TOOL_INFO) {
      return TOOL_INFO[order.item_type as keyof typeof TOOL_INFO]
    }
    return null
  })()

  const soldQuantity = order.quantity - order.remaining_quantity
  const soldPercentage = (soldQuantity / order.quantity) * 100

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

  return (
    <PixelCard className="p-6">
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
        {order.status === 'active' && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
            销售中
          </span>
        )}
        {order.status === 'completed' && (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
            已完成
          </span>
        )}
        {order.status === 'cancelled' && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
            已下架
          </span>
        )}
        {order.status === 'expired' && (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
            已过期
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* 价格和数量信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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

        {/* 销售进度 - 只有active状态才显示 */}
        {order.status === 'active' && (
          <>
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

            {/* 剩余时间 */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>剩余 {getTimeRemaining(order.expire_at)}</span>
            </div>
          </>
        )}

        {/* 过期时间显示 - 已过期的订单 */}
        {order.status === 'expired' && (
          <div className="flex items-center gap-2 text-sm text-orange-400">
            <Clock className="w-4 h-4" />
            <span>过期于 {new Date(order.expire_at).toLocaleString('zh-CN')}</span>
          </div>
        )}

        {/* 时间信息 */}
        <div className="text-xs text-gray-500">
          创建于 {new Date(order.created_at).toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 操作按钮 - 只有active状态且can_cancel为true才显示 */}
      {showCancelButton && order.can_cancel && order.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <PixelButton
            onClick={onCancel}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            下架订单
          </PixelButton>
        </div>
      )}
    </PixelCard>
  )
}

// 出售弹窗
interface SellModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  quantity: number
  setQuantity: (q: number) => void
  price: string
  setPrice: (p: string) => void
  previewOrder: any
  onCreatePreview: () => void
  onConfirm: () => void
  creating: boolean
}

function SellModal({
  isOpen,
  onClose,
  item,
  quantity,
  setQuantity,
  price,
  setPrice,
  previewOrder,
  onCreatePreview,
  onConfirm,
  creating
}: SellModalProps) {
  if (!item) return null

  const totalAmount = quantity * parseFloat(price || '0')
  const feeAmount = totalAmount * 0.03
  const expectedIncome = totalAmount - feeAmount

  // 价格是否在允许范围内
  const priceValid = item.guidance &&
    parseFloat(price) >= item.guidance.min_allowed &&
    parseFloat(price) <= item.guidance.max_allowed

  // 快速选择数量
  const quickAmounts = [1, 10, 50, 100].filter(n => n <= item.available)

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={previewOrder ? "确认出售" : `出售 ${item.info?.name}`}
      size="small"
    >
      <div className="space-y-4">
        {!previewOrder ? (
          // 设置价格和数量
          <>
            {/* 商品信息 */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{item.info?.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold">{item.info?.name}</h3>
                  <p className="text-sm text-gray-400">
                    可售数量：{item.available}
                  </p>
                </div>
              </div>

              {/* 价格指导 */}
              {item.guidance && (
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                  <p className="text-xs text-blue-400 mb-2">💡 价格指导</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">昨日均价</p>
                      <p className="font-bold text-gold-500">
                        {item.guidance.yesterday_avg} TDB
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">最低价</p>
                      <p className="font-bold">{item.guidance.min_allowed} TDB</p>
                    </div>
                    <div>
                      <p className="text-gray-400">最高价</p>
                      <p className="font-bold">{item.guidance.max_allowed} TDB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 出售数量 */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                出售数量
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={item.available}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setQuantity(Math.min(Math.max(1, val), item.available))
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white text-center border border-gray-700 focus:border-gold-500 rounded outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(item.available, quantity + 1))}
                  className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 单价设置 */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                单价（TDB）
              </label>
              <input
                type="number"
                step="0.01"
                min={item.guidance?.min_allowed || 0}
                max={item.guidance?.max_allowed || 999999}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 bg-gray-800 text-white border rounded outline-none",
                  !priceValid && price !== ''
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-700 focus:border-gold-500"
                )}
              />
              {!priceValid && price !== '' && (
                <p className="text-xs text-red-400 mt-1">
                  价格必须在 {item.guidance.min_allowed} - {item.guidance.max_allowed} TDB 之间
                </p>
              )}
            </div>

            {/* 费用预览 */}
            <div className="p-4 bg-gray-800/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>销售金额</span>
                <span>{totalAmount.toFixed(2)} TDB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>手续费（3%）</span>
                <span className="text-red-400">-{feeAmount.toFixed(2)} TDB</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between">
                  <span>预计收入</span>
                  <span className="font-bold text-gold-500 text-lg">
                    {expectedIncome.toFixed(2)} TDB
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={creating}
              >
                取消
              </PixelButton>
              <PixelButton
                onClick={onCreatePreview}
                disabled={
                  creating ||
                  !priceValid ||
                  !price ||
                  quantity <= 0 ||
                  quantity > item.available
                }
                className="flex-1"
              >
                {creating ? '处理中...' : '下一步'}
              </PixelButton>
            </div>
          </>
        ) : (
          // 确认订单
          <>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 mb-3">
                ✅ 订单预览
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>商品</span>
                  <span className="font-bold">
                    {item.info?.icon} {previewOrder.item_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>数量</span>
                  <span className="font-bold">{previewOrder.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>单价</span>
                  <span className="font-bold">{previewOrder.unit_price} TDB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>手续费</span>
                  <span className="text-red-400">-{previewOrder.fee_amount} TDB</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>预计收入</span>
                    <span className="font-bold text-gold-500">
                      {previewOrder.expected_income} TDB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
              <p className="text-xs text-orange-400">
                ⚠️ 确认后，{previewOrder.quantity} 个{previewOrder.item_name}将被冻结，
                订单将在交易市场中展示 48 小时
              </p>
            </div>

            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                onClick={() => {
                  setPreviewOrder(null)
                }}
                className="flex-1"
                disabled={creating}
              >
                返回修改
              </PixelButton>
              <PixelButton
                onClick={onConfirm}
                disabled={creating}
                className="flex-1"
              >
                {creating ? '挂单中...' : '确认挂单'}
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </PixelModal>
  )
}
