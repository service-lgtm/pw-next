// src/app/shop/tdb/order/page.tsx
// 订单确认页面

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
import type { Order, Address } from '@/lib/api'

// 订单内容组件
function OrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
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
  
  // 获取订单ID
  const orderId = searchParams.get('id')
  
  // 加载订单详情
  const loadOrder = async () => {
    if (!orderId) {
      toast.error('订单信息无效')
      router.push('/shop/tdb')
      return
    }
    
    try {
      setLoading(true)
      const data = await api.shop.orders.get(orderId)
      setOrder(data)
      
      // 如果订单需要填写地址，加载地址列表
      if (data.status === 'confirmed' || data.can_operations.can_set_address) {
        await loadAddresses()
      }
    } catch (error) {
      console.error('加载订单失败:', error)
      toast.error('加载订单失败')
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
  
  // 加载订单
  useEffect(() => {
    if (isAuthenticated) {
      loadOrder()
    }
  }, [isAuthenticated, orderId])
  
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
    if (!order || !transactionId && !paymentScreenshot) {
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
      
      const response = await api.shop.orders.pay(order.id, formData)
      
      if (response.success) {
        toast.success('支付信息已提交，等待审核')
        setShowPaymentForm(false)
        setTransactionId('')
        setPaymentScreenshot(null)
        await loadOrder()
      }
    } catch (error) {
      toast.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 提交订单地址
  const handleSubmitAddress = async () => {
    if (!order || !selectedAddress) {
      toast.error('请选择收货地址')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.shop.orders.setAddress(order.id, selectedAddress.id)
      
      if (response.success) {
        toast.success('地址设置成功，TDB已到账')
        await loadOrder()
      }
    } catch (error) {
      toast.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 取消订单
  const handleCancelOrder = async () => {
    if (!order || !confirm('确定要取消订单吗？')) return
    
    try {
      const response = await api.shop.orders.cancel(order.id)
      if (response.success) {
        toast.success('订单已取消')
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
  
  if (!isAuthenticated || !order) {
    return null
  }
  
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      confirmed: '待填写地址',
      processing: '处理中',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
      failed: '支付失败',
    }
    return statusMap[status] || status
  }
  
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
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          订单详情
        </h1>
        <p className="text-gray-400 mt-1">
          订单号：{order.id}
        </p>
      </motion.div>
      
      {/* 订单状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">订单状态</h3>
            <span className={cn("font-bold", getStatusColor(order.status))}>
              {order.status_display || getStatusText(order.status)}
            </span>
          </div>
          
          {/* 商品信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-4">
              {order.product_snapshot.images?.[0] && (
                <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={order.product_snapshot.images[0]} 
                    alt={order.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold">{order.product_name}</h4>
                <p className="text-gray-400">数量: {order.quantity}</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">单价</span>
                <span>¥{order.unit_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">总价</span>
                <span className="font-bold text-gold-500">¥{order.total_price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">获得TDB</span>
                <span className="font-bold text-gold-500">{order.tdb_amount} TDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">支付方式</span>
                <span>{order.payment_method_display}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">下单时间</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
              {order.expire_at && order.status === 'pending' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">过期时间</span>
                  <span className="text-yellow-500">
                    {new Date(order.expire_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 支付信息 - 待支付状态 */}
      {order.status === 'pending' && order.can_operations.can_pay && (
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
      
      {/* 收货地址 - 已确认状态 */}
      {order.status === 'confirmed' && order.can_operations.can_set_address && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">收货地址</h3>
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
      
      {/* 已设置的收货地址 */}
      {order.shipping_address && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PixelCard className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">收货信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">收货人：</span>
                <span>{order.shipping_address.name}</span>
                <span className="ml-4 text-gray-400">电话：</span>
                <span>{order.shipping_address.phone}</span>
              </div>
              <div>
                <span className="text-gray-400">地址：</span>
                <span>{order.shipping_address_detail || order.shipping_address.full_address}</span>
              </div>
              {order.tracking_number && (
                <div>
                  <span className="text-gray-400">物流单号：</span>
                  <span className="font-mono">{order.tracking_number}</span>
                  <button
                    onClick={() => copyToClipboard(order.tracking_number!)}
                    className="ml-2 text-xs text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
              )}
              {order.shipping_company && (
                <div>
                  <span className="text-gray-400">物流公司：</span>
                  <span>{order.shipping_company}</span>
                </div>
              )}
            </div>
          </PixelCard>
        </motion.div>
      )}
      
      {/* 订单说明 */}
      {order.status === 'paid' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-6 bg-yellow-500/10 border-yellow-500/30">
            <h3 className="text-lg font-bold mb-3 text-yellow-500">温馨提示</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 订单正在审核中，预计1-2小时完成</li>
              <li>• 审核通过后需要填写收货地址</li>
              <li>• TDB将在确认地址后立即到账</li>
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
        {order.can_operations.can_cancel && (
          <PixelButton
            variant="secondary"
            onClick={handleCancelOrder}
          >
            取消订单
          </PixelButton>
        )}
        {order.can_operations.can_set_address && (
          <PixelButton
            onClick={handleSubmitAddress}
            disabled={!selectedAddress || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '确认地址'}
          </PixelButton>
        )}
        {order.status === 'completed' && (
          <PixelButton onClick={() => router.push('/assets')}>
            查看资产
          </PixelButton>
        )}
        {order.status === 'pending' && !showPaymentForm && (
          <PixelButton onClick={() => router.push(`/shop/tdb/payment?productId=${order.product}`)}>
            查看支付信息
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
    </div>
  )
}

// 复制到剪贴板
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('已复制到剪贴板')
  }).catch(() => {
    toast.error('复制失败，请手动复制')
  })
}

// 主页面组件
export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <OrderContent />
    </Suspense>
  )
}
