// src/app/vouchers/page.tsx
// 商品提货单市场 - B2C & C2C 交易平台

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type MarketType = 'primary' | 'secondary'
type CategoryType = 'all' | 'liquor' | 'jewelry' | 'food' | 'electronics'
type SortOption = 'latest' | 'price_desc' | 'dividend_desc' | 'sales_desc'

interface Voucher {
  id: string
  productName: string
  merchantName: string
  merchantId: string
  isVerified: boolean
  image: string
  icon: string
  price: number
  monthlyDividendRate: number
  totalSupply: number
  sold: number
  category: string
  description: string
  totalDividendsPaid: number
  marketType: 'primary' | 'secondary'
  createdAt: string
}

export default function VouchersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // 状态管理
  const [marketType, setMarketType] = useState<MarketType>('primary')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [userBalance, setUserBalance] = useState(50000) // 模拟用户TDB余额

  // 分类配置
  const categories = [
    { value: 'all', label: '全部', icon: '📦' },
    { value: 'liquor', label: '白酒', icon: '🍷' },
    { value: 'jewelry', label: '珠宝', icon: '💎' },
    { value: 'food', label: '食品', icon: '🥘' },
    { value: 'electronics', label: '电子', icon: '📱' },
  ]

  // 模拟获取提货单数据
  useEffect(() => {
    fetchVouchers()
  }, [marketType, selectedCategory, sortBy])

  const fetchVouchers = () => {
    setLoading(true)
    
    // 模拟 API 调用
    setTimeout(() => {
      const mockVouchers: Voucher[] = [
        {
          id: '1',
          productName: '贵州茅台酒',
          merchantName: '茅台官方旗舰店',
          merchantId: 'merchant_1',
          isVerified: true,
          image: '/images/moutai.jpg',
          icon: '🍷',
          price: 2999,
          monthlyDividendRate: 8.5,
          totalSupply: 1000,
          sold: 856,
          category: 'liquor',
          description: '53度飞天茅台500ml',
          totalDividendsPaid: 125000,
          marketType: 'primary',
          createdAt: '2025-01-20',
        },
        {
          id: '2',
          productName: '周大福黄金项链',
          merchantName: '周大福官方店',
          merchantId: 'merchant_2',
          isVerified: true,
          image: '/images/gold-necklace.jpg',
          icon: '💎',
          price: 5888,
          monthlyDividendRate: 6.8,
          totalSupply: 500,
          sold: 213,
          category: 'jewelry',
          description: '999足金项链 5g',
          totalDividendsPaid: 45000,
          marketType: 'primary',
          createdAt: '2025-01-19',
        },
        {
          id: '3',
          productName: '五常大米提货券',
          merchantName: '东北特产专营店',
          merchantId: 'merchant_3',
          isVerified: true,
          image: '/images/rice.jpg',
          icon: '🌾',
          price: 298,
          monthlyDividendRate: 5.5,
          totalSupply: 5000,
          sold: 3421,
          category: 'food',
          description: '正宗五常稻花香大米10kg',
          totalDividendsPaid: 18500,
          marketType: 'secondary',
          createdAt: '2025-01-18',
        },
      ]

      // 根据市场类型筛选
      let filtered = mockVouchers.filter(v => 
        marketType === 'primary' ? v.marketType === 'primary' : true
      )
      
      // 分类筛选
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(v => v.category === selectedCategory)
      }
      
      // 排序
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_desc':
            return b.price - a.price
          case 'dividend_desc':
            return b.monthlyDividendRate - a.monthlyDividendRate
          case 'sales_desc':
            return b.sold - a.sold
          case 'latest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })

      setVouchers(filtered)
      setLoading(false)
    }, 500)
  }

  // 计算销售进度百分比
  const getSalesProgress = (sold: number, total: number) => {
    return Math.min((sold / total) * 100, 100)
  }

  // 处理购买
  const handlePurchase = () => {
    if (!selectedVoucher) return
    
    const totalPrice = selectedVoucher.price * purchaseQuantity
    
    if (userBalance < totalPrice) {
      toast.error('TDB余额不足')
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      setUserBalance(prev => prev - totalPrice)
      toast.success(`成功购买 ${purchaseQuantity} 张提货单！`)
      setShowPurchaseModal(false)
      setSelectedVoucher(null)
      setPurchaseQuantity(1)
      fetchVouchers()
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          商品提货单市场
        </h1>
        <p className="text-gray-400 mt-1">
          购买提货单享受月度分红，随时可兑换实物商品
        </p>
      </motion.div>

      {/* 市场切换 Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setMarketType('primary')}
          className={cn(
            "pb-3 px-1 font-bold transition-all",
            marketType === 'primary'
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-gray-400 hover:text-white"
          )}
        >
          一级市场 (商家发行)
        </button>
        <button
          onClick={() => setMarketType('secondary')}
          className={cn(
            "pb-3 px-1 font-bold transition-all",
            marketType === 'secondary'
              ? "text-gold-500 border-b-2 border-gold-500"
              : "text-gray-400 hover:text-white"
          )}
        >
          二级市场 (用户交易)
        </button>
      </div>

      {/* 筛选和排序 */}
      <PixelCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 flex-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value as CategoryType)}
                className={cn(
                  "px-3 py-1.5 rounded font-bold text-sm transition-all",
                  selectedCategory === cat.value
                    ? "bg-gold-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                )}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          
          {/* 排序选项 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="latest">最新发行</option>
            <option value="price_desc">价格从高到低</option>
            <option value="dividend_desc">分红率最高</option>
            <option value="sales_desc">销量最高</option>
          </select>
        </div>
      </PixelCard>

      {/* 提货单展示区 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      ) : vouchers.length === 0 ? (
        <PixelCard className="p-20 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400">暂无提货单</p>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/vouchers/${voucher.id}`)}
              className="cursor-pointer"
            >
              <PixelCard className="h-full hover:border-gold-500 transition-all">
                <div className="p-4 space-y-3">
                  {/* 商品图片区域 */}
                  <div className="relative">
                    <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-6xl">
                      {voucher.icon}
                    </div>
                    {voucher.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓ 已认证
                      </div>
                    )}
                  </div>
                  
                  {/* 商品信息 */}
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">
                      {voucher.productName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {voucher.merchantName}
                    </p>
                  </div>
                  
                  {/* 月分红率 - 醒目展示 */}
                  <div className="bg-gold-500/20 p-3 rounded-lg text-center">
                    <p className="text-2xl font-black text-gold-500">
                      {voucher.monthlyDividendRate}%
                    </p>
                    <p className="text-xs text-gray-400">月分红率</p>
                  </div>
                  
                  {/* 价格和进度 */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xl font-bold text-white">
                        {voucher.price} TDB
                      </span>
                      <span className="text-xs text-gray-400">
                        已售 {voucher.sold}/{voucher.totalSupply}
                      </span>
                    </div>
                    
                    {/* 销售进度条 */}
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold-500 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${getSalesProgress(voucher.sold, voucher.totalSupply)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* 购买确认弹窗 */}
      <PixelModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="确认购买提货单"
        size="medium"
      >
        {selectedVoucher && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{selectedVoucher.icon}</div>
              <h3 className="font-bold text-lg">{selectedVoucher.productName}</h3>
              <p className="text-sm text-gray-400">{selectedVoucher.merchantName}</p>
            </div>
            
            <div className="space-y-2 p-4 bg-gray-800 rounded">
              <div className="flex justify-between">
                <span className="text-gray-400">单价</span>
                <span className="font-bold">{selectedVoucher.price} TDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">月分红率</span>
                <span className="font-bold text-gold-500">
                  {selectedVoucher.monthlyDividendRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">购买数量</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                    className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 bg-gray-700 text-center rounded"
                  />
                  <button
                    onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}
                    className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="h-px bg-gray-700 my-2" />
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">总价</span>
                <span className="font-bold text-gold-500">
                  {(selectedVoucher.price * purchaseQuantity).toLocaleString()} TDB
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-sm text-blue-400">
                💡 提示：购买后立即享受月度分红权益，可随时在二级市场转让或兑换实物商品
              </p>
            </div>
            
            <div className="flex gap-3">
              <PixelButton
                className="flex-1"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? '处理中...' : '确认支付'}
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowPurchaseModal(false)
                  setPurchaseQuantity(1)
                }}
              >
                取消
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>
    </div>
  )
}
