// src/app/shop/tdb/page.tsx
// TDB商品浏览页面

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// TDB商品套餐类型
interface TDBPackage {
  id: string
  name: string
  amount: number
  price: number
  discount?: number
  popular?: boolean
  bonus?: number
  description?: string
}

// 预设的TDB套餐
const tdbPackages: TDBPackage[] = [
  {
    id: 'starter',
    name: '新手套餐',
    amount: 100,
    price: 100,
    description: '适合初次体验',
  },
  {
    id: 'basic',
    name: '基础套餐',
    amount: 500,
    price: 490,
    discount: 2,
    description: '日常使用推荐',
  },
  {
    id: 'standard',
    name: '标准套餐',
    amount: 1000,
    price: 960,
    discount: 4,
    popular: true,
    description: '最受欢迎',
  },
  {
    id: 'premium',
    name: '进阶套餐',
    amount: 5000,
    price: 4700,
    discount: 6,
    bonus: 100,
    description: '额外赠送100 TDB',
  },
  {
    id: 'pro',
    name: '专业套餐',
    amount: 10000,
    price: 9200,
    discount: 8,
    bonus: 300,
    description: '额外赠送300 TDB',
  },
  {
    id: 'vip',
    name: 'VIP套餐',
    amount: 50000,
    price: 45000,
    discount: 10,
    bonus: 2000,
    description: '额外赠送2000 TDB',
  },
]

export default function TDBShopPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<TDBPackage | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/login?redirect=/shop/tdb')
    }
  }, [authLoading, isAuthenticated, router])

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

  // 计算自定义金额
  const calculateCustomPrice = (amount: string) => {
    const num = parseInt(amount)
    if (isNaN(num) || num <= 0) return 0
    
    // 根据金额给予不同折扣
    let discount = 0
    if (num >= 50000) discount = 10
    else if (num >= 10000) discount = 8
    else if (num >= 5000) discount = 6
    else if (num >= 1000) discount = 4
    else if (num >= 500) discount = 2
    
    return Math.floor(num * (100 - discount) / 100)
  }

  // 处理购买
  const handlePurchase = () => {
    if (!isCustom && !selectedPackage) {
      toast.error('请选择一个套餐')
      return
    }
    
    if (isCustom) {
      const amount = parseInt(customAmount)
      if (isNaN(amount) || amount < 100) {
        toast.error('最低购买金额为100 TDB')
        return
      }
      
      // 跳转到支付页面，传递自定义购买信息
      router.push(`/shop/tdb/payment?type=custom&amount=${amount}&price=${calculateCustomPrice(customAmount)}`)
    } else if (selectedPackage) {
      // 跳转到支付页面，传递套餐信息
      router.push(`/shop/tdb/payment?package=${selectedPackage.id}`)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
          购买 TDB 积分
        </h1>
        <p className="text-gray-400 mt-2">
          TDB 是平行世界的稳定交易币，1 TDB ≈ 0.01克黄金
        </p>
      </motion.div>

      {/* 套餐选择 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tdbPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <PixelCard
              className={cn(
                "p-6 cursor-pointer transition-all",
                selectedPackage?.id === pkg.id ? "border-gold-500" : "hover:border-gold-500/50",
                pkg.popular && "relative overflow-hidden"
              )}
              onClick={() => {
                setSelectedPackage(pkg)
                setIsCustom(false)
              }}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gold-500 text-black text-xs px-3 py-1 font-bold">
                  热门
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold mb-2">{pkg.name}</h3>
                <p className="text-3xl font-black text-gold-500">
                  {pkg.amount.toLocaleString()}
                  <span className="text-sm ml-1">TDB</span>
                </p>
                {pkg.bonus && (
                  <p className="text-sm text-green-500 mt-1">
                    +{pkg.bonus} TDB 赠送
                  </p>
                )}
              </div>
              
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-white">
                  ¥{pkg.price.toLocaleString()}
                </p>
                {pkg.discount && (
                  <p className="text-sm text-gray-400">
                    <span className="line-through">¥{pkg.amount}</span>
                    <span className="ml-2 text-green-500">省{pkg.discount}%</span>
                  </p>
                )}
              </div>
              
              {pkg.description && (
                <p className="text-xs text-gray-400 text-center">
                  {pkg.description}
                </p>
              )}
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  单价: ¥{(pkg.price / (pkg.amount + (pkg.bonus || 0))).toFixed(3)}/TDB
                </p>
              </div>
            </PixelCard>
          </motion.div>
        ))}
      </div>

      {/* 自定义金额 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <PixelCard className="p-6">
          <h3 className="text-lg font-bold mb-4">自定义金额</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="输入购买数量（最低100 TDB）"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setIsCustom(true)
                  setSelectedPackage(null)
                }}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-gold-500 rounded outline-none"
                min="100"
                step="100"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">应付金额</p>
                <p className="text-2xl font-bold text-gold-500">
                  ¥{calculateCustomPrice(customAmount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {customAmount && parseInt(customAmount) >= 100 && (
            <div className="mt-4 text-sm text-gray-400">
              {parseInt(customAmount) >= 50000 && '享受10%折扣'}
              {parseInt(customAmount) >= 10000 && parseInt(customAmount) < 50000 && '享受8%折扣'}
              {parseInt(customAmount) >= 5000 && parseInt(customAmount) < 10000 && '享受6%折扣'}
              {parseInt(customAmount) >= 1000 && parseInt(customAmount) < 5000 && '享受4%折扣'}
              {parseInt(customAmount) >= 500 && parseInt(customAmount) < 1000 && '享受2%折扣'}
            </div>
          )}
        </PixelCard>
      </motion.div>

      {/* 购买须知 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <PixelCard className="p-6 bg-gold-500/10 border-gold-500/30">
          <h3 className="text-lg font-bold mb-3 text-gold-500">购买须知</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>TDB积分购买后立即到账，不支持退款</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>支持支付宝、银行转账等多种支付方式</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>大额购买享受更多优惠，最高可享10%折扣</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-500 mt-1">•</span>
              <span>如需发票，请在支付后联系客服</span>
            </li>
          </ul>
        </PixelCard>
      </motion.div>

      {/* 底部操作 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <PixelButton
          size="lg"
          onClick={handlePurchase}
          disabled={!selectedPackage && (!isCustom || !customAmount || parseInt(customAmount) < 100)}
          className="px-12"
        >
          立即购买
        </PixelButton>
      </motion.div>
    </div>
  )
}
