// src/app/shop/orders/page.tsx
// 订单列表页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Order } from '@/lib/api'

// 订单状态筛选选项
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'confirmed', label: '待填地址' },
  { value: 'processing', label: '处理中' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

export default function OrdersListPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/orders')
    }
  }, [authLoading, isAuthenticated, router])

  // 加载订单列表
  const loadOrders = async (reset = false) => {
    if (loading && !reset) return
    
    setLoading(true)
    try {
      const params: any = {
        page: reset ? 1 : page,
        page_size: 10,
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }
      
      const response = await api.shop.orders.list(params)
      
      if (reset) {
        setOrders(response.results)
        setPage(1)
      } else {
        setOrders(prev => [...prev, ...response.results])
      }
      
      setHasMore(!!response.next)
      setTotalCount(response.count)
      
    } catch (error) {
      console.error('加载订单失败:', error)
      toast.error('加载订单失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(true)
    }
  }, [isAuthenticated])

  // 状态筛选变化时重新加载
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(true)
    }
  }, [statusFilter])

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      loadOrders(false)
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-500',
      paid: 'text-blue-500',
      confirmed: 'text-blue-500',
      processing: 'text-blue-500',
      shipped: 'text-green-500',
      completed: 'text-green-500',
      cancelled: 'text-gray-500',
      failed: 'text-red-500',
    }
    return colorMap[status] || 'text-gray-500'
  }

  // 处理订单操作
  const handleOrderAction = (order: Order) => {
    router.push(`/shop/tdb/order?id=${order.id}`)
  }

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          我的订单
        </h1>
        <p className="text-gray-400 mt-2">
          查看和管理您的所有订单
        </p>
      </motion.div>

      {/* 状态筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "px-4 py-2 rounded font-bold transition-all",
                statusFilter === option.value
                  ? "bg-gold-500 text-black"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 订单列表 */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载订单中...</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-400 text-lg">
            {statusFilter ? '没有找到相关订单' : '暂无订单'}
          </p>
          <PixelButton
            className="mt-4"
            onClick={() => router.push('/shop/tdb')}
          >
            去购物
          </PixelButton>
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <PixelCard className="p-4 md:p-6 hover:border-gold-500/50 transition-all cursor-pointer"
                  onClick={() => handleOrderAction(order)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 商品信息 */}
                    <div className="flex gap-4 flex-1">
                      {order.product_snapshot.images?.[0] && (
                        <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={order.product_snapshot.images[0]} 
                            alt={order.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl opacity-20">📦</div>'
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{order.product_name}</h3>
                        <p className="text-sm text-gray-400">
                          订单号：{order.id}
                        </p>
                        <p className="text-sm text-gray-400">
                          下单时间：{new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* 订单状态和金额 */}
                    <div className="flex flex-col md:items-end gap-2">
                      <span className={cn("font-bold", getStatusColor(order.status))}>
                        {order.status_display}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          数量: {order.quantity} | TDB: {order.tdb_amount}
                        </p>
                        <p className="text-lg font-bold text-gold-500">
                          ¥{order.total_price}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-2 justify-end">
                    {order.can_operations.can_pay && (
                      <PixelButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/shop/tdb/order?id=${order.id}`)
                        }}
                      >
                        去支付
                      </PixelButton>
                    )}
                    {order.can_operations.can_set_address && (
                      <PixelButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/shop/tdb/order?id=${order.id}`)
                        }}
                      >
                        填写地址
                      </PixelButton>
                    )}
                    {order.tracking_number && (
                      <PixelButton
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(order.tracking_number!)
                        }}
                      >
                        复制物流单号
                      </PixelButton>
                    )}
                    <PixelButton
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/shop/tdb/order?id=${order.id}`)
                      }}
                    >
                      查看详情
                    </PixelButton>
                  </div>
                </PixelCard>
              </motion.div>
            ))}
          </div>
          
          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center mt-8">
              <PixelButton
                onClick={loadMore}
                disabled={loading}
                variant="secondary"
              >
                {loading ? '加载中...' : '加载更多'}
              </PixelButton>
            </div>
          )}
          
          {/* 显示总数 */}
          <p className="text-center text-gray-400 text-sm mt-4">
            共 {totalCount} 个订单，已加载 {orders.length} 个
          </p>
        </>
      )}
    </div>
  )
}

// 复制到剪贴板
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('物流单号已复制')
  }).catch(() => {
    toast.error('复制失败，请手动复制')
  })
}
