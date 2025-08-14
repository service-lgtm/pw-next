// src/app/shop/tdb/ticket/page.tsx
// 提货单详情页面 - 完整版本
// 包含支付、查看详情、使用提货单等功能

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Ticket } from '@/lib/api'

// 扩展 Ticket 类型，添加后端返回的新字段
interface ExtendedTicket extends Ticket {
  is_expired?: boolean
  actual_status?: string
  actual_status_display?: string
}

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
  
  // 处理时间格式
  let expireTimeStr = ticket.expire_at
  if (!expireTimeStr.includes('T')) {
    expireTimeStr = expireTimeStr.replace(' ', 'T') + '+08:00'
  }
  
  const expireTime = new Date(expireTimeStr).getTime()
  const now = new Date().getTime()
  return now > expireTime
}

/**
 * 获取实际显示状态
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

export default function TicketDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('id')
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [ticket, setTicket] = useState<ExtendedTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tdb/ticket?id=' + ticketId)
    }
  }, [authLoading, isAuthenticated, router, ticketId])

  // 加载提货单详情
  const loadTicketDetail = async () => {
    if (!ticketId) {
      toast.error('提货单ID无效')
      router.push('/shop/tickets')
      return
    }

    setLoading(true)
    try {
      const data = await api.shop.tickets.detail(ticketId)
      
      // 修复图片URL
      if (data.product_snapshot?.images) {
        data.product_snapshot.images = data.product_snapshot.images
          .map(fixImageUrl)
          .filter(Boolean) as string[]
      }
      
      // 修复支付截图URL
      if (data.payment_screenshot_url) {
        data.payment_screenshot_url = fixImageUrl(data.payment_screenshot_url)
      }
      
      // 修复支付二维码URL
      if (data.payment_account_info?.qr_code) {
        data.payment_account_info.qr_code = fixImageUrl(data.payment_account_info.qr_code)
      }
      
      setTicket(data)
      
      // 如果是待支付状态，自动显示支付表单
      const actualStatus = getActualStatus(data)
      if (actualStatus.status === 'pending' && !isTicketExpired(data)) {
        setShowPaymentForm(true)
      }
      
    } catch (error) {
      console.error('加载提货单详情失败:', error)
      toast.error('加载提货单详情失败')
      router.push('/shop/tickets')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (isAuthenticated && ticketId) {
      loadTicketDetail()
    }
  }, [isAuthenticated, ticketId])

  // 提交支付信息
  const handleSubmitPayment = async () => {
    if (!ticket) return
    
    if (!transactionId && !paymentFile) {
      toast.error('请填写交易流水号或上传支付截图')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      if (transactionId) {
        formData.append('transaction_id', transactionId)
      }
      if (paymentFile) {
        formData.append('payment_screenshot', paymentFile)
      }

      const response = await api.shop.tickets.pay(ticket.id, formData)
      if (response.success) {
        toast.success('支付信息已提交，等待审核')
        loadTicketDetail() // 重新加载详情
      }
    } catch (error) {
      console.error('提交支付信息失败:', error)
      toast.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 取消提货单
  const handleCancelTicket = async () => {
    if (!ticket) return
    
    if (!confirm('确定要取消该提货单吗？')) return
    
    try {
      const response = await api.shop.tickets.cancel(ticket.id)
      if (response.success) {
        toast.success('提货单已取消')
        router.push('/shop/tickets')
      }
    } catch (error) {
      toast.error('取消失败，请重试')
    }
  }

  // 申请提货
  const handlePickupRequest = () => {
    if (!ticket) return
    toast.info('请到个人中心选择收货地址后申请提货')
    router.push('/user/addresses')
  }

  // 申请兑换
  const handleExchangeRequest = () => {
    if (!ticket) return
    toast.info('请到个人中心设置收款方式后申请兑换')
    router.push('/user/payment-methods')
  }

  // 复制文本
  const copyToClipboard = (text: string, itemName?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(itemName ? `${itemName}已复制` : '已复制到剪贴板')
    }).catch(() => {
      toast.error('复制失败，请手动复制')
    })
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

  if (!ticket) {
    return null
  }

  const actualStatus = getActualStatus(ticket)
  const isExpired = actualStatus.status === 'expired'
  const images = ticket.product_snapshot?.images || []

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/shop/tickets')}
            className="text-gray-400 hover:text-white"
          >
            ← 返回提货单列表
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          提货单详情
        </h1>
      </motion.div>

      {/* 提货单信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6">
          {/* 状态和单号 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">提货单号</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg">{ticket.id}</p>
                <button
                  onClick={() => copyToClipboard(ticket.id, '提货单号')}
                  className="text-sm text-gold-500 hover:text-gold-400"
                >
                  复制
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">状态</p>
              <p className={cn("font-bold text-lg", getStatusColor(actualStatus.status))}>
                {actualStatus.display}
              </p>
            </div>
          </div>

          {/* 商品信息 */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="font-bold text-lg mb-4">商品信息</h3>
            <div className="flex gap-6">
              {/* 商品图片 */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gray-800 rounded overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={ticket.product_name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        if (images.length > 1) {
                          setCurrentImageIndex((prev) => (prev + 1) % images.length)
                        }
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const placeholder = document.createElement('div')
                        placeholder.className = 'w-full h-full flex items-center justify-center text-5xl opacity-20'
                        placeholder.textContent = '📦'
                        if (target.parentElement && !target.parentElement.querySelector('div')) {
                          target.parentElement.appendChild(placeholder)
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                      📦
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          index === currentImageIndex ? "bg-gold-500" : "bg-gray-600"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 商品详情 */}
              <div className="flex-1">
                <h4 className="font-bold text-xl mb-2">{ticket.product_name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">单价</span>
                    <span>¥{ticket.unit_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">数量</span>
                    <span>{ticket.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">总价</span>
                    <span className="font-bold text-lg text-gold-500">¥{ticket.total_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">市场价值</span>
                    <span>¥{ticket.market_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">TDB奖励</span>
                    <span className="text-gold-500">{ticket.tdb_amount} TDB</span>
                  </div>
                  {ticket.status === 'active' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">剩余价值</span>
                      <span className="text-green-500">¥{ticket.remaining_value}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="font-bold text-lg mb-4">时间信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">创建时间</span>
                <span>{new Date(ticket.created_at).toLocaleString('zh-CN')}</span>
              </div>
              {ticket.expire_at && actualStatus.status === 'pending' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">过期时间</span>
                  <span className={isExpired ? "text-red-500 font-bold" : "text-yellow-500"}>
                    {new Date(ticket.expire_at.includes('T') ? ticket.expire_at : ticket.expire_at.replace(' ', 'T') + '+08:00').toLocaleString('zh-CN')}
                    {isExpired && " (已过期)"}
                  </span>
                </div>
              )}
              {ticket.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">支付时间</span>
                  <span>{new Date(ticket.paid_at).toLocaleString('zh-CN')}</span>
                </div>
              )}
              {ticket.confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">确认时间</span>
                  <span>{new Date(ticket.confirmed_at).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 支付信息（待支付状态显示） */}
          {actualStatus.status === 'pending' && !isExpired && showPaymentForm && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <h3 className="font-bold text-lg mb-4">支付信息</h3>
              
              {/* 收款账户信息 */}
              {ticket.payment_account_info && (
                <div className="bg-gray-800 rounded p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">收款账户</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">支付方式</span>
                      <span>{ticket.payment_method_display}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">账户名称</span>
                      <div className="flex items-center gap-2">
                        <span>{ticket.payment_account_info.account_name}</span>
                        <button
                          onClick={() => copyToClipboard(ticket.payment_account_info.account_name, '账户名称')}
                          className="text-xs text-gold-500 hover:text-gold-400"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">账号</span>
                      <div className="flex items-center gap-2">
                        <span>{ticket.payment_account_info.account}</span>
                        <button
                          onClick={() => copyToClipboard(ticket.payment_account_info.account, '账号')}
                          className="text-xs text-gold-500 hover:text-gold-400"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    {ticket.payment_method === 'bank' && ticket.payment_account_info.bank && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">开户行</span>
                          <span>{ticket.payment_account_info.bank}</span>
                        </div>
                        {ticket.payment_account_info.branch && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">支行</span>
                            <span>{ticket.payment_account_info.branch}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* 收款二维码 */}
                  {ticket.payment_account_info.qr_code && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">收款二维码</p>
                      <img
                        src={ticket.payment_account_info.qr_code}
                        alt="收款二维码"
                        className="w-48 h-48 bg-white p-2 rounded"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 支付表单 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    交易流水号 <span className="text-gray-600">(选填)</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="请输入交易流水号"
                    className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    支付截图 <span className="text-gray-600">(选填)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    请上传支付成功的截图，支持 JPG/PNG 格式
                  </p>
                </div>

                <div className="flex gap-4">
                  <PixelButton
                    onClick={handleSubmitPayment}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? '提交中...' : '确认已支付'}
                  </PixelButton>
                  <PixelButton
                    variant="secondary"
                    onClick={handleCancelTicket}
                    disabled={submitting}
                  >
                    取消订单
                  </PixelButton>
                </div>
              </div>
            </div>
          )}

          {/* 已支付待审核状态 */}
          {actualStatus.status === 'paid' && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
                <p className="text-blue-500 font-bold mb-2">支付信息已提交</p>
                <p className="text-sm text-gray-400">
                  您的支付信息正在审核中，请耐心等待。审核通过后，您将收到TDB奖励并可以使用提货单。
                </p>
                {ticket.transaction_id && (
                  <p className="text-sm text-gray-400 mt-2">
                    交易流水号：{ticket.transaction_id}
                  </p>
                )}
                {ticket.payment_screenshot_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">支付截图：</p>
                    <img
                      src={ticket.payment_screenshot_url}
                      alt="支付截图"
                      className="max-w-xs rounded"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 可使用状态 */}
          {actualStatus.status === 'active' && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-4">
                <p className="text-green-500 font-bold mb-2">提货单可使用</p>
                <p className="text-sm text-gray-400">
                  您的提货单已激活，可以申请提货或兑换现金。
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  剩余价值：<span className="text-green-500 font-bold">¥{ticket.remaining_value}</span>
                </p>
                {ticket.tdb_credited && (
                  <p className="text-sm text-gold-500 mt-2">
                    TDB奖励已到账：{ticket.tdb_amount} TDB
                  </p>
                )}
              </div>
              
              <div className="flex gap-4">
                <PixelButton
                  onClick={handlePickupRequest}
                  className="flex-1"
                >
                  申请提货
                </PixelButton>
                <PixelButton
                  onClick={handleExchangeRequest}
                  variant="secondary"
                  className="flex-1"
                >
                  兑换现金
                </PixelButton>
              </div>
            </div>
          )}

          {/* 已使用状态 */}
          {actualStatus.status === 'used' && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="bg-gray-500/10 border border-gray-500/30 rounded p-4">
                <p className="text-gray-400 font-bold mb-2">提货单已使用</p>
                <p className="text-sm text-gray-400">
                  该提货单已完成使用，感谢您的购买。
                </p>
                {ticket.pickup_requests && ticket.pickup_requests.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">提货记录：</p>
                    {ticket.pickup_requests.map((req: any) => (
                      <div key={req.id} className="text-sm text-gray-500">
                        {req.id} - {req.status} - {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                )}
                {ticket.exchange_requests && ticket.exchange_requests.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">兑换记录：</p>
                    {ticket.exchange_requests.map((req: any) => (
                      <div key={req.id} className="text-sm text-gray-500">
                        {req.id} - ¥{req.amount} - {req.status} - {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 已取消状态 */}
          {actualStatus.status === 'cancelled' && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="bg-gray-500/10 border border-gray-500/30 rounded p-4">
                <p className="text-gray-400 font-bold mb-2">提货单已取消</p>
                <p className="text-sm text-gray-400">
                  该提货单已被取消，如需购买请重新下单。
                </p>
              </div>
            </div>
          )}

          {/* 已过期状态 */}
          {isExpired && (
            <div className="border-t border-gray-700 pt-6 mt-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <p className="text-red-500 font-bold mb-2">提货单已过期</p>
                <p className="text-sm text-gray-400">
                  该提货单已超过支付时限，无法继续支付。如需购买请重新下单。
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  过期时间：{new Date(ticket.expire_at!.includes('T') ? ticket.expire_at! : ticket.expire_at!.replace(' ', 'T') + '+08:00').toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}
        </PixelCard>
      </motion.div>

      {/* 底部操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <PixelButton
          variant="secondary"
          onClick={() => router.push('/shop/tickets')}
          className="w-full"
        >
          返回提货单列表
        </PixelButton>
      </motion.div>
    </div>
  )
}
