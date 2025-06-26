// app/explore/china/[province]/page.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// 导入自定义 hooks
import { useIsMobile, useLocalStorage, useNetworkStatus } from './hooks'

// 导入类型
import type { Plot, UserState, FilterState, Notification } from './types'

// 导入组件
import { TopNavigation, MobileBottomNav } from './components/Navigation'
import { PlotGrid } from './components/PlotGrid'
import { FilterPanel } from './components/FilterPanel'
import { PlotDetailModal } from './components/PlotDetailModal'

// 导入工具函数和常量
import { generateCityPlots, formatCurrency, sendNotification } from './utils'
import { PLOT_TYPES, CITY_CONFIGS, ACHIEVEMENTS } from './constants'

// 其他组件
import { motion } from 'framer-motion'
import { 
  Info, Loader2, AlertCircle, WifiOff, RefreshCw,
  Sparkles, TrendingUp, Activity, Users, Layers
} from 'lucide-react'

// 页面组件
export default function CityDetailPage() {
  const params = useParams()
  const cityId = params.province as string
  const isMobile = useIsMobile()
  const { isOnline } = useNetworkStatus()
  
  // 用户状态
  const [user, setUser] = useLocalStorage<UserState>('userState', {
    isLoggedIn: false
  })
  
  // 地块数据
  const [plots, setPlots] = useState<Plot[]>([])
  const [filteredPlots, setFilteredPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [showPlotDetail, setShowPlotDetail] = useState(false)
  
  // 筛选和显示状态
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmapType, setHeatmapType] = useState<'price' | 'traffic' | 'yield'>('price')
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    priceRange: 'all',
    search: '',
    special: '',
    hasShop: ''
  })
  
  // UI状态
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // 城市配置
  const cityConfig = CITY_CONFIGS[cityId] || CITY_CONFIGS.beijing
  const cityNames: Record<string, string> = {
    beijing: '北京',
    shanghai: '上海',
    guangzhou: '广州',
    shenzhen: '深圳',
    chengdu: '成都',
    hangzhou: '杭州'
  }
  const cityName = cityNames[cityId] || '未知城市'
  
  // 加载地块数据
  useEffect(() => {
    const loadPlots = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const cityPlots = generateCityPlots(cityId)
        setPlots(cityPlots)
        setFilteredPlots(cityPlots)
        
        // 检查是否需要显示教程
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
        if (!hasSeenTutorial && !user.isLoggedIn && !isMobile) {
          setShowTutorial(true)
        }
      } catch (err) {
        setError('加载地块数据失败，请检查网络连接')
      } finally {
        setLoading(false)
      }
    }
    
    loadPlots()
  }, [cityId, user.isLoggedIn, isMobile])
  
  // 筛选逻辑
  useEffect(() => {
    let filtered = [...plots]
    
    // 类型筛选
    if (filters.type !== 'all') {
      filtered = filtered.filter(p => p.type === filters.type)
    }
    
    // 状态筛选
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status)
    }
    
    // 商店筛选
    if (filters.hasShop === 'true') {
      filtered = filtered.filter(p => p.building !== undefined)
    }
    
    // 价格区间筛选
    if (filters.priceRange !== 'all') {
      const priceInWan = (price: number) => price / 10000
      switch (filters.priceRange) {
        case '0-5':
          filtered = filtered.filter(p => priceInWan(p.price) < 5)
          break
        case '5-10':
          filtered = filtered.filter(p => priceInWan(p.price) >= 5 && priceInWan(p.price) < 10)
          break
        case '10-20':
          filtered = filtered.filter(p => priceInWan(p.price) >= 10 && priceInWan(p.price) < 20)
          break
        case '20-50':
          filtered = filtered.filter(p => priceInWan(p.price) >= 20 && priceInWan(p.price) < 50)
          break
        case '50+':
          filtered = filtered.filter(p => priceInWan(p.price) >= 50)
          break
      }
    }
    
    // 特殊筛选
    if (filters.special === 'subway') {
      filtered = filtered.filter(p => p.nearSubway)
    } else if (filters.special === 'landmark') {
      filtered = filtered.filter(p => p.type === 'landmark' || p.type === 'special')
    } else if (filters.special === 'highTraffic') {
      filtered = filtered.filter(p => p.trafficFlow && p.trafficFlow >= 4)
    } else if (filters.special === 'highYield') {
      const avgYield = plots.reduce((sum, p) => sum + p.monthlyYield, 0) / plots.length
      filtered = filtered.filter(p => p.monthlyYield > avgYield * 1.2)
    } else if (filters.special === 'myPlots' && user.isLoggedIn) {
      filtered = filtered.filter(p => p.ownerId === user.username)
    }
    
    // 搜索筛选
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.building?.name.toLowerCase().includes(search) ||
        p.type.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      )
    }
    
    setFilteredPlots(filtered)
  }, [filters, plots, user.isLoggedIn, user.username])
  
  // 统计数据
  const plotStats = useMemo(() => {
    const stats = {
      total: plots.length,
      available: plots.filter(p => p.status === 'available').length,
      byType: {} as Record<string, number>
    }
    
    Object.keys(PLOT_TYPES).forEach(type => {
      stats.byType[type] = plots.filter(p => p.type === type).length
    })
    
    return stats
  }, [plots])
  
  // 市场统计（模拟数据）
  const marketStats = useMemo(() => ({
    avgPrice: plots.reduce((sum, p) => sum + p.price, 0) / plots.length || 0,
    totalVolume: 125680000,
    recentTransactions: 23
  }), [plots])
  
  // 获取周边地块
  const getNearbyPlots = useCallback((plot: Plot) => {
    return plots.filter(p => {
      const dx = Math.abs(p.coordinates.x - plot.coordinates.x)
      const dy = Math.abs(p.coordinates.y - plot.coordinates.y)
      return dx <= 2 && dy <= 2 && p.id !== plot.id
    })
  }, [plots])
  
  // 处理地块点击
  const handlePlotClick = useCallback((plot: Plot) => {
    if (!user.isLoggedIn && plot.status === 'available') {
      setShowGuestPrompt(true)
      setTimeout(() => setShowGuestPrompt(false), 5000)
      return
    }
    setSelectedPlot(plot)
    setShowPlotDetail(true)
  }, [user.isLoggedIn])
  
  // 处理地块操作
  const handlePlotAction = useCallback((action: string, data?: any) => {
    if (action === 'login') {
      handleLogin()
      return
    }
    
    if (action === 'buy' && selectedPlot && data) {
      // 更新用户状态
      const updatedUser = {
        ...user,
        ownedPlots: (user.ownedPlots || 0) + 1,
        totalInvestment: (user.totalInvestment || 0) + selectedPlot.price,
        monthlyIncome: (user.monthlyIncome || 0) + selectedPlot.monthlyYield,
        balance: user.balance ? {
          ...user.balance,
          tdb: user.balance.tdb - selectedPlot.price
        } : undefined
      }
      setUser(updatedUser)
      
      // 更新地块状态
      const updatedPlots = plots.map(p => 
        p.id === selectedPlot.id 
          ? { ...p, status: 'owned' as const, owned: true, ownerId: user.username, ownerName: user.username }
          : p
      )
      setPlots(updatedPlots)
      
      // 添加通知
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'transaction',
        title: '购买成功',
        message: `恭喜您成功购买${selectedPlot.name}！`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/assets`
      }
      setNotifications(prev => [notification, ...prev])
      
      // 发送系统通知
      if ('Notification' in window && Notification.permission === 'granted') {
        sendNotification('购买成功', {
          body: `恭喜您成功购买${selectedPlot.name}！`,
          icon: '/icon-192x192.png'
        })
      }
      
      // 检查成就
      if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach((achievement: typeof ACHIEVEMENTS.firstPurchase) => {
          const achievementNotif: Notification = {
            id: `achv-${Date.now()}-${achievement.id}`,
            type: 'achievement',
            title: '获得成就',
            message: `恭喜获得成就「${achievement.name}」：${achievement.description}`,
            timestamp: new Date(),
            read: false
          }
          setNotifications(prev => [achievementNotif, ...prev])
        })
      }
    }
    
    if (action === 'favorite' && data) {
      const updatedUser = {
        ...user,
        favoriteShops: data.action === 'add' 
          ? [...(user.favoriteShops || []), data.plotId]
          : (user.favoriteShops || []).filter(id => id !== data.plotId)
      }
      setUser(updatedUser)
    }
  }, [selectedPlot, user, plots, setUser])
  
  // 处理登录
  const handleLogin = useCallback(() => {
    setUser({
      isLoggedIn: true,
      username: '测试用户',
      level: 1,
      experience: 0,
      balance: {
        tdb: 100000,
        yld: 5000
      },
      ownedPlots: 0,
      totalInvestment: 0,
      monthlyIncome: 0,
      favoriteShops: [],
      achievements: []
    })
    setShowGuestPrompt(false)
    
    // 欢迎通知
    const welcomeNotif: Notification = {
      id: `welcome-${Date.now()}`,
      type: 'system',
      title: '欢迎来到平行世界',
      message: '您已获得100,000 TDB初始资金，开始您的投资之旅吧！',
      timestamp: new Date(),
      read: false
    }
    setNotifications([welcomeNotif])
  }, [setUser])
  
  // 处理登出
  const handleLogout = useCallback(() => {
    setUser({ isLoggedIn: false })
    setNotifications([])
  }, [setUser])
  
  // 处理教程
  const handleTutorialNext = useCallback(() => {
    if (tutorialStep < 4) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
      localStorage.setItem('hasSeenTutorial', 'true')
    }
  }, [tutorialStep])
  
  const handleTutorialSkip = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial', 'true')
  }, [])
  
  // 处理筛选变更
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])
  
  // 处理重试
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])
  
  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
      </div>
      
      {/* 顶部导航 */}
      <TopNavigation 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        notifications={notifications}
      />
      
      {/* 离线提示 */}
      {!isOnline && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 text-sm text-red-400">
            <WifiOff className="w-4 h-4" />
            <span>网络连接已断开，部分功能可能无法使用</span>
          </div>
        </div>
      )}
      
      {/* 主要内容 */}
      <div className="relative container mx-auto px-4 py-4 md:py-8">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/explore/china" 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold-500 to-orange-500 bg-clip-text text-transparent">
              {cityName}市 · 数字地产
            </h1>
          </div>
          
          {/* 快速统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              icon={<Layers className="w-5 h-5" />}
              label="总地块数"
              value={plots.length.toString()}
              suffix="个"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="可购买"
              value={plotStats.available.toString()}
              suffix="个"
              highlight="text-green-500"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="平均价格"
              value={plots.length > 0 ? formatCurrency(marketStats.avgPrice) : '¥0'}
              highlight="text-gold-500"
            />
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="平均收益率"
              value={plots.length > 0 
                ? `${(plots.reduce((sum, p) => sum + (p.monthlyYield * 12 / p.price), 0) / plots.length * 100).toFixed(1)}%`
                : '0%'
              }
              highlight="text-blue-500"
            />
          </div>
        </div>
        
        {/* 主网格布局 */}
        <div className={`grid gap-4 md:gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-[320px_1fr]"}`}>
          {/* 筛选面板 - 桌面端 */}
          {!isMobile && (
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              showHeatmap={showHeatmap}
              heatmapType={heatmapType}
              onHeatmapTypeChange={setHeatmapType}
              user={user}
              isMobile={isMobile}
              plotStats={plotStats}
              marketStats={marketStats}
            />
          )}
          
          {/* 地图区域 */}
          <div className="relative">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={handleRetry} />
            ) : filteredPlots.length === 0 ? (
              <EmptyState filters={filters} />
            ) : (
              <PlotGrid
                plots={filteredPlots}
                selectedPlot={selectedPlot}
                onPlotClick={handlePlotClick}
                showHeatmap={showHeatmap}
                heatmapType={heatmapType}
                isMobile={isMobile}
                highlightedType={filters.type !== 'all' ? filters.type : undefined}
                cityConfig={cityConfig}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端筛选按钮 */}
      {isMobile && !loading && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
          showHeatmap={showHeatmap}
          heatmapType={heatmapType}
          onHeatmapTypeChange={setHeatmapType}
          user={user}
          isMobile={isMobile}
          plotStats={plotStats}
          marketStats={marketStats}
        />
      )}
      
      {/* 移动端底部导航 */}
      {isMobile && <MobileBottomNav user={user} />}
      
      {/* 弹窗和覆盖层 */}
      <AnimatePresence>
        {showPlotDetail && selectedPlot && (
          <PlotDetailModal
            plot={selectedPlot}
            nearbyPlots={getNearbyPlots(selectedPlot)}
            onClose={() => setShowPlotDetail(false)}
            onAction={handlePlotAction}
            user={user}
            isMobile={isMobile}
          />
        )}
        
        {showTutorial && (
          <TutorialOverlay
            step={tutorialStep}
            onNext={handleTutorialNext}
            onSkip={handleTutorialSkip}
          />
        )}
        
        {showGuestPrompt && (
          <GuestPrompt onLogin={handleLogin} />
        )}
      </AnimatePresence>
    </div>
  )
}

// 统计卡片组件
function StatCard({
  icon,
  label,
  value,
  suffix,
  highlight
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix?: string
  highlight?: string
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 md:p-4">
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-lg md:text-2xl font-bold ${highlight || 'text-white'}`}>
        {value}
        {suffix && <span className="text-sm font-normal">{suffix}</span>}
      </p>
    </div>
  )
}

// 加载状态组件
function LoadingState() {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 md:p-16">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
        <p className="text-lg font-medium">加载地块数据中...</p>
        <p className="text-sm text-gray-400 mt-2">首次加载可能需要几秒钟</p>
      </div>
    </div>
  )
}

// 错误状态组件
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 md:p-16">
      <div className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">加载失败</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </div>
    </div>
  )
}

// 空状态组件
function EmptyState({ filters }: { filters: FilterState }) {
  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.status !== 'all' || 
    filters.priceRange !== 'all' || 
    filters.special !== '' || 
    filters.search !== ''
  
  return (
    <div className="bg-gray-900/50 rounded-2xl p-8 md:p-16">
      <div className="flex flex-col items-center justify-center">
        <Layers className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">没有找到地块</h3>
        <p className="text-gray-400 mb-4">
          {hasActiveFilters 
            ? '当前筛选条件下没有符合的地块' 
            : '该区域暂无可用地块'
          }
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  )
}

// 新手引导组件
function TutorialOverlay({
  step,
  onNext,
  onSkip
}: {
  step: number
  onNext: () => void
  onSkip: () => void
}) {
  const tutorials = [
    {
      title: "欢迎来到平行世界",
      content: "在这个虚拟的世界中，您可以购买地块、建设商店、赚取收益，打造属于您的商业帝国！",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "了解地块类型",
      content: "不同颜色代表不同类型的地块：蓝色住宅、橙色商业、绿色工业等，每种都有独特的收益特点。",
      position: { top: '200px', left: '50%', transform: 'translateX(-50%)' }
    },
    {
      title: "选择地块",
      content: "绿色边框表示可购买，点击地块查看详情。地铁站附近的地块通常更有价值。",
      position: { top: '300px', left: '50%', transform: 'translateX(-50%)' }
    },
    {
      title: "筛选功能",
      content: "使用左侧筛选面板快速找到心仪的地块，支持按类型、价格、位置等多维度筛选。",
      position: { top: '200px', left: '20px' }
    },
    {
      title: "数据可视化",
      content: "开启热力图可以直观看到价格分布、人流热度等数据，帮助您做出明智的投资决策。",
      position: { top: '200px', left: '20px' }
    }
  ]
  
  const current = tutorials[step]
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute bg-gray-900 border border-gold-500 rounded-lg p-6 max-w-md"
        style={current.position}
      >
        <h3 className="text-xl font-bold mb-3 text-gold-500">{current.title}</h3>
        <p className="text-gray-300 mb-6">{current.content}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            跳过教程
          </button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {tutorials.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? 'bg-gold-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onNext}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-orange-600 text-black rounded-lg font-medium hover:shadow-lg hover:shadow-gold-500/25 transition-all ml-4"
            >
              {step < tutorials.length - 1 ? '下一步' : '开始探索'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 游客提示组件
function GuestPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-40"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">需要登录才能购买地块</h4>
          <p className="text-sm text-gray-400 mb-3">
            登录后可以购买地块、建设商店、赚取收益
          </p>
          <div className="flex gap-2">
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-orange-600 text-black rounded font-medium hover:shadow-lg hover:shadow-gold-500/25 transition-all"
            >
              立即注册
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              去登录
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
