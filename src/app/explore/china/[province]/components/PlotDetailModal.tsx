// app/explore/china/[province]/components/PlotDetailModal.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ShoppingBag, Lock, MessageCircle, Share2, Heart,
  MapPin, Activity, Coins, Trophy, Users, Store,
  TrendingUp, BarChart3, Star, Flame, Eye, Clock,
  Building2, Layers, ArrowRight, ExternalLink, Calendar,
  DollarSign, Percent, Timer, Award, ChevronRight,
  Home, Factory, Trees, Diamond, Crown, Info, AlertCircle,
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { cn, formatCurrency, formatNumber, calculateDistance, vibrate } from '../utils'
import { useNetworkStatus } from '../hooks'
import type { Plot, UserState } from '../types'
import { PLOT_TYPES, ANIMATION_CONFIG, ACHIEVEMENTS } from '../constants'

interface PlotDetailModalProps {
  plot: Plot
  nearbyPlots: Plot[]
  onClose: () => void
  onAction: (action: string, data?: any) => void
  user: UserState
  isMobile: boolean
}

export function PlotDetailModal({
  plot,
  nearbyPlots,
  onClose,
  onAction,
  user,
  isMobile
}: PlotDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(
    user.favoriteShops?.includes(plot.id) || false
  )
  
  const { isOnline } = useNetworkStatus()
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  
  // 计算周边统计
  const nearbyStats = useMemo(() => {
    const commercial = nearbyPlots.filter(p => p.type === 'commercial')
    const withBuildings = nearbyPlots.filter(p => p.building)
    const avgPrice = nearbyPlots.reduce((sum, p) => sum + p.price, 0) / nearbyPlots.length
    const avgTraffic = nearbyPlots.reduce((sum, p) => sum + (p.trafficFlow || 0), 0) / nearbyPlots.length
    
    return {
      avgPrice,
      commercialCount: commercial.length,
      buildingCount: withBuildings.length,
      hasSubway: nearbyPlots.some(p => p.nearSubway),
      avgTraffic,
      priceRank: nearbyPlots.filter(p => p.price > plot.price).length + 1,
      totalNearby: nearbyPlots.length
    }
  }, [nearbyPlots, plot.price])
  
  // 投资评分计算
  const investmentScore = useMemo(() => {
    let score = 50 // 基础分
    
    // 位置加分
    if (plot.nearSubway) score += 15
    if (nearbyStats.hasSubway) score += 5
    if (nearbyStats.commercialCount > 3) score += 10
    
    // 价格评分
    if (plot.price < nearbyStats.avgPrice * 0.8) score += 10
    else if (plot.price > nearbyStats.avgPrice * 1.2) score -= 10
    
    // 收益评分
    const yieldRate = (plot.monthlyYield * 12 / plot.price) * 100
    if (yieldRate > 8) score += 15
    else if (yieldRate > 6) score += 10
    else if (yieldRate < 4) score -= 10
    
    // 人流加分
    if (plot.trafficFlow && plot.trafficFlow >= 4) score += 10
    
    // 建筑加分
    if (plot.building) {
      if (plot.building.popularity && plot.building.popularity > 80) score += 10
      if (plot.building.type === 'mall') score += 5
    }
    
    return Math.min(100, Math.max(0, score))
  }, [plot, nearbyStats])
  
  // 处理购买
  const handleBuy = async () => {
    if (!user.isLoggedIn) {
      onAction('login')
      return
    }
    
    if (!isOnline) {
      alert('网络连接已断开，请检查网络')
      return
    }
    
    if (user.balance && user.balance.tdb < plot.price) {
      alert('余额不足，请先充值')
      return
    }
    
    setShowConfirm(true)
  }
  
  // 确认购买
  const confirmBuy = async () => {
    setLoading(true)
    vibrate(50) // 触觉反馈
    
    try {
      // 模拟购买请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 检查是否解锁成就
      const achievements = []
      if (!user.ownedPlots || user.ownedPlots === 0) {
        achievements.push(ACHIEVEMENTS.firstPurchase)
      }
      
      onAction('buy', { plot, achievements })
      onClose()
    } catch (error) {
      alert('购买失败，请重试')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }
  
  // 处理分享
  const handleShare = async () => {
    const shareData = {
      title: `平行世界 - ${plot.name}`,
      text: `我在平行世界发现了一个不错的投资机会！${plot.building ? plot.building.name : '空地'}，价格${formatCurrency(plot.price)}，月收益${formatCurrency(plot.monthlyYield)}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        vibrate([50, 50, 50])
      } catch (err) {
        console.log('分享取消')
      }
    } else {
      // 降级方案：复制到剪贴板
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      alert('链接已复制到剪贴板')
    }
  }
  
  // 处理收藏
  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    onAction('favorite', { plotId: plot.id, action: !isFavorite ? 'add' : 'remove' })
    vibrate(50)
  }
  
  // 选项卡配置
  const tabs = [
    { id: 'overview', label: '概览', icon: Eye },
    ...(plot.building ? [{ id: 'shop', label: '商店', icon: Store }] : []),
    { id: 'analysis', label: '分析', icon: BarChart3 },
    { id: 'nearby', label: '周边', icon: MapPin },
    { id: 'history', label: '历史', icon: Clock }
  ]
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={cn(
          "bg-gray-900 border border-gray-700 rounded-2xl w-full overflow-hidden",
          isMobile ? "max-h-[90vh]" : "max-w-4xl max-h-[85vh]"
        )}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={ANIMATION_CONFIG.spring}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <PlotDetailHeader
          plot={plot}
          typeConfig={typeConfig}
          Icon={Icon}
          isFavorite={isFavorite}
          onClose={onClose}
          onShare={handleShare}
          onFavorite={handleFavorite}
          investmentScore={investmentScore}
        />
        
        {/* 选项卡 */}
        <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap",
                "border-b-2",
                activeTab === tab.id 
                  ? "text-gold-500 border-gold-500" 
                  : "text-gray-400 border-transparent hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* 内容区 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 260px)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab
                key="overview"
                plot={plot}
                nearbyStats={nearbyStats}
                typeConfig={typeConfig}
                investmentScore={investmentScore}
              />
            )}
            
            {activeTab === 'shop' && plot.building && (
              <ShopTab
                key="shop"
                building={plot.building}
                plot={plot}
              />
            )}
            
            {activeTab === 'analysis' && (
              <AnalysisTab
                key="analysis"
                plot={plot}
                nearbyStats={nearbyStats}
                investmentScore={investmentScore}
              />
            )}
            
            {activeTab === 'nearby' && (
              <NearbyTab
                key="nearby"
                plot={plot}
                nearbyPlots={nearbyPlots}
                nearbyStats={nearbyStats}
              />
            )}
            
            {activeTab === 'history' && (
              <HistoryTab
                key="history"
                plot={plot}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* 底部操作栏 */}
        <PlotDetailFooter
          plot={plot}
          user={user}
          loading={loading}
          onBuy={handleBuy}
          onAction={onAction}
        />
      </motion.div>
      
      {/* 购买确认弹窗 */}
      <PurchaseConfirmModal
        show={showConfirm}
        plot={plot}
        user={user}
        loading={loading}
        onConfirm={confirmBuy}
        onCancel={() => setShowConfirm(false)}
      />
    </motion.div>
  )
}

// 头部组件
function PlotDetailHeader({
  plot,
  typeConfig,
  Icon,
  isFavorite,
  onClose,
  onShare,
  onFavorite,
  investmentScore
}: {
  plot: Plot
  typeConfig: typeof PLOT_TYPES[keyof typeof PLOT_TYPES]
  Icon: any
  isFavorite: boolean
  onClose: () => void
  onShare: () => void
  onFavorite: () => void
  investmentScore: number
}) {
  return (
    <div className={cn(
      "relative p-4 md:p-6 border-b border-gray-800",
      plot.type === 'landmark' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20' :
      `bg-gradient-to-r ${typeConfig.bgGradient}`
    )}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {/* 地块图标 */}
            <div className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center",
              "bg-black/20 backdrop-blur border border-white/10"
            )}>
              {plot.building ? (
                <span className="text-3xl md:text-4xl">{plot.building.icon}</span>
              ) : (
                <Icon className="w-8 h-8 md:w-10 md:h-10 text-white/70" />
              )}
            </div>
            
            {/* 地块信息 */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {plot.name}
              </h3>
              <p className="text-sm text-white/70">{typeConfig.name}</p>
              {plot.building && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm bg-black/30 px-2 py-1 rounded">
                    {plot.building.name}
                  </span>
                  {plot.building.popularity && plot.building.popularity > 85 && (
                    <span className="text-sm bg-purple-500/30 px-2 py-1 rounded flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      知名品牌
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 投资评分 */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg">
              <Trophy className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-bold text-white">{investmentScore}分</span>
            </div>
            
            <button
              onClick={onShare}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="分享"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onFavorite}
              className={cn(
                "p-2 hover:bg-white/10 rounded-lg transition-colors",
                isFavorite && "text-red-500"
              )}
              title="收藏"
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 快速数据 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <QuickStat
            label="当前价格"
            value={formatCurrency(plot.price)}
            icon={<Coins className="w-4 h-4" />}
            color="text-gold-500"
          />
          <QuickStat
            label="月收益"
            value={formatCurrency(plot.monthlyYield)}
            icon={<TrendingUp className="w-4 h-4" />}
            color="text-green-500"
          />
          <QuickStat
            label="人流指数"
            value={`${plot.trafficFlow || 0}/5`}
            icon={<Users className="w-4 h-4" />}
            color="text-blue-500"
          />
          <QuickStat
            label="回本周期"
            value={`${Math.ceil(plot.price / plot.monthlyYield)}个月`}
            icon={<Timer className="w-4 h-4" />}
            color="text-purple-500"
          />
        </div>
      </div>
    </div>
  )
}

// 快速统计组件
function QuickStat({
  label,
  value,
  icon,
  color
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-black/30 backdrop-blur rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
        <span className={color}>{icon}</span>
        <span>{label}</span>
      </div>
      <p className={cn("font-bold", color)}>{value}</p>
    </div>
  )
}

// 概览标签页
function OverviewTab({
  plot,
  nearbyStats,
  typeConfig,
  investmentScore
}: {
  plot: Plot
  nearbyStats: any
  typeConfig: typeof PLOT_TYPES[keyof typeof PLOT_TYPES]
  investmentScore: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
  )
}

// 分析项组件
function AnalysisItem({
  label,
  value,
  icon,
  highlight
}: {
  label: string
  value: string
  icon: React.ReactNode
  highlight?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className={cn("font-bold text-lg", highlight || "text-white")}>
        {value}
      </p>
    </div>
  )
}

// 评分项组件
function ScoreItem({
  label,
  score,
  description
}: {
  label: string
  score: number
  description: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-bold">{score}/100</span>
      </div>
      <div className="bg-gray-700 rounded-full h-2 overflow-hidden mb-1">
        <motion.div
          className={cn(
            "h-full",
            score >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
            score >= 60 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
            "bg-gradient-to-r from-red-500 to-pink-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

// 收益预测图表
function YieldProjection({ plot }: { plot: Plot }) {
  const months = [1, 6, 12, 24, 36, 60]
  const yields = months.map(m => ({
    month: m,
    value: plot.monthlyYield * m,
    total: plot.monthlyYield * m + plot.price * (1 + (plot.appreciationRate || 0.08) * (m / 12)) - plot.price
  }))
  
  const maxYield = Math.max(...yields.map(y => y.total))
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {yields.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {item.month < 12 ? `${item.month}月` : `${item.month / 12}年`}
            </div>
            <div className="relative h-24 w-8 bg-gray-700 rounded-t">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold-500 to-orange-500 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(item.total / maxYield) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            </div>
            <div className="text-xs font-bold mt-1">
              {formatCurrency(item.total)}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">
        * 基于当前收益率和预期升值率计算
      </p>
    </div>
  )
}

// 投资建议
function InvestmentAdvice({ score, plot }: { score: number; plot: Plot }) {
  const getAdvice = () => {
    if (score >= 80) {
      return {
        level: 'high',
        title: '强烈推荐',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        content: '这是一个极佳的投资机会，建议尽快入手。地理位置优越，收益稳定，升值潜力大。'
      }
    } else if (score >= 60) {
      return {
        level: 'medium',
        title: '推荐投资',
        icon: <Info className="w-5 h-5 text-blue-500" />,
        content: '整体投资价值良好，适合中长期持有。建议关注周边发展动态。'
      }
    } else {
      return {
        level: 'low',
        title: '谨慎考虑',
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        content: '投资回报一般，建议详细评估风险后再做决定。可考虑其他更优质的地块。'
      }
    }
  }
  
  const advice = getAdvice()
  
  return (
    <div className={cn(
      "rounded-lg p-4 border",
      advice.level === 'high' ? "bg-green-500/10 border-green-500/30" :
      advice.level === 'medium' ? "bg-blue-500/10 border-blue-500/30" :
      "bg-yellow-500/10 border-yellow-500/30"
    )}>
      <h4 className="font-bold mb-2 flex items-center gap-2">
        {advice.icon}
        {advice.title}
      </h4>
      <p className="text-sm text-gray-300">{advice.content}</p>
    </div>
  )
}

// 周边标签页
function NearbyTab({
  plot,
  nearbyPlots,
  nearbyStats
}: {
  plot: Plot
  nearbyPlots: Plot[]
  nearbyStats: any
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={ANIMATION_CONFIG.fast}
      className="p-4 md:p-6 space-y-6"
    >
      {/* 周边统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<MapPin className="w-5 h-5 text-blue-500" />}
          label="周边地块"
          value={`${nearbyStats.totalNearby}个`}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-orange-500" />}
          label="商业地块"
          value={`${nearbyStats.commercialCount}个`}
        />
        <StatCard
          icon={<Building2 className="w-5 h-5 text-purple-500" />}
          label="已建设"
          value={`${nearbyStats.buildingCount}个`}
        />
        <StatCard
          icon={<Coins className="w-5 h-5 text-gold-500" />}
          label="均价"
          value={formatCurrency(nearbyStats.avgPrice)}
        />
      </div>
      
      {/* 价格排名 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-400" />
          价格排名
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gold-500">
              第{nearbyStats.priceRank}名
            </p>
            <p className="text-sm text-gray-400">
              在周边{nearbyStats.totalNearby}个地块中
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">当前价格</p>
            <p className="text-lg font-bold">{formatCurrency(plot.price)}</p>
            <p className="text-sm text-gray-400">周边均价</p>
            <p className="text-lg font-bold">{formatCurrency(nearbyStats.avgPrice)}</p>
          </div>
        </div>
      </div>
      
      {/* 周边地块列表 */}
      <div>
        <h4 className="font-bold mb-3">周边地块</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {nearbyPlots
            .sort((a, b) => 
              calculateDistance(a.coordinates, plot.coordinates) - 
              calculateDistance(b.coordinates, plot.coordinates)
            )
            .map(nearbyPlot => (
              <NearbyPlotItem
                key={nearbyPlot.id}
                plot={nearbyPlot}
                distance={calculateDistance(nearbyPlot.coordinates, plot.coordinates)}
              />
            ))}
        </div>
      </div>
    </motion.div>
  )
}

// 统计卡片
function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  )
}

// 周边地块项
function NearbyPlotItem({
  plot,
  distance
}: {
  plot: Plot
  distance: number
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center",
        `bg-gradient-to-br ${typeConfig.bgGradient}`
      )}>
        {plot.building ? (
          <span className="text-xl">{plot.building.icon}</span>
        ) : (
          <typeConfig.icon className="w-6 h-6 text-white/70" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{plot.name}</span>
          {plot.status === 'available' && (
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
              可购买
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {plot.building?.name || typeConfig.name} · 
          距离{distance.toFixed(1)}格
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-bold">{formatCurrency(plot.price)}</p>
        <p className="text-xs text-gray-400">
          +{formatCurrency(plot.monthlyYield)}/月
        </p>
      </div>
    </div>
  )
}

// 历史标签页
function HistoryTab({ plot }: { plot: Plot }) {
  // 模拟历史数据
  const transactions = [
    {
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      type: 'purchase',
      price: plot.price * 0.7,
      owner: '王先生'
    },
    {
      date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      type: 'purchase',
      price: plot.price * 0.5,
      owner: '李女士'
    },
    {
      date: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
      type: 'initial',
      price: plot.price * 0.3,
      owner: '系统'
    }
  ]
  
  const priceHistory = [
    { month: -12, price: plot.price * 0.7 },
    { month: -9, price: plot.price * 0.75 },
    { month: -6, price: plot.price * 0.85 },
    { month: -3, price: plot.price * 0.95 },
    { month: 0, price: plot.price }
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={ANIMATION_CONFIG.fast}
      className="p-4 md:p-6 space-y-6"
    >
      {/* 价格走势 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          价格走势
        </h4>
        
        <div className="h-48 flex items-end justify-between gap-2">
          {priceHistory.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-700 rounded-t relative">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gold-500 to-orange-500 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${(item.price / plot.price) * 100}%` 
                  }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ minHeight: '20px' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {item.month === 0 ? '当前' : `${Math.abs(item.month)}月前`}
              </p>
              <p className="text-xs font-bold">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
          <p className="text-sm text-green-400">
            过去12个月涨幅：
            <span className="font-bold ml-1">
              +{((plot.price / (plot.price * 0.7) - 1) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
      
      {/* 交易记录 */}
      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          交易记录
        </h4>
        
        <div className="space-y-3">
          {plot.owned && plot.ownerName && (
            <TransactionItem
              date={new Date()}
              type="current"
              owner={plot.ownerName}
              price={plot.price}
            />
          )}
          
          {transactions.map((tx, i) => (
            <TransactionItem
              key={i}
              date={tx.date}
              type={tx.type}
              owner={tx.owner}
              price={tx.price}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 交易记录项
function TransactionItem({
  date,
  type,
  owner,
  price
}: {
  date: Date
  type: string
  owner: string
  price: number
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          type === 'current' ? "bg-green-500/20" : "bg-gray-700"
        )}>
          {type === 'current' ? (
            <Home className="w-5 h-5 text-green-500" />
          ) : (
            <Activity className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {type === 'current' ? '当前持有者' : '交易记录'}
          </p>
          <p className="text-xs text-gray-400">
            {owner} · {date.toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold">{formatCurrency(price)}</p>
        {type !== 'current' && type !== 'initial' && (
          <p className="text-xs text-green-400">
            +{((price / (price * 0.7) - 1) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  )
}

// 底部操作栏
function PlotDetailFooter({
  plot,
  user,
  loading,
  onBuy,
  onAction
}: {
  plot: Plot
  user: UserState
  loading: boolean
  onBuy: () => void
  onAction: (action: string) => void
}) {
  return (
    <div className="border-t border-gray-800 p-4 md:p-6">
      <div className="flex gap-3">
        {plot.status === 'available' && (
          <>
            <button
              onClick={onBuy}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  立即购买
                </>
              )}
            </button>
            <button
              onClick={() => onAction('simulate')}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              收益试算
            </button>
          </>
        )}
        
        {plot.status === 'protected' && (
          <button
            disabled
            className="flex-1 bg-gray-800 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            保护区域，不可交易
          </button>
        )}
        
        {plot.type === 'landmark' && plot.status === 'owned' && (
          <button
            onClick={() => onAction('visit')}
            className="flex-1 bg-gradient-to-r from-gold-500 to-yellow-600 text-black py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
          >
            参观地标
          </button>
        )}
        
        {plot.status === 'owned' && plot.ownerId !== user.username && (
          <>
            <button
              onClick={() => onAction('contact')}
              className="flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              联系业主
            </button>
            <button
              onClick={() => onAction('offer')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              出价收购
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// 购买确认弹窗
function PurchaseConfirmModal({
  show,
  plot,
  user,
  loading,
  onConfirm,
  onCancel
}: {
  show: boolean
  plot: Plot
  user: UserState
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">确认购买</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">地块名称</span>
                <span>{plot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">地块类型</span>
                <span>{PLOT_TYPES[plot.type].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">购买价格</span>
                <span className="text-gold-500 font-bold">
                  {formatCurrency(plot.price)}
                </span>
              </div>
              <div className="h-px bg-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-400">账户余额</span>
                <span>{formatCurrency(user.balance?.tdb || 0, 'TDB')}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">购买后余额</span>
                <span className={cn(
                  ((user.balance?.tdb || 0) - plot.price) < 0 && "text-red-500"
                )}>
                  {formatCurrency((user.balance?.tdb || 0) - plot.price, 'TDB')}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                disabled={loading || ((user.balance?.tdb || 0) < plot.price)}
                className="flex-1 bg-gradient-to-r from-gold-500 to-orange-600 text-black py-2 rounded font-medium hover:shadow-lg hover:shadow-gold-500/25 transition-all disabled:opacity-50"
              >
                {loading ? '处理中...' : '确认支付'}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
            
            {((user.balance?.tdb || 0) < plot.price) && (
              <p className="text-xs text-red-500 text-center mt-3">
                余额不足，请先充值
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
      exit={{ opacity: 0, y: -20 }}
      transition={ANIMATION_CONFIG.fast}
      className="p-4 md:p-6 space-y-6"
    >
      {/* 投资评分卡片 */}
      <div className="bg-gradient-to-r from-gold-500/10 to-orange-600/10 border border-gold-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-500" />
            投资评分
          </h4>
          <span className="text-2xl font-bold text-gold-500">{investmentScore}分</span>
        </div>
        
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-500 to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: `${investmentScore}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
        
        <p className="text-sm text-gray-400 mt-2">
          {investmentScore >= 80 ? '极佳的投资机会' :
           investmentScore >= 60 ? '良好的投资选择' :
           investmentScore >= 40 ? '一般的投资机会' : '需谨慎考虑'}
        </p>
      </div>
      
      {/* 地块特性 */}
      <div>
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-400" />
          地块特性
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FeatureCard
            icon={<typeConfig.icon className="w-5 h-5" />}
            label="地块类型"
            value={typeConfig.name}
            description={typeConfig.description}
          />
          <FeatureCard
            icon={<MapPin className="w-5 h-5" />}
            label="位置坐标"
            value={`(${plot.coordinates.x}, ${plot.coordinates.y})`}
            description="城市网格位置"
          />
          <FeatureCard
            icon={<Building2 className="w-5 h-5" />}
            label="建筑状态"
            value={plot.building ? '已建设' : '空地'}
            description={plot.building?.name || '可自由开发'}
          />
          <FeatureCard
            icon={<Activity className="w-5 h-5" />}
            label="年化收益"
            value={`${((plot.monthlyYield * 12 / plot.price) * 100).toFixed(1)}%`}
            description="预期年化收益率"
          />
          <FeatureCard
            icon={<Percent className="w-5 h-5" />}
            label="升值潜力"
            value={`+${((plot.appreciationRate || 0.08) * 100).toFixed(0)}%`}
            description="预期年升值率"
          />
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            label="人流等级"
            value={`${plot.trafficFlow || 0}级`}
            description={
              plot.trafficFlow && plot.trafficFlow >= 4 ? '高人流量' :
              plot.trafficFlow && plot.trafficFlow >= 2 ? '中等人流' : '普通人流'
            }
          />
        </div>
      </div>
      
      {/* 位置优势 */}
      {(plot.features?.length || plot.nearSubway) && (
        <div>
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            位置优势
          </h4>
          <div className="flex flex-wrap gap-2">
            {plot.nearSubway && (
              <LocationTag icon="🚇" label="地铁站旁" color="blue" />
            )}
            {plot.features?.map((feature, i) => (
              <LocationTag key={i} label={feature} />
            ))}
            {nearbyStats.commercialCount > 3 && (
              <LocationTag icon="🛍️" label="商业繁华" color="orange" />
            )}
            {nearbyStats.hasSubway && !plot.nearSubway && (
              <LocationTag icon="🚶" label="步行可达地铁" color="blue" />
            )}
          </div>
        </div>
      )}
      
      {/* 风险提示 */}
      <RiskAssessment plot={plot} nearbyStats={nearbyStats} />
    </motion.div>
  )
}

// 特性卡片
function FeatureCard({
  icon,
  label,
  value,
  description
}: {
  icon: React.ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}

// 位置标签
function LocationTag({
  icon,
  label,
  color = 'gray'
}: {
  icon?: string
  label: string
  color?: 'gray' | 'blue' | 'orange'
}) {
  const colorClasses = {
    gray: 'bg-gray-700',
    blue: 'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400'
  }
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-sm",
      colorClasses[color]
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  )
}

// 风险评估
function RiskAssessment({
  plot,
  nearbyStats
}: {
  plot: Plot
  nearbyStats: any
}) {
  const risks = []
  const opportunities = []
  
  // 风险分析
  if (plot.price > nearbyStats.avgPrice * 1.2) {
    risks.push({ level: 'medium', text: '价格高于周边均价20%' })
  }
  if (!plot.nearSubway && !nearbyStats.hasSubway) {
    risks.push({ level: 'low', text: '距离地铁站较远' })
  }
  if (plot.type === 'industrial' || plot.type === 'agricultural') {
    risks.push({ level: 'low', text: '商业潜力有限' })
  }
  
  // 机会分析
  if (plot.nearSubway) {
    opportunities.push({ level: 'high', text: '地铁站旁，升值潜力大' })
  }
  if (plot.price < nearbyStats.avgPrice * 0.8) {
    opportunities.push({ level: 'high', text: '价格低于市场均价' })
  }
  if (nearbyStats.commercialCount > 3) {
    opportunities.push({ level: 'medium', text: '周边商业氛围浓厚' })
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 投资机会 */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h5 className="font-bold mb-3 flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          投资机会
        </h5>
        {opportunities.length > 0 ? (
          <ul className="space-y-2">
            {opportunities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-400 mt-0.5" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">暂无特别优势</p>
        )}
      </div>
      
      {/* 风险提示 */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h5 className="font-bold mb-3 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          风险提示
        </h5>
        {risks.length > 0 ? (
          <ul className="space-y-2">
            {risks.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ArrowDownRight className="w-4 h-4 text-red-400 mt-0.5" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">风险较低</p>
        )}
      </div>
    </div>
  )
}

// 商店标签页
function ShopTab({
  building,
  plot
}: {
  building: Plot['building']
  plot: Plot
}) {
  if (!building) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={ANIMATION_CONFIG.fast}
      className="p-4 md:p-6 space-y-6"
    >
      {/* 商店信息卡片 */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="text-5xl bg-gray-700/50 p-4 rounded-lg">
            {building.icon}
          </div>
          <div className="flex-1">
            <h5 className="text-2xl font-bold text-white mb-2">{building.name}</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">经营类型：</span>
                <span className="text-white ml-1">{building.category || '综合'}</span>
              </div>
              <div>
                <span className="text-gray-400">营业时间：</span>
                <span className="text-white ml-1">{building.openTime || '24小时'}</span>
              </div>
              <div>
                <span className="text-gray-400">店铺等级：</span>
                <span className="text-white ml-1">
                  {[...Array(building.level)].map((_, i) => '⭐').join('')}
                </span>
              </div>
              {building.floors && (
                <div>
                  <span className="text-gray-400">建筑楼层：</span>
                  <span className="text-white ml-1">{building.floors}层</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 运营数据 */}
      <div>
        <h5 className="font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          运营数据
        </h5>
        
        <div className="space-y-4">
          {/* 人气指数 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">人气指数</span>
              <span className="text-sm font-bold text-white">{building.popularity}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  building.popularity && building.popularity > 80 
                    ? "bg-gradient-to-r from-red-500 to-orange-500" 
                    : building.popularity && building.popularity > 60 
                    ? "bg-gradient-to-r from-yellow-500 to-green-500" 
                    : "bg-gradient-to-r from-green-500 to-blue-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${building.popularity}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {building.popularity && building.popularity > 80 ? '🔥 火爆经营中' :
               building.popularity && building.popularity > 60 ? '📈 生意兴隆' :
               '💼 正常营业'}
            </p>
          </div>
          
          {/* 营业数据 */}
          <div className="grid grid-cols-2 gap-3">
            <DataCard
              icon={<DollarSign className="w-5 h-5 text-green-500" />}
              label="日均营收"
              value={formatCurrency(building.dailyRevenue || 0)}
              trend="+12.5%"
            />
            <DataCard
              icon={<Users className="w-5 h-5 text-blue-500" />}
              label="日均客流"
              value={formatNumber(
                Math.floor((building.popularity || 0) * (plot.trafficFlow || 1) * 50)
              )}
              trend="+8.3%"
            />
            <DataCard
              icon={<Clock className="w-5 h-5 text-purple-500" />}
              label="营业时长"
              value={building.openTime === '24小时' ? '24h' : '14h'}
              trend="稳定"
            />
            <DataCard
              icon={<Star className="w-5 h-5 text-yellow-500" />}
              label="顾客评分"
              value="4.8"
              trend="优秀"
            />
          </div>
          
          {/* 营业状态 */}
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-sm text-green-400">营业状态</span>
            <span className="flex items-center gap-2 text-green-400 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              正常营业
            </span>
          </div>
        </div>
      </div>
      
      {/* 升级建议 */}
      {building.level < 5 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h5 className="font-bold mb-2 text-blue-400">升级建议</h5>
          <p className="text-sm text-gray-300 mb-3">
            当前店铺等级为{building.level}级，升级到{building.level + 1}级可获得：
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <span>日收入提升20%</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <span>人气值上限+10</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <span>解锁新的装修风格</span>
            </li>
          </ul>
        </div>
      )}
    </motion.div>
  )
}

// 数据卡片
function DataCard({
  icon,
  label,
  value,
  trend
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend: string
}) {
  const isPositive = trend.startsWith('+')
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-bold text-lg">{value}</p>
      <p className={cn(
        "text-xs mt-1",
        isPositive ? "text-green-400" : "text-gray-500"
      )}>
        {trend}
      </p>
    </div>
  )
}

// 分析标签页
function AnalysisTab({
  plot,
  nearbyStats,
  investmentScore
}: {
  plot: Plot
  nearbyStats: any
  investmentScore: number
}) {
  const yieldRate = (plot.monthlyYield * 12 / plot.price) * 100
  const paybackMonths = Math.ceil(plot.price / plot.monthlyYield)
  const fiveYearReturn = plot.monthlyYield * 60 + plot.price * (1 + (plot.appreciationRate || 0.08) * 5)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
