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

// 支付方式类型
type PaymentMethod = 'alipay' | 'bank' | 'wechat'

// 支付信息类型
interface PaymentInfo {
  method: PaymentMethod
  account: string
  accountName: string
  qrCode?: string
  bank?: string
  branch?: string
}

// 模拟的支付信息（实际应从后端获取）
const paymentAccounts: Record<PaymentMethod, PaymentInfo> = {
  alipay: {
    method: 'alipay',
    account: 'parallel_world@alipay.com',
    accountName: '平行世界科技有限公司',
    qrCode: '/images/alipay-qr.png', // 实际应该是真实的二维码
  },
  bank: {
    method: 'bank',
    account: '6222 0234 5678 9012 345',
    accountName: '平行世界科技有限公司',
    bank: '中国工商银行',
    branch: '北京市朝阳支行',
  },
  wechat: {
    method: 'wechat',
    account: 'parallel_world_pay',
    accountName: '平行世界科技',
    qrCode: '/images/wechat-qr.png',
  },
}

// TDB套餐数据（与商品页面一致）
const tdbPackages: Record<string, any> = {
  starter: { name: '新手套餐', amount: 100, price: 100 },
  basic: { name: '基础套餐', amount: 500, price: 490 },
  standard: { name: '标准套餐', amount: 1000, price: 960 },
  premium: { name: '进阶套餐', amount: 5000, price: 4700, bonus: 100 },
  pro: { name: '专业套餐', amount: 10000, price: 9200, bonus: 300 },
  vip: { name: 'VIP套餐', amount: 50000, price: 45000, bonus: 2000 },
}

// 支付页面内容组件
function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('alipay')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [countdown, setCountdown] = useState(30 * 60) // 30分钟倒计时
  
  // 获取订单信息
  useEffect(() => {
    const packageId = searchParams.get('package')
    const type = searchParams.get('type')
    const amount = searchParams.get('amount')
    const price = searchParams.get('price')
    
    if (packageId && tdbPackages[packageId]) {
      setOrderInfo({
        type: 'package',
        ...tdbPackages[packageId],
        packageId,
      })
    } else if (type === 'custom' && amount && price) {
      setOrderInfo({
        type: 'custom',
        amount: parseInt(amount),
        price: parseInt(price),
        name: '自定义金额',
      })
    } else {
      toast.error('订单信息无效')
      router.push('/shop/tdb')
    }
  }, [searchParams, router])
  
  // 倒计时
  useEffect(() => {
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
  }, [router])
  
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
  
  // 提交支付确认
  const handleSubmitPayment = async () => {
    setIsSubmitting(true)
    
    try {
      // TODO: 调用后端API创建订单
      // const response = await api.shop.createOrder({
      //   productType: 'tdb',
      //   ...orderInfo,
      //   paymentMethod: selectedMethod,
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('订单已提交，等待审核')
      
      // 跳转到订单页面
      router.push('/shop/tdb/order?id=mock-order-id')
    } catch (error) {
      toast.error('提交失败，请重试')
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
  
  if (authLoading || !orderInfo) {
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
  
  const currentPaymentInfo = paymentAccounts[selectedMethod]
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          支付订单
        </h1>
        <p className="text-gray-400 mt-1">
          请在 <span className="text-gold-500 font-bold">{formatCountdown(countdown)}</span> 内完成支付
        </p>
      </motion.div>
      
      {/* 订单信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PixelCard className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">订单信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">商品名称</span>
              <span className="font-bold">{orderInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">购买数量</span>
              <span className="font-bold">{orderInfo.amount} TDB</span>
            </div>
            {orderInfo.bonus && (
              <div className="flex justify-between">
                <span className="text-gray-400">赠送数量</span>
                <span className="font-bold text-green-500">+{orderInfo.bonus} TDB</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-400">应付金额</span>
              <span className="text-2xl font-black text-gold-500">
                ¥{orderInfo.price.toLocaleString()}
              </span>
            </div>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 支付方式选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PixelCard className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">选择支付方式</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedMethod('alipay')}
              className={cn(
                "p-4 border-2 rounded-lg transition-all",
                selectedMethod === 'alipay'
                  ? "border-gold-500 bg-gold-500/10"
                  : "border-gray-700 hover:border-gray-600"
              )}
            >
              <div className="text-3xl mb-2">💙</div>
              <p className="font-bold">支付宝</p>
            </button>
            
            <button
              onClick={() => setSelectedMethod('bank')}
              className={cn(
                "p-4 border-2 rounded-lg transition-all",
                selectedMethod === 'bank'
                  ? "border-gold-500 bg-gold-500/10"
                  : "border-gray-700 hover:border-gray-600"
              )}
            >
              <div className="text-3xl mb-2">🏦</div>
              <p className="font-bold">银行转账</p>
            </button>
            
            <button
              onClick={() => setSelectedMethod('wechat')}
              className={cn(
                "p-4 border-2 rounded-lg transition-all",
                selectedMethod === 'wechat'
                  ? "border-gold-500 bg-gold-500/10"
                  : "border-gray-700 hover:border-gray-600"
              )}
            >
              <div className="text-3xl mb-2">💚</div>
              <p className="font-bold">微信支付</p>
            </button>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 支付信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PixelCard className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">支付信息</h3>
          
          {selectedMethod === 'bank' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">开户银行</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold">{currentPaymentInfo.bank}</p>
                  <button
                    onClick={() => copyToClipboard(currentPaymentInfo.bank!)}
                    className="text-sm text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">开户支行</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold">{currentPaymentInfo.branch}</p>
                  <button
                    onClick={() => copyToClipboard(currentPaymentInfo.branch!)}
                    className="text-sm text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">账号</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold font-mono">{currentPaymentInfo.account}</p>
                  <button
                    onClick={() => copyToClipboard(currentPaymentInfo.account.replace(/\s/g, ''))}
                    className="text-sm text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">户名</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold">{currentPaymentInfo.accountName}</p>
                  <button
                    onClick={() => copyToClipboard(currentPaymentInfo.accountName)}
                    className="text-sm text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {/* 这里应该显示真实的二维码 */}
              <div className="w-48 h-48 mx-auto bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-500">二维码加载中...</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="font-bold">{currentPaymentInfo.account}</p>
                  <button
                    onClick={() => copyToClipboard(currentPaymentInfo.account)}
                    className="text-sm text-gold-500 hover:text-gold-400"
                  >
                    复制
                  </button>
                </div>
                <p className="text-sm text-gray-400">{currentPaymentInfo.accountName}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
            <p className="text-sm text-yellow-500">
              <span className="font-bold">重要提示：</span>
              转账时请务必备注您的用户ID或订单号，以便快速到账
            </p>
          </div>
        </PixelCard>
      </motion.div>
      
      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 justify-center"
      >
        <PixelButton
          variant="secondary"
          onClick={() => router.push('/shop/tdb')}
        >
          返回修改
        </PixelButton>
        <PixelButton
          onClick={handleSubmitPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '我已支付'}
        </PixelButton>
      </motion.div>
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
