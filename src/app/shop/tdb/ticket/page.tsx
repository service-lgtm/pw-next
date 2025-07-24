// src/app/shop/tdb/ticket/page.tsx
// 提货单详情页面

'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Ticket, Address } from '@/lib/api'

// 提货单内容组件
function TicketContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [showExchangeForm, setShowExchangeForm] = useState(false)
  const [exchangeAmount, setExchangeAmount] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 新地址表单
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  })
  
  // 获取提货单ID
  const ticketId = searchParams.get('id')
  
  // 加载提货单详情
  const loadTicket = async () => {
    if (!ticketId) {
      toast.error('提货单信息无效')
      router.push('/shop/tdb')
      return
    }
    
    try {
      setLoading(true)
      const data = await api.shop.tickets.get(ticketId)
      setTicket(data)
      
      // 如果提货单可使用，加载地址列表
      if (data.status === 'active' && data.can_use) {
        await loadAddresses()
      }
    } catch (error) {
      console.error('加载提货单失败:', error)
      toast.error('加载提货单失败')
      router.push('/shop/tdb')
    } finally {
      setLoading(false)
    }
  }
  
  // 加载地址列表
  const loadAddresses = async () => {
    try {
      const response = await api.accounts.addresses.list()
      if (response.success && response.data) {
        setAddresses(response.data)
        
        // 设置默认地址
        const defaultAddr = response.data.find(addr => addr.is_default)
        if (defaultAddr) {
          setSelectedAddress(defaultAddr)
        }
      }
    } catch (error) {
      console.error('加载地址失败:', error)
    }
  }
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 加载提货单
  useEffect(() => {
    if (isAuthenticated) {
      loadTicket()
    }
  }, [isAuthenticated, ticketId])
  
  // 保存新地址
  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.detail) {
      toast.error('请填写完整的地址信息')
      return
    }
    
    try {
      const response = await api.accounts.addresses.create({
        name: newAddress.name,
        phone: newAddress.phone,
        province: newAddress.province || '',
        city: newAddress.city || '',
        district: newAddress.district || '',
        detail: newAddress.detail,
        postcode: newAddress.postcode,
        is_default: addresses.length === 0,
      })
      
      if (response.success && response.data) {
        await loadAddresses()
        setSelectedAddress(response.data)
        setShowAddressForm(false)
        setNewAddress({
          name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail: '',
        })
        toast.success('地址保存成功')
      }
    } catch (error) {
      toast.error('保存地址失败')
    }
  }
  
  // 提交支付凭证
  const handleSubmitPayment = async () => {
    if (!ticket || !transactionId && !paymentScreenshot) {
      toast.error('请提供交易流水号或支付截图')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      if (transactionId) {
        formData.append('transaction_id', transactionId)
      }
      if (paymentScreenshot) {
        formData.append('payment_screenshot', paymentScreenshot)
      }
      
      const response = await api.shop.tickets.pay(ticket.id, formData)
      
      if (response.success) {
        toast.success('支付信息已提交，等待审核')
        setShowPaymentForm(false)
        setTransactionId('')
        setPaymentScreenshot(null)
        await loadTicket()
      }
    } catch (error) {
      toast.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 申请提货
  const handlePickup = async () => {
    if (!ticket || !selectedAddress) {
      toast.error('请选择收货地址')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.shop.pickup.create({
        ticket_id: ticket.id,
        address_id: selectedAddress.id,
      })
      
      if (response.success) {
        toast.success('提货申请已提交')
        router.push('/shop/tdb/pickup')
      }
    } catch (error: any) {
      if (error.code === 'TICKET_NOT_AVAILABLE') {
        toast.error('提货单不可使用')
      } else {
        toast.error('提交失败，请重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 申请兑换
  const handleExchange = async () => {
    if (!ticket || !exchangeAmount) {
      toast.error('请输入兑换金额')
      return
    }
    
    const amount = parseFloat(exchangeAmount)
    const remainingValue = parseFloat(ticket.remaining_value)
    
    if (amount <= 0) {
      toast.error('兑换金额必须大于0')
      return
    }
    
    if (amount > remainingValue) {
      toast.error(`兑换金额不能超过剩余价值（¥${remainingValue}）`)
      return
    }
    
    // TODO: 需要选择收款方式
    toast.error('请先设置收款方式')
    router.push('/settings/payment-methods')
  }
  
  // 取消提货单
  const handleCancelTicket = async () => {
    if (!ticket || !confirm('确定要取消提货单吗？')) return
    
    try {
      const response = await api.shop.tickets.cancel(ticket.id)
      if (response.success) {
        toast.success('提货单已取消')
        router.push('/shop/tdb')
      }
    } catch (error) {
      toast.error('取消失败，请重试')
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
  
  if (!isAuthenticated || !ticket) {
    return null
  }
  
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付待审核',
      active: '有效',
      used: '已使用',
      cancelled: '已取消',
      expired: '已过期',
    }
    return statusMap[status] || status
  }
  
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
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          提货单详情
        </h1>
        <p className="text-gray-400 mt-1">
          单号：{ticket.id}
        </p>
      </motion.div>
      
      {/* 提货单状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">提货单状态</h3>
            <span className={cn("font-bold", getStatusColor(ticket.status))}>
              {ticket.status_display || getStatusText(ticket.status)}
            </span>
          </div>
          
          {/* 商品信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-4">
              {ticket.product_snapshot.images?.[0] && (
                <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={ticket.product_snapshot.images[0]} 
                    alt={ticket.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold">{ticket.product_name}</h4>
                <p className="text-gray-400">数量: {ticket.quantity}</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">单价</span>
                <span>¥{ticket.unit_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">总价</span>
                <span className="font-bold text-gold-500">¥{ticket.total_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">获得TDB</span>
                <span className="font-bold text-gold-500">{ticket.tdb_amount} TDB</span>
              </div>
              {ticket.status === 'active' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">提货单价值</span>
                    <span>¥{ticket.market_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">剩余价值</span>
                    <span className="font-bold text-green-500">¥{ticket.remaining_value}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">支付方式</span>
                <span>{ticket.payment_method_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">创建时间</span>
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              {ticket.expire_at && ticket.status === 'pending' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">过期时间</span>
                  <span className="text-yellow-500">
                    {new Date(ticket.expire_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* TDB到账状态 */}
          {ticket.tdb_credited && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-sm text-green-500">
                ✅ TDB积分已到账
              </p>
            </div>
          )}
        </PixelCard>
      </motion.div>
      
      {/* 支付信息 - 待支付状态 */}
      {ticket.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">支付信息</h3>
            
            {!showPaymentForm ? (
              <div className="text-center">
                <p className="text-gray-400 mb-4">请完成支付后提交支付凭证</p>
                <PixelButton onClick={() => setShowPaymentForm(true)}>
                  提交支付凭证
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">交易流水号</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="请输入支付平台的交易流水号"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">支付截图</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('图片大小不能超过5MB')
                          return
                        }
                        setPaymentScreenshot(file)
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded hover:border-gray-600 text-left"
                  >
                    {paymentScreenshot ? paymentScreenshot.name : '点击上传支付截图'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    支持 JPG、PNG 格式，最大 5MB
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <PixelButton
                    variant="secondary"
                    onClick={() => {
                      setShowPaymentForm(false)
                      setTransactionId('')
                      setPaymentScreenshot(null)
                    }}
                    disabled={isSubmitting}
                  >
                    取消
                  </PixelButton>
                  <PixelButton
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting || (!transactionId && !paymentScreenshot)}
                  >
                    {isSubmitting ? '提交中...' : '提交凭证'}
                  </PixelButton>
                </div>
              </div>
            )}
          </PixelCard>
        </motion.div>
      )}
      
      {/* 使用选项 - 有效状态 */}
      {ticket.status === 'active' && ticket.can_use && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">使用提货单</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <PixelCard className="p-4 hover:border-gold-500 transition-all cursor-pointer"
                onClick={() => {/* 显示提货表单 */}}>
                <div className="text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <h4 className="font-bold mb-1">申请提货</h4>
                  <p className="text-sm text-gray-400">提取实物商品</p>
                </div>
              </PixelCard>
              
              <PixelCard className="p-4 hover:border-gold-500 transition-all cursor-pointer"
                onClick={() => setShowExchangeForm(true)}>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold mb-1">兑换现金</h4>
                  <p className="text-sm text-gray-400">剩余价值：¥{ticket.remaining_value}</p>
                </div>
              </PixelCard>
            </div>
          </PixelCard>
          
          {/* 提货地址选择 */}
          <PixelCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">选择收货地址</h3>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-sm text-gold-500 hover:text-gold-400"
              >
                + 新增地址
              </button>
            </div>
            
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>暂无收货地址</p>
                <PixelButton
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddressForm(true)}
                >
                  添加地址
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all",
                      selectedAddress?.id === addr.id
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold">{addr.name}</span>
                          <span className="text-sm text-gray-400">{addr.phone}</span>
                          {addr.is_default && (
                            <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-500 rounded">
                              默认
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">
                          {addr.full_address || `${addr.province} ${addr.city} ${addr.district} ${addr.detail}`}
                        </p>
                      </div>
                      <input
                        type="radio"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => {}}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PixelCard>
        </motion.div>
      )}
      
      {/* 提示信息 */}
      {ticket.status === 'paid' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-6 bg-yellow-500/10 border-yellow-500/30">
            <h3 className="text-lg font-bold mb-3 text-yellow-500">温馨提示</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 提货单正在审核中，预计1-2小时完成</li>
              <li>• 审核通过后TDB积分立即到账</li>
              <li>• 您可以选择提取实物或兑换现金</li>
              <li>• 如有问题请联系在线客服</li>
            </ul>
          </PixelCard>
        </motion.div>
      )}
      
      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        {ticket.status === 'pending' && (
          <>
            <PixelButton
              variant="secondary"
              onClick={handleCancelTicket}
            >
              取消提货单
            </PixelButton>
            <PixelButton onClick={() => router.push(`/shop/tdb/payment?productId=${ticket.product}`)}>
              查看支付信息
            </PixelButton>
          </>
        )}
        {ticket.status === 'active' && ticket.can_use && (
          <PixelButton
            onClick={handlePickup}
            disabled={!selectedAddress || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '确认提货'}
          </PixelButton>
        )}
        {ticket.status === 'used' && (
          <PixelButton onClick={() => router.push('/shop/tdb')}>
            继续购买
          </PixelButton>
        )}
      </motion.div>
      
      {/* 新增地址弹窗 */}
      {showAddressForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddressForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A1628] border-4 border-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">新增收货地址</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">收货人</label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入收货人姓名"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">手机号</label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入手机号"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm text-gray-400">省份</label>
                  <input
                    type="text"
                    value={newAddress.province}
                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="省"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">城市</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="市"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">区县</label>
                  <input
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                    placeholder="区"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">详细地址</label>
                <textarea
                  value={newAddress.detail}
                  onChange={(e) => setNewAddress({ ...newAddress, detail: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  rows={3}
                  placeholder="请输入详细地址"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAddressForm(false)}
              >
                取消
              </PixelButton>
              <PixelButton
                className="flex-1"
                onClick={handleSaveAddress}
              >
                保存
              </PixelButton>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* 兑换金额弹窗 */}
      {showExchangeForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowExchangeForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A1628] border-4 border-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">兑换现金</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">剩余价值</label>
                <p className="text-2xl font-bold text-green-500">¥{ticket.remaining_value}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">兑换金额</label>
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded focus:border-gold-500 outline-none"
                  placeholder="请输入兑换金额"
                  min="0.01"
                  max={ticket.remaining_value}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  最小兑换金额 0.01 元
                </p>
              </div>
              
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-sm text-yellow-500">
                  提示：支持部分兑换，剩余价值可继续使用
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowExchangeForm(false)
                  setExchangeAmount('')
                }}
              >
                取消
              </PixelButton>
              <PixelButton
                className="flex-1"
                onClick={handleExchange}
                disabled={!exchangeAmount || parseFloat(exchangeAmount) <= 0}
              >
                确认兑换
              </PixelButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// 主页面组件
export default function TicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <TicketContent />
    </Suspense>
  )
}
