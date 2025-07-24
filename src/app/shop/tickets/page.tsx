// src/app/shop/tickets/page.tsx
// 提货单列表页面

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
import type { Ticket } from '@/lib/api'

// 状态筛选选项
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '待审核' },
  { value: 'active', label: '可使用' },
  { value: 'used', label: '已使用' },
  { value: 'cancelled', label: '已取消' },
  { value: 'expired', label: '已过期' },
]

export default function TicketsListPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tickets')
    }
  }, [authLoading, isAuthenticated, router])

  // 加载提货单列表
  const loadTickets = async (reset = false) => {
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
      
      if (availableOnly) {
        params.available = true
      }
      
      const response = await api.shop.tickets.list(params)
      
      if (reset) {
        setTickets(response.results)
        setPage(1)
      } else {
        setTickets(prev => [...prev, ...response.results])
      }
      
      setHasMore(!!response.next)
      setTotalCount(response.count)
      
    } catch (error) {
      console.error('加载提货单失败:', error)
      toast.error('加载提货单失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets(true)
    }
  }, [isAuthenticated])

  // 状态筛选变化时重新加载
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets(true)
    }
  }, [statusFilter, availableOnly])

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      loadTickets(false)
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-500',
      paid: 'text-blue-500',
      active: 'text-green-500',
      used: 'text-gray-500',
      cancelled: 'text-gray-500',
      expired: 'text-red-500',
    }
    return colorMap[status] || 'text-gray-500'
  }

  // 处理提货单操作
  const handleTicketAction = (ticket: Ticket) => {
    router.push(`/shop/tdb/ticket?id=${ticket.id}`)
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
          我的提货单
        </h1>
        <p className="text-gray-400 mt-2">
          查看和管理您的所有提货单
        </p>
      </motion.div>

      {/* 统计信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gold-500">
            {tickets.filter(t => t.status === 'active').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">可使用</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {tickets.filter(t => t.status === 'pending' || t.status === 'paid').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">处理中</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-500">
            {tickets.filter(t => t.status === 'used').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">已使用</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {totalCount}
          </p>
          <p className="text-sm text-gray-400 mt-1">总数</p>
        </PixelCard>
      </motion.div>

      {/* 状态筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
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
          
          <label className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">只显示可用提货单</span>
          </label>
        </div>
      </motion.div>

      {/* 提货单列表 */}
      {loading && tickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载提货单中...</p>
        </div>
      ) : tickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-400 text-lg">
            {statusFilter || availableOnly ? '没有找到相关提货单' : '暂无提货单'}
          </p>
          <PixelButton
            className="mt-4"
            onClick={() => router.push('/shop/tdb')}
          >
            去购买
          </PixelButton>
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <PixelCard className="p-4 md:p-6 hover:border-gold-500/50 transition-all cursor-pointer"
                  onClick={() => handleTicketAction(ticket)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 商品信息 */}
                    <div className="flex gap-4 flex-1">
                      {ticket.product_snapshot.images?.[0] && (
                        <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={ticket.product_snapshot.images[0]} 
                            alt={ticket.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              const placeholder = document.createElement('div')
                              placeholder.className = 'w-full h-full flex items-center justify-center text-3xl opacity-20'
                              placeholder.textContent = '📦'
                              target.parentElement?.replaceChild(placeholder, target)
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{ticket.product_name}</h3>
                        <p className="text-sm text-gray-400">
                          单号：{ticket.id}
                        </p>
                        <p className="text-sm text-gray-400">
                          创建时间：{new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* 状态和价值 */}
                    <div className="flex flex-col md:items-end gap-2">
                      <span className={cn("font-bold", getStatusColor(ticket.status))}>
                        {ticket.status_display}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          数量: {ticket.quantity} | TDB: {ticket.tdb_amount}
                        </p>
                        <p className="text-lg font-bold text-gold-500">
                          ¥{ticket.total_price}
                        </p>
                        {ticket.status === 'active' && (
                          <p className="text-sm text-green-500">
                            剩余价值: ¥{ticket.remaining_value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮和历史记录 */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        {ticket.can_use && (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                            可使用
                          </span>
                        )}
                        {ticket.tdb_credited && (
                          <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded">
                            TDB已到账
                          </span>
                        )}
                        {ticket.pickup_requests && ticket.pickup_requests.length > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">
                            已申请提货
                          </span>
                        )}
                        {ticket.exchange_requests && ticket.exchange_requests.length > 0 && (
                          <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded">
                            已兑换 {ticket.exchange_requests.length} 次
                          </span>
                        )}
                      </div>
                      
                      <PixelButton
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/shop/tdb/ticket?id=${ticket.id}`)
                        }}
                      >
                        查看详情
                      </PixelButton>
                    </div>
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
            共 {totalCount} 个提货单，已加载 {tickets.length} 个
          </p>
        </>
      )}
    </div>
  )
}
