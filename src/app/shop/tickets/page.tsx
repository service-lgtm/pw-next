// src/app/shop/tickets/page.tsx
// 我的提货单列表页面 - 完整生产版本
// 修复：过期状态判断、图片URL处理、移除无用入口

'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Ticket } from '@/lib/api'

/**
 * 提货单列表页面
 * 
 * 主要功能：
 * 1. 展示用户的所有提货单
 * 2. 状态筛选和搜索
 * 3. 根据状态显示不同操作
 * 4. 自动判断过期状态
 * 
 * API接口：
 * - GET /api/v1/shop/tickets/ - 获取提货单列表
 * - POST /api/v1/shop/tickets/{id}/cancel/ - 取消提货单
 * 
 * 相关页面：
 * - /shop/tickets/{id} - 提货单详情
 * - /shop/tdb/payment - 支付页面
 * - /shop/tdb/ticket - 提货单操作页面
 */

// 扩展 Ticket 类型，添加后端返回的新字段
interface ExtendedTicket extends Ticket {
  is_expired?: boolean
  actual_status?: string
  actual_status_display?: string
}

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

/**
 * 修复图片URL，确保使用正确的域名
 */
function fixImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  
  // 如果URL包含错误的域名，替换为正确的
  if (url.includes('www.pxsj.net.cn') || (url.includes('pxsj.net.cn') && !url.includes('mg.pxsj.net.cn'))) {
    if (url.includes('/media/')) {
      const mediaPath = '/media/' + url.split('/media/')[1]
      return `https://mg.pxsj.net.cn${mediaPath}`
    }
  }
  
  // 如果是相对路径，添加完整域名
  if (url.startsWith('/media/')) {
    return `https://mg.pxsj.net.cn${url}`
  }
  
  return url
}

/**
 * 判断提货单是否过期
 * 优先使用后端返回的 is_expired 字段
 */
function isTicketExpired(ticket: ExtendedTicket): boolean {
  // 如果后端返回了 is_expired 字段，直接使用
  if (typeof ticket.is_expired === 'boolean') {
    return ticket.is_expired
  }
  
  // 兼容旧版本：如果后端没有返回 is_expired，则前端判断
  if (ticket.status === 'expired') return true
  if (ticket.status !== 'pending') return false
  if (!ticket.expire_at) return false
  
  // 处理时间格式："2025-08-15 01:50:35" -> "2025-08-15T01:50:35+08:00"
  let expireTimeStr = ticket.expire_at
  if (!expireTimeStr.includes('T')) {
    // 如果是 "YYYY-MM-DD HH:mm:ss" 格式，转换为ISO格式并加上时区
    expireTimeStr = expireTimeStr.replace(' ', 'T') + '+08:00'
  }
  
  const expireTime = new Date(expireTimeStr).getTime()
  const now = new Date().getTime()
  return now > expireTime
}

/**
 * 获取实际显示状态
 * 优先使用后端返回的 actual_status 和 actual_status_display
 */
function getActualStatus(ticket: ExtendedTicket): { status: string; display: string } {
  // 如果后端返回了 actual_status，直接使用
  if (ticket.actual_status && ticket.actual_status_display) {
    return { 
      status: ticket.actual_status, 
      display: ticket.actual_status_display 
    }
  }
  
  // 兼容旧版本：前端判断
  if (isTicketExpired(ticket)) {
    return { status: 'expired', display: '已过期' }
  }
  return { status: ticket.status, display: ticket.status_display }
}

function MyTicketsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<ExtendedTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
        params.available = 'true'
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }
      
      const response = await api.shop.tickets.list(params)
      
      // 修复图片URL
      const fixedResults = response.results.map((ticket: ExtendedTicket) => {
        if (ticket.product_snapshot?.images) {
          ticket.product_snapshot.images = ticket.product_snapshot.images
            .map(fixImageUrl)
            .filter(Boolean) as string[]
        }
        return ticket
      })
      
      if (reset) {
        setTickets(fixedResults)
        setPage(1)
      } else {
        setTickets(prev => [...prev, ...fixedResults])
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

  // 初始加载 - 添加依赖数组
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // 筛选条件变化时重新加载 - 添加依赖数组注释
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadTickets(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, availableOnly, searchTerm, isAuthenticated])

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
  const handleTicketAction = (ticket: ExtendedTicket, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/shop/tdb/ticket?id=${ticket.id}`)
        break
      case 'pay':
        // 检查是否过期
        if (isTicketExpired(ticket)) {
          toast.error('提货单已过期，无法支付')
          return
        }
        router.push(`/shop/tdb/ticket?id=${ticket.id}`)
        break
      case 'cancel':
        handleCancelTicket(ticket)
        break
    }
  }

  // 取消提货单
  const handleCancelTicket = async (ticket: ExtendedTicket) => {
    if (isTicketExpired(ticket)) {
      toast.error('提货单已过期')
      return
    }
    
    if (!confirm('确定要取消该提货单吗？')) return
    
    try {
      const response = await api.shop.tickets.cancel(ticket.id)
      if (response.success) {
        toast.success('提货单已取消')
        loadTickets(true)
      }
    } catch (error) {
      toast.error('取消失败，请重试')
    }
  }

  // 复制文本
  const copyToClipboard = (text: string, itemName?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(itemName ? `${itemName}已复制` : '已复制到剪贴板')
    }).catch(() => {
      toast.error('复制失败，请手动复制')
    })
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

  // 统计各状态数量（考虑过期）
  const statusCounts = tickets.reduce((acc, ticket) => {
    const actualStatus = getActualStatus(ticket)
    acc[actualStatus.status] = (acc[actualStatus.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
            onClick={() => router.push('/shop/tdb')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回商城
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
          <p className="text-2xl font-bold text-green-500">
            {statusCounts.active || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">可使用</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">
            {statusCounts.pending || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">待支付</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {statusCounts.paid || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">待审核</p>
        </PixelCard>
        <PixelCard className="p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {totalCount}
          </p>
          <p className="text-sm text-gray-400 mt-1">总数</p>
        </PixelCard>
      </motion.div>

      {/* 筛选条件 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* 状态筛选 */}
          <div className="flex gap-2 flex-wrap flex-1">
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
          
          {/* 搜索框 */}
          <input
            type="text"
            placeholder="搜索提货单..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
          />
          
          {/* 只显示可用 */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">只显示可用</span>
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
            {statusFilter || availableOnly || searchTerm ? '没有找到相关提货单' : '暂无提货单'}
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
            {tickets.map((ticket, index) => {
              const actualStatus = getActualStatus(ticket)
              const isExpired = actualStatus.status === 'expired'
              
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <PixelCard className={cn(
                    "p-4 md:p-6 transition-all",
                    isExpired ? "opacity-60" : "hover:border-gold-500/50"
                  )}>
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* 商品信息 */}
                      <div className="flex gap-4 flex-1">
                        {/* 商品图片 */}
                        <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          {ticket.product_snapshot?.images?.[0] ? (
                            <img 
                              src={ticket.product_snapshot.images[0]}
                              alt={ticket.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const placeholder = document.createElement('div')
                                placeholder.className = 'w-full h-full flex items-center justify-center text-3xl opacity-20'
                                placeholder.textContent = '📦'
                                if (target.parentElement && !target.parentElement.querySelector('div')) {
                                  target.parentElement.appendChild(placeholder)
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">
                              📦
                            </div>
                          )}
                        </div>
                        
                        {/* 商品详情 */}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{ticket.product_name}</h3>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-gray-400">
                              单号：{ticket.id}
                            </p>
                            <button
                              onClick={() => copyToClipboard(ticket.id, '提货单号')}
                              className="text-xs text-gold-500 hover:text-gold-400"
                            >
                              复制
                            </button>
                          </div>
                          <p className="text-sm text-gray-400">
                            创建时间：{new Date(ticket.created_at).toLocaleString()}
                          </p>
                          {ticket.expire_at && actualStatus.status === 'pending' && (
                            <p className={cn(
                              "text-sm",
                              isExpired ? "text-red-500 font-bold" : "text-yellow-500"
                            )}>
                              {isExpired ? (
                                <>已过期 (过期时间: {new Date(ticket.expire_at.includes('T') ? ticket.expire_at : ticket.expire_at.replace(' ', 'T') + '+08:00').toLocaleString('zh-CN')})</>
                              ) : (
                                <>将于 {new Date(ticket.expire_at.includes('T') ? ticket.expire_at : ticket.expire_at.replace(' ', 'T') + '+08:00').toLocaleString('zh-CN')} 过期</>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* 状态和价值 */}
                      <div className="flex flex-col md:items-end gap-2">
                        <span className={cn("font-bold", getStatusColor(actualStatus.status))}>
                          {actualStatus.display}
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
                    
                    {/* 操作按钮 */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          {ticket.can_use && !isExpired && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                              可使用
                            </span>
                          )}
                          {ticket.tdb_credited && (
                            <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded">
                              TDB已到账
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                              已过期
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {actualStatus.status === 'pending' && !isExpired && (
                            <>
                              <PixelButton
                                size="sm"
                                variant="secondary"
                                onClick={() => handleTicketAction(ticket, 'cancel')}
                              >
                                取消
                              </PixelButton>
                              <PixelButton
                                size="sm"
                                onClick={() => handleTicketAction(ticket, 'pay')}
                              >
                                去支付
                              </PixelButton>
                            </>
                          )}
                          {actualStatus.status === 'active' && ticket.can_use && (
                            <PixelButton
                              size="sm"
                              onClick={() => handleTicketAction(ticket, 'view')}
                            >
                              使用
                            </PixelButton>
                          )}
                          {/* 只有非过期状态才显示详情按钮 */}
                          {(actualStatus.status === 'paid' || actualStatus.status === 'active' || actualStatus.status === 'used') && (
                            <PixelButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleTicketAction(ticket, 'view')}
                            >
                              详情
                            </PixelButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </PixelCard>
                </motion.div>
              )
            })}
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

// 使用动态导入和Suspense包装，避免SSR问题
export default function MyTicketsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <MyTicketsPage />
    </Suspense>
  )
}
