// src/app/trading/prices/page.tsx
// 价格指导页面 - 查看各类商品的价格走势和市场行情
// 版本：1.0.0 - 提供价格参考和市场分析

/**
 * ============================================
 * 文件创建说明
 * ============================================
 * 创建原因：帮助用户了解市场价格，做出合理的交易决策
 * 主要功能：
 * 1. 实时价格 - 显示各商品当前市场价格
 * 2. 价格走势 - 展示历史价格变化图表
 * 3. 市场深度 - 显示买卖订单分布
 * 4. 价格预测 - 基于历史数据的价格建议
 * 
 * 依赖关系：
 * - /lib/api/trading.ts - 交易 API 接口
 * - /hooks/useTrading.ts - 交易相关 Hook
 * - recharts - 图表库
 * 
 * ⚠️ 重要说明：
 * - 价格数据每5分钟更新一次
 * - 图表支持触摸操作，适配移动端
 * - 保持与交易页面的视觉一致性
 * ============================================
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PixelCard } from '@/components/shared/PixelCard'
import { useAuth } from '@/hooks/useAuth'
import { usePriceGuide } from '@/hooks/useTrading'
import { RESOURCE_INFO, TOOL_INFO } from '@/lib/api/resources'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 商品类别
const CATEGORIES = [
  { value: 'all', label: '全部', icon: '📊' },
  { value: 'materials', label: '材料', icon: '📦' },
  { value: 'tools', label: '工具', icon: '🔧' },
]

export default function PricesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  // 获取价格数据
  const { 
    priceGuides, 
    priceHistory,
    marketDepth,
    loading,
    refreshPrices
  } = usePriceGuide({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    itemType: selectedItem || undefined
  })
  
  // 检查认证状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/trading/prices')
    }
  }, [authLoading, isAuthenticated, router])
  
  // 定期刷新价格
  useEffect(() => {
    const interval = setInterval(refreshPrices, 300000) // 5分钟刷新
    return () => clearInterval(interval)
  }, [refreshPrices])
  
  // 获取所有商品信息
  const allItems = {
    ...RESOURCE_INFO,
    ...TOOL_INFO
  }
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">加载价格数据...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          价格指导
        </h1>
        <p className="text-gray-400 mt-1">
          实时市场行情和价格走势分析
        </p>
        
        {/* 最后更新时间 */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>最后更新：{new Date().toLocaleTimeString('zh-CN')}</span>
        </div>
      </motion.div>
      
      {/* 类别选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value)
                setSelectedItem(null)
              }}
              className={cn(
                "px-4 py-2 rounded-lg border transition-all flex items-center gap-2",
                selectedCategory === cat.value
                  ? "bg-gold-500/20 border-gold-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* 价格概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
      >
        {priceGuides && Object.entries(priceGuides)
          .filter(([type]) => {
            if (selectedCategory === 'all') return true
            if (selectedCategory === 'materials') return type in RESOURCE_INFO
            if (selectedCategory === 'tools') return type in TOOL_INFO
            return true
          })
          .map(([type, guide]: [string, any], index) => {
            const itemInfo = allItems[type]
            if (!itemInfo) return null
            
            return (
              <PriceCard
                key={type}
                type={type}
                guide={guide}
                itemInfo={itemInfo}
                isSelected={selectedItem === type}
                onClick={() => setSelectedItem(type === selectedItem ? null : type)}
                index={index}
              />
            )
          })}
      </motion.div>
      
      {/* 详细价格分析 */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 价格走势图 */}
          <PixelCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold-500" />
              {allItems[selectedItem]?.name} 价格走势
            </h3>
            {priceHistory && priceHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      domain={['dataMin * 0.95', 'dataMax * 1.05']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid #FFD700',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString('zh-CN')}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#FFD700"
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                暂无历史数据
              </div>
            )}
          </PixelCard>
          
          {/* 市场深度 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 买单深度 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4 text-green-400">买单分布</h3>
              {marketDepth?.buy && marketDepth.buy.length > 0 ? (
                <div className="space-y-2">
                  {marketDepth.buy.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ 
                              width: `${(order.quantity / marketDepth.buy[0].quantity) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm text-right">
                        <p className="font-bold text-green-400">{order.price} TDB</p>
                        <p className="text-xs text-gray-400">{order.quantity} 个</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无买单</p>
              )}
            </PixelCard>
            
            {/* 卖单深度 */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-bold mb-4 text-red-400">卖单分布</h3>
              {marketDepth?.sell && marketDepth.sell.length > 0 ? (
                <div className="space-y-2">
                  {marketDepth.sell.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="ml-4 text-sm text-left">
                        <p className="font-bold text-red-400">{order.price} TDB</p>
                        <p className="text-xs text-gray-400">{order.quantity} 个</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-red-500/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all"
                            style={{ 
                              width: `${(order.quantity / marketDepth.sell[0].quantity) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无卖单</p>
              )}
            </PixelCard>
          </div>
        </motion.div>
      )}
      
      {/* 价格提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <PixelCard className="p-6 bg-blue-900/20 border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-bold text-blue-400">价格说明</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 显示价格为市场实时成交价</li>
                <li>• 昨日均价基于24小时内的所有成交记录计算</li>
                <li>• 出售价格必须在昨日均价 ±15% 范围内</li>
                <li>• 价格数据每5分钟自动更新</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </div>
  )
}

// ==================== 子组件 ====================

// 价格卡片
interface PriceCardProps {
  type: string
  guide: any
  itemInfo: any
  isSelected: boolean
  onClick: () => void
  index: number
}

function PriceCard({ type, guide, itemInfo, isSelected, onClick, index }: PriceCardProps) {
  const priceChange = ((guide.yesterday_price - guide.day_before_price) / guide.day_before_price) * 100
  const isUp = priceChange > 0
  const isDown = priceChange < 0
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <PixelCard 
        className={cn(
          "p-4 cursor-pointer transition-all",
          isSelected 
            ? "border-gold-500 bg-gold-500/10" 
            : "hover:border-gold-500/50"
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{itemInfo.icon}</span>
            <h4 className="font-bold">{itemInfo.name}</h4>
          </div>
          {isUp && <TrendingUp className="w-4 h-4 text-green-400" />}
          {isDown && <TrendingDown className="w-4 h-4 text-red-400" />}
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-400">当前价格</p>
            <p className="text-xl font-bold text-gold-500">
              {guide.yesterday_price} TDB
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">24h变化</span>
            <span className={cn(
              "font-bold",
              isUp ? "text-green-400" : isDown ? "text-red-400" : "text-gray-400"
            )}>
              {isUp && "+"}
              {priceChange.toFixed(2)}%
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-800">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">价格范围</span>
              <span className="text-gray-300">
                {guide.min_allowed} - {guide.max_allowed}
              </span>
            </div>
            {guide.market_status && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">在售数量</span>
                <span className="text-gray-300">
                  {guide.market_status.total_quantity}
                </span>
              </div>
            )}
          </div>
        </div>
      </PixelCard>
    </motion.div>
  )
}
