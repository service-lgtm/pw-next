// src/app/shop/tdb/order/page.tsx
// 订单确认页面

'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// 订单状态
type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed'

// 地址类型
interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
}

// 模拟的订单数据
const mockOrder = {
  id: 'ORDER-2024-001',
  productName: '标准套餐',
  amount: 1000,
  price: 960,
  status: 'pending' as OrderStatus,
  createTime: new Date().toISOString(),
  paymentMethod: 'alipay',
}

// 模拟的地址数据（实际应从后端获取）
const mockAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '建国路88号SOHO现代城A座1801',
    isDefault: true,
  },
]

// 订单内容组件
function OrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [order, setOrder] = useState(mockOrder)
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  // 模拟订单状态更新
  useEffect(() => {
    // 模拟3秒后订单审核通过
    const timer = setTimeout(() => {
      setOrder(prev => ({ ...prev, status: 'processing' }))
      toast.success('订单审核通过，请填写收货地址')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 设置默认地址
  useEffect(() => {
    const defaultAddr = addresses.find(addr => addr.isDefault)
    if (defaultAddr) {
      setSelectedAddress(defaultAddr)
    }
  }, [addresses])
  
  // 保存新地址
  const handleSaveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.detail) {
      toast.error('请填写完整的地址信息')
      return
    }
    
    // TODO: 调用API保存地址
    const addr: Address = {
      id: Date.now().toString(),
      ...newAddress as Address,
      isDefault: addresses.length === 0,
    }
    
    setAddresses([...addresses, addr])
    setSelectedAddress(addr)
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
  
  // 提交订单地址
  const handleSubmitAddress = async () => {
    if (!selectedAddress) {
      toast.error('请选择收货地址')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // TODO: 调用API提交地址
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrder(prev => ({ ...prev, status: 'completed' }))
      toast.success('订单完成，TDB已到账')
      
      // 跳转到资产页面
      setTimeout(() => {
        router.push('/assets')
      }, 2000)
    } catch (error) {
      toast.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
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
  
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '等待审核'
      case 'processing': return '审核通过'
      case 'completed': return '已完成'
      case 'failed': return '审核失败'
    }
  }
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-500'
      case 'processing': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
    }
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
              {getStatusText(order.status)}
            </span>
          </div>
          
          {/* 状态进度条 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 to-yellow-500"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: order.status === 'pending' ? '33%' 
                         : order.status === 'processing' ? '66%' 
                         : '100%' 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>提交订单</span>
                <span>审核中</span>
                <span>填写地址</span>
                <span>完成</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">商品</span>
              <span>{order.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">数量</span>
              <span>{order.amount} TDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">金额</span>
              <span className="font-bold text-gold-500">¥{order.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">下单时间</span>
              <span>{new Date(order.createTime).toLocaleString()}</span>
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 收货地址 - 仅在审核通过后显示 */}
      {order.status === 'processing' && (
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
                          {addr.isDefault && (
                            <span className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-500 rounded">
                              默认
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">
                          {addr.province} {addr.city} {addr.district} {addr.detail}
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
      
      {/* 订单说明 */}
      {order.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PixelCard className="p-6 bg-yellow-500/10 border-yellow-500/30">
            <h3 className="text-lg font-bold mb-3 text-yellow-500">温馨提示</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• 订单正在审核中，预计1-5分钟完成</li>
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
        {order.status === 'processing' && (
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
