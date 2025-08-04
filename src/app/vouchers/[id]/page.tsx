// src/app/vouchers/[id]/page.tsx
// 提货单详情页

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type TabType = 'details' | 'merchant' | 'history' | 'dividends'

interface VoucherDetail {
  id: string
  productName: string
  merchantName: string
  merchantId: string
  isVerified: boolean
  images: string[]
  icon: string
  price: number
  monthlyDividendRate: number
  totalSupply: number
  sold: number
  remaining: number
  category: string
  description: string
  specifications: string
  qualityCertUrl?: string
  totalDividendsPaid: number
  merchantInfo: {
    description: string
    reputation: number
    totalIssued: number
    storeAddress?: string
  }
  transactions: Transaction[]
  dividendRecords: DividendRecord[]
}

interface Transaction {
  id: string
  type: 'primary' | 'secondary'
  from: string
  to: string
  price: number
  quantity: number
  date: string
}

interface DividendRecord {
  id: string
  month: string
  rate: number
  amount: number
  status: 'paid' | 'pending'
  paidDate?: string
}

export default function VoucherDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const voucherId = params.id as string
  
  // 状态管理
  const [loading, setLoading] = useState(true)
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [quantity, setQuantity] = useState(1)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [userBalance] = useState(50000) // 模拟用户余额

  // 模拟获取提货单详情
  useEffect(() => {
    fetchVoucherDetail()
  }, [voucherId])

  const fetchVoucherDetail = () => {
    setLoading(true)
    
    // 模拟 API 调用
    setTimeout(() => {
      const mockVoucher: VoucherDetail = {
        id: voucherId,
        productName: '贵州茅台酒 飞天53度',
        merchantName: '茅台官方旗舰店',
        merchantId: 'merchant_1',
        isVerified: true,
        images: ['/moutai1.jpg', '/moutai2.jpg', '/moutai3.jpg'],
        icon: '🍷',
        price: 2999,
        monthlyDividendRate: 8.5,
        totalSupply: 1000,
        sold: 856,
        remaining: 144,
        category: 'liquor',
        description: '贵州茅台酒，中国大曲酱香型酒的鼻祖，被尊称为"国酒"。采用高温制曲、二次投料、堆积发酵的生产工艺，一般一年为一个生产周期。',
        specifications: '规格：500ml/瓶\n度数：53%vol\n香型：酱香型\n产地：贵州省仁怀市茅台镇',
        qualityCertUrl: 'https://sgs.com/cert/123456',
        totalDividendsPaid: 125000,
        merchantInfo: {
          description: '贵州茅台酒股份有限公司官方授权店铺，所有商品均为正品保证。',
          reputation: 98,
          totalIssued: 15,
          storeAddress: '贵州省仁怀市茅台镇'
        },
        transactions: [
          {
            id: 't1',
            type: 'primary',
            from: '茅台官方旗舰店',
            to: '张*明',
            price: 2999,
            quantity: 5,
            date: '2025-01-22 14:30'
          },
          {
            id: 't2',
            type: 'secondary',
            from: '张*明',
            to: '李*华',
            price: 3200,
            quantity: 2,
            date: '2025-01-23 10:15'
          }
        ],
        dividendRecords: [
          {
            id: 'd1',
            month: '2025-01',
            rate: 8.5,
            amount: 254.92,
            status: 'paid',
            paidDate: '2025-02-01'
          },
          {
            id: 'd2',
            month: '2024-12',
            rate: 8.5,
            amount: 254.92,
            status: 'paid',
            paidDate: '2025-01-01'
          }
        ]
      }
      
      setVoucher(mockVoucher)
      setLoading(false)
    }, 800)
  }

  // 处理购买
  const handlePurchase = () => {
    if (!voucher) return
    
    const totalPrice = voucher.price * quantity
    
    if (userBalance < totalPrice) {
      toast.error('TDB余额不足')
      return
    }
    
    if (quantity > voucher.remaining) {
      toast.error('购买数量超过剩余库存')
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      toast.success('购买成功！提货单已添加到您的钱包')
      setShowPurchaseModal(false)
      router.push('/wallet')
      setLoading(false)
    }, 1000)
  }

  const tabs = [
    { value: 'details', label: '商品详情', icon: '📝' },
    { value: 'merchant', label: '商家信息', icon: '🏪' },
    { value: 'history', label: '交易历史', icon: '📊' },
    { value: 'dividends', label: '分红记录', icon: '💰' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!voucher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-400">提货单不存在</p>
          <PixelButton onClick={() => router.push('/vouchers')} className="mt-4">
            返回市场
          </PixelButton>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-gray-400 hover:text-white transition-colors"
      >
        ← 返回
      </button>

      {/* 主信息区 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* 左侧 - 图片展示 */}
        <PixelCard className="p-6">
          <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-[120px]">
            {voucher.icon}
          </div>
          <div className="mt-4 flex gap-2">
            {/* 缩略图 */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center text-2xl cursor-pointer hover:opacity-80"
              >
                {voucher.icon}
              </div>
            ))}
          </div>
        </PixelCard>

        {/* 右侧 - 核心信息 */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
              {voucher.productName}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{voucher.merchantName}</span>
              {voucher.isVerified && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                  ✓ 已认证
                </span>
              )}
            </div>
          </div>

          {/* 关键指标 */}
          <div className="grid grid-cols-2 gap-4">
            <PixelCard className="p-4 text-center">
              <p className="text-3xl font-black text-gold-500">
                {voucher.price} TDB
              </p>
              <p className="text-sm text-gray-400">当前价格</p>
            </PixelCard>
            <PixelCard className="p-4 text-center bg-gold-500/10 border-gold-500">
              <p className="text-3xl font-black text-gold-500">
                {voucher.monthlyDividendRate}%
              </p>
              <p className="text-sm text-gray-400">月分红率</p>
            </PixelCard>
            <PixelCard className="p-4 text-center">
              <p className="text-2xl font-black text-white">
                {voucher.totalDividendsPaid.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">已分红总额(TDB)</p>
            </PixelCard>
            <PixelCard className="p-4 text-center">
              <p className="text-2xl font-black text-white">
                {voucher.remaining}
              </p>
              <p className="text-sm text-gray-400">剩余流通量</p>
            </PixelCard>
          </div>

          {/* 购买区域 */}
          <PixelCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">购买数量</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1 bg-gray-700 text-center rounded"
                />
                <button
                  onClick={() => setQuantity(Math.min(voucher.remaining, quantity + 1))}
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            </div>
            <PixelButton
              className="w-full"
              onClick={() => setShowPurchaseModal(true)}
              disabled={voucher.remaining === 0}
            >
              {voucher.remaining === 0 ? '已售罄' : '立即购买'}
            </PixelButton>
          </PixelCard>

          {/* 销售进度 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">销售进度</span>
              <span className="text-gray-400">
                {voucher.sold} / {voucher.totalSupply}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-500 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${(voucher.sold / voucher.totalSupply) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 详情信息区 */}
      <PixelCard>
        {/* Tabs 导航 */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as TabType)}
              className={cn(
                "px-4 py-3 font-bold transition-all",
                activeTab === tab.value
                  ? "text-gold-500 border-b-2 border-gold-500"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className="p-6">
          {/* 商品详情 */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">商品介绍</h3>
                <p className="text-gray-300 leading-relaxed">{voucher.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-3">商品规格</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {voucher.specifications}
                </pre>
              </div>
              
              {voucher.qualityCertUrl && (
                <div>
                  <h3 className="text-lg font-bold mb-3">质量认证</h3>
                  <a
                    href={voucher.qualityCertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    查看SGS质量认证证书 →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 商家信息 */}
          {activeTab === 'merchant' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">商家简介</h3>
                <p className="text-gray-300">{voucher.merchantInfo.description}</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {voucher.merchantInfo.reputation}%
                  </p>
                  <p className="text-sm text-gray-400">信誉评分</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {voucher.merchantInfo.totalIssued}
                  </p>
                  <p className="text-sm text-gray-400">发行提货单数</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    {voucher.merchantInfo.storeAddress || '仅线上'}
                  </p>
                  <p className="text-sm text-gray-400">实体店地址</p>
                </div>
              </div>
            </div>
          )}

          {/* 交易历史 */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {voucher.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-gray-800 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">
                      {tx.type === 'primary' ? '一级市场' : '二级市场'}交易
                    </p>
                    <p className="text-sm text-gray-400">
                      {tx.from} → {tx.to} ({tx.quantity}张)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-500">{tx.price} TDB</p>
                    <p className="text-xs text-gray-400">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分红记录 */}
          {activeTab === 'dividends' && (
            <div className="space-y-3">
              {voucher.dividendRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-800 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{record.month} 月度分红</p>
                    <p className="text-sm text-gray-400">
                      分红率: {record.rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold-500">
                      {record.amount} TDB
                    </p>
                    <p className="text-xs">
                      {record.status === 'paid' ? (
                        <span className="text-green-500">
                          已发放 ({record.paidDate})
                        </span>
                      ) : (
                        <span className="text-yellow-500">待发放</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PixelCard>

      {/* 购买确认弹窗 */}
      <PixelModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="确认购买"
        size="medium"
      >
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{voucher.icon}</div>
            <h3 className="font-bold text-lg">{voucher.productName}</h3>
          </div>
          
          <div className="space-y-2 p-4 bg-gray-800 rounded">
            <div className="flex justify-between">
              <span className="text-gray-400">单价</span>
              <span className="font-bold">{voucher.price} TDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">数量</span>
              <span className="font-bold">{quantity} 张</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">月分红率</span>
              <span className="font-bold text-gold-500">{voucher.monthlyDividendRate}%</span>
            </div>
            <div className="h-px bg-gray-700 my-2" />
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">总价</span>
              <span className="font-bold text-gold-500">
                {(voucher.price * quantity).toLocaleString()} TDB
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">预计月分红</span>
              <span className="font-bold text-green-500">
                {((voucher.price * quantity * voucher.monthlyDividendRate) / 100).toFixed(2)} TDB
              </span>
            </div>
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
              onClick={() => setShowPurchaseModal(false)}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    </div>
  )
}
