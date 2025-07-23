// src/app/shop/tdb/payment/page.tsx
// 支付页面

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { ProductDetail, PaymentMethodInfo } from '@/lib/api'

// 支付页面内容组件
function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [countdown, setCountdown] = useState(30 * 60) // 30分钟倒计时
  const [quantity, setQuantity] = useState(1)
  
  // 获取商品ID
  const productId = searchParams.get('productId')
  
  // 加载商品信息
  useEffect(() => {
    if (!productId) {
      toast.error('商品信息无效')
      router.push('/shop/tdb')
      return
    }
    
    const loadProduct = async () => {
      try {
        setLoading(true)
        const data = await api.shop.products.get(productId)
        setProduct(data)
        
        // 设置默认支付方式
        const enabledMethods = data.payment_methods.filter(m => m.is_enabled)
        if (enabledMethods.length > 0) {
          setSelectedMethod(enabledMethods[0].method)
        }
      } catch (error) {
        console.error('加载商品失败:', error)
        toast.error('加载商品信息失败')
        router.push('/shop/tdb')
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [productId, router])
  
  // 倒计时
  useEffect(() => {
    if (!orderInfo) return
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          toast.error('订单已超时，请重新下单')
          router.push('/shop/tdb')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [orderInfo, router])
  
  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  // 复制文本
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已复制到剪贴板')
    }).catch(() => {
      toast.error('复制失败，请手动复制')
    })
  }, [])
  
  // 创建订单
  const handleCreateOrder = async () => {
    if (!product || !selectedMethod) return
    
    // 检查库存
    if (product.stock < quantity) {
      toast.error('库存不足')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.shop.orders.create({
        product_id: product.id,
        quantity: quantity,
        payment_method: selectedMethod as 'alipay' | 'bank' | 'wechat',
      })
      
      if (response.success && response.data) {
        setOrderInfo(response.data)
        toast.success('订单创建成功，请尽快支付')
      } else {
        throw new Error(response.message || '创建订单失败')
      }
    } catch (error: any) {
      console.error('创建订单失败:', error)
      
      if (error.code === 'PAYMENT_METHOD_NOT_SUPPORTED') {
        toast.error('该商品不支持所选支付方式')
      } else if (error.message?.includes('库存')) {
        toast.error('商品库存不足')
      } else {
        toast.error(error.message || '创建订单失败，请重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 提交支付确认
  const handleSubmitPayment = async () => {
    if (!orderInfo) return
    
    setIsSubmitting(true)
    
    try {
      // 跳转到订单页面，让用户上传支付凭证
      router.push(`/shop/tdb/order?id=${orderInfo.order_id}`)
    } catch (error) {
      toast.error('操作失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tdb')
    }
  }, [authLoading, isAuthenticated, router])
  
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
  
  if (!isAuthenticated || !product) {
    return null
  }
  
  const enabledPaymentMethods = product.payment_methods.filter(m => m.is_enabled)
  const currentPaymentMethod = enabledPaymentMethods.find(m => m.method === selectedMethod)
  const finalPrice = product.final_price ? parseFloat(product.final_price) : parseFloat(product.price)
  const totalPrice = finalPrice * quantity
  const totalTdb = parseFloat(product.tdb_amount) * quantity
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          {orderInfo ? '支付订单' : '确认订单'}
        </h1>
        {orderInfo && (
          <p className="text-gray-400 mt-1">
            请在 <span className="text-gold-500 font-bold">{formatCountdown(countdown)}</span> 内完成支付
          </p>
        )}
      </motion.div>
      
      {/* 商品信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">商品信息</h3>
          <div className="flex gap-4">
            {product.images && product.images.length > 0 && (
              <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
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
            <div className="flex-1 space-y-2">
              <h4 className="font-bold">{product.name}</h4>
              <p className="text-sm text-gray-400">{product.category}</p>
              {!orderInfo && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">数量：</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">库存: {product.stock}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">单价</span>
              <span>¥{finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">数量</span>
              <span>{orderInfo ? orderInfo.quantity || quantity : quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">获得TDB</span>
              <span className="font-bold text-gold-500">
                {orderInfo ? orderInfo.tdb_amount : totalTdb.toLocaleString()} TDB
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>应付金额</span>
              <span className="text-gold-500">
                ¥{orderInfo ? orderInfo.total_price : totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {!orderInfo ? (
        <>
          {/* 支付方式选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelCard className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">选择支付方式</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {enabledPaymentMethods.map((method) => (
                  <button
                    key={method.method}
                    onClick={() => setSelectedMethod(method.method)}
                    className={cn(
                      "p-4 border-2 rounded-lg transition-all",
                      selectedMethod === method.method
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="text-3xl mb-2">
                      {method.method === 'alipay' && '💙'}
                      {method.method === 'bank' && '🏦'}
                      {method.method === 'wechat' && '💚'}
                    </div>
                    <p className="font-bold">
                      {method.method === 'alipay' && '支付宝'}
                      {method.method === 'bank' && '银行转账'}
                      {method.method === 'wechat' && '微信支付'}
                    </p>
                  </button>
                ))}
              </div>
              
              {enabledPaymentMethods.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  该商品暂无可用支付方式
                </p>
              )}
            </PixelCard>
          </motion.div>
          
          {/* 创建订单按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <PixelButton
              variant="secondary"
              onClick={() => router.push('/shop/tdb')}
            >
              返回商城
            </PixelButton>
            <PixelButton
              onClick={handleCreateOrder}
              disabled={!selectedMethod || isSubmitting || enabledPaymentMethods.length === 0}
            >
              {isSubmitting ? '创建中...' : '创建订单'}
            </PixelButton>
          </motion.div>
        </>
      ) : (
        <>
          {/* 支付信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelCard className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">支付信息</h3>
              
              {orderInfo.payment_account && (
                <>
                  {orderInfo.payment_account.method === 'bank' ? (
                    <div className="space-y-4">
                      {orderInfo.payment_account.bank && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">开户银行</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{orderInfo.payment_account.bank}</p>
                            <button
                              onClick={() => copyToClipboard(orderInfo.payment_account.bank)}
                              className="text-sm text-gold-500 hover:text-gold-400"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                      )}
                      {orderInfo.payment_account.branch && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">开户支行</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{orderInfo.payment_account.branch}</p>
                            <button
                              onClick={() => copyToClipboard(orderInfo.payment_account.branch)}
                              className="text-sm text-gold-500 hover:text-gold-400"
                            >
                              复制
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">账号</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold font-mono">{orderInfo.payment_account.account}</p>
                          <button
                            onClick={() => copyToClipboard(orderInfo.payment_account.account.replace(/\s/g, ''))}
                            className="text-sm text-gold-500 hover:text-gold-400"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">户名</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{orderInfo.payment_account.account_name}</p>
                          <button
                            onClick={() => copyToClipboard(orderInfo.payment_account.account_name)}
                            className="text-sm text-gold-500 hover:text-gold-400"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {orderInfo.payment_account.qr_code ? (
                        <img 
                          src={orderInfo.payment_account.qr_code} 
                          alt="支付二维码"
                          className="w-48 h-48 mx-auto mb-4"
                        />
                      ) : (
                        <div className="w-48 h-48 mx-auto bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                          <p className="text-gray-500">二维码加载中...</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-bold">{orderInfo.payment_account.account}</p>
                          <button
                            onClick={() => copyToClipboard(orderInfo.payment_account.account)}
                            className="text-sm text-gold-500 hover:text-gold-400"
                          >
                            复制
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">{orderInfo.payment_account.account_name}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-sm text-yellow-500">
                  <span className="font-bold">重要提示：</span>
                  转账时请务必备注订单号 <span className="font-mono">{orderInfo.order_id}</span>
                </p>
              </div>
            </PixelCard>
          </motion.div>
          
          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <PixelButton
              variant="secondary"
              onClick={() => router.push('/shop/tdb')}
            >
              稍后支付
            </PixelButton>
            <PixelButton
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? '跳转中...' : '我已支付'}
            </PixelButton>
          </motion.div>
        </>
      )}
    </div>
  )
}

// 主页面组件
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
