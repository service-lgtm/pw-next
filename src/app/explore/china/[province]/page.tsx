'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Building2, TrendingUp, Search,
  Filter, Grid3X3, Map as MapIcon, Zap, Star,
  ShoppingBag, Home, Factory, Trees, Landmark,
  Lock, Unlock, Construction, Store, Eye,
  Package, Coins, Timer, Users, AlertCircle,
  Flame, Trophy, Crown, Diamond, Layers,
  Activity, Droplets, Sun, CloudRain, Wind,
  Menu, X, Wallet, Bell, User, ChevronDown,
  Info, HelpCircle, Settings, LogIn
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// 类型定义保持不变
interface Plot {
  id: string
  districtId: string
  name: string
  type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'special' | 'landmark' | 'protected'
  coordinates: { x: number; y: number }
  size: { width: number; height: number }
  price: number
  monthlyYield: number
  owned: boolean
  ownerId?: string
  building?: {
    type: 'shop' | 'apartment' | 'factory' | 'farm' | 'landmark' | 'mall' | 'office'
    name: string
    icon: string
    level: number
    floors?: number
    popularity?: number
  }
  status: 'available' | 'owned' | 'building' | 'rented' | 'protected'
  features?: string[]
  nearSubway?: boolean
  trafficFlow?: number
}

// 用户状态模拟
interface UserState {
  isLoggedIn: boolean
  username?: string
  balance?: {
    tdb: number
    yld: number
  }
  ownedPlots?: number
  totalInvestment?: number
  monthlyIncome?: number
}

// 移动端检测 Hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

// 顶部导航栏组件
function TopNavigation({ user, onLogin }: { user: UserState; onLogin: () => void }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isMobile = useIsMobile()
  
  return (
    <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo和标题 */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <Link href="/explore/china" className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold text-white">平行世界</span>
            </Link>
          </div>
          
          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-400 hover:text-white transition-colors">世界地图</Link>
            <Link href="/market" className="text-gray-400 hover:text-white transition-colors">交易市场</Link>
            <Link href="/recruit" className="text-gray-400 hover:text-white transition-colors">招聘大厅</Link>
            <Link href="/shop" className="text-gray-400 hover:text-white transition-colors">商城</Link>
          </nav>
          
          {/* 用户信息 */}
          <div className="flex items-center gap-3">
            {user.isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <Wallet className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-medium">{user.balance?.tdb.toLocaleString()} TDB</span>
                  </button>
                  <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  {!isMobile && <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg font-medium hover:bg-gold-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      <AnimatePresence>
        {showMobileMenu && isMobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-800"
          >
            <nav className="p-4 space-y-3">
              <Link href="/explore" className="block text-gray-400 hover:text-white transition-colors">世界地图</Link>
              <Link href="/market" className="block text-gray-400 hover:text-white transition-colors">交易市场</Link>
              <Link href="/recruit" className="block text-gray-400 hover:text-white transition-colors">招聘大厅</Link>
              <Link href="/shop" className="block text-gray-400 hover:text-white transition-colors">商城</Link>
              {user.isLoggedIn && (
                <>
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-gold-500" />
                      <span>TDB: {user.balance?.tdb.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <Coins className="w-4 h-4 text-green-500" />
                      <span>YLD: {user.balance?.yld.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 用户菜单下拉 */}
      <AnimatePresence>
        {showUserMenu && user.isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-800">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-400 mt-1">欢迎回来！</p>
            </div>
            <div className="p-2">
              <Link href="/assets" className="block px-3 py-2 hover:bg-gray-800 rounded transition-colors">NFT仓库</Link>
              <Link href="/mining" className="block px-3 py-2 hover:bg-gray-800 rounded transition-colors">挖矿中心</Link>
              <Link href="/shop/manage" className="block px-3 py-2 hover:bg-gray-800 rounded transition-colors">我的商店</Link>
              <Link href="/settings" className="block px-3 py-2 hover:bg-gray-800 rounded transition-colors">账户设置</Link>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded transition-colors text-red-500">
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 游客提示组件
function GuestPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-50"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gold-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">需要登录才能使用此功能</h4>
          <p className="text-sm text-gray-400 mb-3">登录后可以购买地块、开始挖矿赚钱</p>
          <div className="flex gap-2">
            <button
              onClick={onLogin}
              className="px-4 py-2 bg-gold-500 text-black rounded font-medium hover:bg-gold-600 transition-colors"
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

// 加载骨架屏组件
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-10 gap-1">
        {[...Array(150)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded" />
        ))}
      </div>
    </div>
  )
}

// 错误提示组件
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">加载失败</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gold-500 text-black rounded font-medium hover:bg-gold-600 transition-colors"
      >
        重试
      </button>
    </div>
  )
}

// 新手引导组件
function TutorialOverlay({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const tutorials = [
    {
      title: "欢迎来到平行世界",
      content: "在这里，您可以购买数字地块，建设自己的虚拟帝国",
      position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    },
    {
      title: "选择地块",
      content: "绿色地块表示可购买，点击查看详情",
      position: { top: '200px', left: '20px' }
    },
    {
      title: "数据可视化",
      content: "使用热力图查看价格分布和人流热度",
      position: { top: '100px', right: '20px' }
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
        className="absolute bg-gray-900 border border-gold-500 rounded-lg p-6 max-w-sm"
        style={current.position}
      >
        <h3 className="text-lg font-bold mb-2">{current.title}</h3>
        <p className="text-gray-400 mb-4">{current.content}</p>
        <div className="flex justify-between">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            跳过
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-gold-500 text-black rounded font-medium hover:bg-gold-600 transition-colors"
          >
            {step < tutorials.length - 1 ? '下一步' : '开始探索'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 优化的地块配置
const PLOT_TYPES = {
  residential: {
    name: '住宅用地',
    color: '#4FC3F7',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    icon: Home,
    buildings: ['公寓', '别墅', '民宿'],
    baseYield: 0.04
  },
  commercial: {
    name: '商业用地',
    color: '#FFB74D',
    bgGradient: 'from-orange-500/20 to-yellow-500/20',
    icon: ShoppingBag,
    buildings: ['商店', '餐厅', '娱乐场所'],
    baseYield: 0.06
  },
  industrial: {
    name: '工业用地',
    color: '#81C784',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    icon: Factory,
    buildings: ['工厂', '仓库', '物流中心'],
    baseYield: 0.05
  },
  agricultural: {
    name: '农业用地',
    color: '#A1887F',
    bgGradient: 'from-amber-500/20 to-brown-500/20',
    icon: Trees,
    buildings: ['农场', '果园', '养殖场'],
    baseYield: 0.03
  },
  special: {
    name: '特殊地块',
    color: '#BA68C8',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    icon: Diamond,
    buildings: ['商业综合体', '写字楼', '酒店'],
    baseYield: 0.08
  },
  landmark: {
    name: '地标建筑',
    color: '#FFD700',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
    icon: Crown,
    buildings: [],
    baseYield: 0.1
  },
  protected: {
    name: '保护区域',
    color: '#9E9E9E',
    bgGradient: 'from-gray-500/20 to-gray-600/20',
    icon: Lock,
    buildings: [],
    baseYield: 0
  }
}

// 北京城市配置
const BEIJING_CONFIG = {
  gridSize: { width: 20, height: 15 },
  landmarks: [
    {
      id: 'tiananmen',
      name: '天安门广场',
      coordinates: { x: 9, y: 7 },
      size: { width: 2, height: 2 },
      icon: '🏛️',
      type: 'landmark',
      building: { type: 'landmark', name: '天安门', icon: '🏛️', level: 5, popularity: 100 }
    },
    {
      id: 'forbidden-city',
      name: '故宫',
      coordinates: { x: 9, y: 5 },
      size: { width: 2, height: 2 },
      icon: '🏯',
      type: 'protected',
      building: { type: 'landmark', name: '紫禁城', icon: '🏯', level: 5, popularity: 100 }
    }
  ],
  subwayStations: [
    { name: '天安门东', x: 11, y: 7, lines: ['1号线'] },
    { name: '国贸', x: 14, y: 8, lines: ['1号线', '10号线'] }
  ]
}

// 商店配置数据
const SHOP_CONFIGS = {
  commercial: [
    { name: '星巴克', icon: '☕', type: 'shop', category: '咖啡店', popularity: 85 },
    { name: '肯德基', icon: '🍗', type: 'shop', category: '快餐店', popularity: 90 },
    { name: '麦当劳', icon: '🍔', type: 'shop', category: '快餐店', popularity: 88 },
    { name: '711便利店', icon: '🏪', type: 'shop', category: '便利店', popularity: 75 },
    { name: '全家便利店', icon: '🏬', type: 'shop', category: '便利店', popularity: 73 },
    { name: '永辉超市', icon: '🛒', type: 'shop', category: '超市', popularity: 70 },
    { name: '海底捞', icon: '🍲', type: 'shop', category: '餐厅', popularity: 95 },
    { name: '优衣库', icon: '👕', type: 'shop', category: '服装店', popularity: 80 },
    { name: 'NIKE', icon: '👟', type: 'shop', category: '运动品牌', popularity: 85 },
    { name: '苹果店', icon: '📱', type: 'shop', category: '电子产品', popularity: 92 }
  ],
  residential: [
    { name: '小区便利店', icon: '🏪', type: 'shop', category: '便利店', popularity: 60 },
    { name: '社区药店', icon: '💊', type: 'shop', category: '药店', popularity: 65 },
    { name: '水果店', icon: '🍎', type: 'shop', category: '生鲜店', popularity: 70 },
    { name: '理发店', icon: '💈', type: 'shop', category: '生活服务', popularity: 55 },
    { name: '快递驿站', icon: '📦', type: 'shop', category: '物流服务', popularity: 80 }
  ],
  industrial: [
    { name: '物流中心', icon: '🚚', type: 'factory', category: '物流', popularity: 60 },
    { name: '加工厂', icon: '🏭', type: 'factory', category: '制造业', popularity: 50 },
    { name: '仓储中心', icon: '📦', type: 'factory', category: '仓储', popularity: 55 }
  ],
  agricultural: [
    { name: '农产品市场', icon: '🌾', type: 'farm', category: '农贸', popularity: 65 },
    { name: '果园', icon: '🍑', type: 'farm', category: '种植', popularity: 60 },
    { name: '养殖场', icon: '🐄', type: 'farm', category: '养殖', popularity: 55 }
  ]
}

// 知名品牌店铺（特殊地块）
const FAMOUS_BRANDS = [
  { name: '国贸商城', icon: '🛍️', type: 'mall', floors: 6, popularity: 95 },
  { name: '太古里', icon: '🏬', type: 'mall', floors: 4, popularity: 92 },
  { name: '王府井百货', icon: '🏢', type: 'mall', floors: 8, popularity: 88 },
  { name: '西单大悦城', icon: '🎪', type: 'mall', floors: 10, popularity: 90 }
]

// 生成城市地块数据
function generateCityPlots(cityId: string): Plot[] {
  const config = cityId === 'beijing' ? BEIJING_CONFIG : BEIJING_CONFIG
  const plots: Plot[] = []
  const occupiedCells = new Set<string>()
  
  // 先放置地标建筑
  config.landmarks.forEach(landmark => {
    const plot: Plot = {
      id: landmark.id,
      districtId: 'special',
      name: landmark.name,
      type: landmark.type as any,
      coordinates: landmark.coordinates,
      size: landmark.size,
      price: landmark.type === 'protected' ? 0 : 1000000 + Math.random() * 500000,
      monthlyYield: landmark.type === 'protected' ? 0 : 50000 + Math.random() * 20000,
      owned: true,
      ownerId: 'system',
      building: landmark.building as any,
      status: landmark.type === 'protected' ? 'protected' : 'owned',
      features: ['知名地标', '人流密集', '不可交易'],
      trafficFlow: 5
    }
    plots.push(plot)
    
    // 标记占用的格子
    for (let dx = 0; dx < landmark.size.width; dx++) {
      for (let dy = 0; dy < landmark.size.height; dy++) {
        occupiedCells.add(`${landmark.coordinates.x + dx},${landmark.coordinates.y + dy}`)
      }
    }
  })
  
  // 生成普通地块
  for (let y = 0; y < config.gridSize.height; y++) {
    for (let x = 0; x < config.gridSize.width; x++) {
      if (occupiedCells.has(`${x},${y}`)) continue
      
      const nearSubway = config.subwayStations.some(station => 
        Math.abs(station.x - x) <= 1 && Math.abs(station.y - y) <= 1
      )
      
      const nearRoad = y === 7 || x === 3 || x === 17 || y === 3 || y === 12
      
      // 根据位置决定地块类型
      let type: Plot['type'] = 'residential'
      if (nearSubway || nearRoad) {
        type = Math.random() > 0.3 ? 'commercial' : 'residential'
      } else if (x < 4 || x > 16 || y < 3 || y > 12) {
        type = Math.random() > 0.5 ? 'industrial' : 'agricultural'
      } else {
        const rand = Math.random()
        if (rand > 0.7) type = 'commercial'
        else if (rand > 0.4) type = 'residential'
        else type = 'industrial'
      }
      
      const distanceFromCenter = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 7, 2))
      const basePrice = type === 'commercial' ? 80000 : 
                       type === 'residential' ? 60000 :
                       type === 'industrial' ? 40000 : 20000
      
      let priceMultiplier = 1
      if (nearSubway) priceMultiplier *= 1.5
      if (nearRoad) priceMultiplier *= 1.2
      priceMultiplier *= (1 - distanceFromCenter * 0.03)
      
      const price = Math.floor(basePrice * priceMultiplier + Math.random() * 10000)
      const baseYield = PLOT_TYPES[type].baseYield
      
      // 决定是否有建筑和商店
      const hasBuilding = Math.random() > 0.4 // 60%的地块有建筑
      const isOwned = hasBuilding || Math.random() > 0.7
      
      let building = undefined
      if (hasBuilding) {
        // 根据地块类型选择合适的商店
        const shopOptions = SHOP_CONFIGS[type] || SHOP_CONFIGS.commercial
        const selectedShop = shopOptions[Math.floor(Math.random() * shopOptions.length)]
        
        // 特殊位置可能有知名品牌
        const isFamousBrand = (nearSubway || nearRoad) && Math.random() > 0.8
        if (isFamousBrand && type === 'commercial') {
          const brand = FAMOUS_BRANDS[Math.floor(Math.random() * FAMOUS_BRANDS.length)]
          building = {
            type: brand.type as any,
            name: brand.name,
            icon: brand.icon,
            level: Math.floor(Math.random() * 3) + 3, // 3-5级
            floors: brand.floors,
            popularity: brand.popularity
          }
        } else {
          building = {
            type: selectedShop.type as any,
            name: selectedShop.name,
            icon: selectedShop.icon,
            level: Math.floor(Math.random() * 3) + 1, // 1-3级
            floors: type === 'commercial' ? Math.floor(Math.random() * 3) + 1 : undefined,
            popularity: selectedShop.popularity + Math.floor(Math.random() * 10) - 5
          }
        }
      }
      
      const plot: Plot = {
        id: `plot-${x}-${y}`,
        districtId: x < 10 ? 'west' : 'east',
        name: `地块${String(y * config.gridSize.width + x + 1).padStart(3, '0')}`,
        type,
        coordinates: { x, y },
        size: { width: 1, height: 1 },
        price,
        monthlyYield: Math.floor(price * baseYield * (nearSubway ? 1.3 : 1) * (building ? 1.2 : 1)),
        owned: isOwned,
        ownerId: isOwned ? `user${Math.floor(Math.random() * 1000)}` : undefined,
        building,
        status: isOwned ? 'owned' : 'available',
        features: nearSubway ? ['地铁沿线'] : nearRoad ? ['临街商铺'] : [],
        nearSubway,
        trafficFlow: nearSubway ? 4 : nearRoad ? 3 : Math.floor(Math.random() * 3) + 1
      }
      
      plots.push(plot)
    }
  }
  
  return plots
}

// 优化的地块网格组件（支持移动端）
function PlotGrid({
  plots,
  selectedPlot,
  onPlotClick,
  showHeatmap,
  heatmapType,
  isMobile
}: {
  plots: Plot[]
  selectedPlot: Plot | null
  onPlotClick: (plot: Plot) => void
  showHeatmap: boolean
  heatmapType: 'price' | 'traffic' | 'yield'
  isMobile: boolean
}) {
  const config = BEIJING_CONFIG
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // 移动端触摸优化
  const handleTouchStart = useCallback((plot: Plot) => {
    if (isMobile && plot.status !== 'protected') {
      onPlotClick(plot)
    }
  }, [isMobile, onPlotClick])
  
  // 计算热力图颜色
  const getHeatmapColor = useCallback((plot: Plot) => {
    if (!showHeatmap) return 'transparent'
    
    let value = 0
    let maxValue = 1
    
    switch (heatmapType) {
      case 'price':
        value = plot.price
        maxValue = Math.max(...plots.map(p => p.price))
        break
      case 'traffic':
        value = plot.trafficFlow || 0
        maxValue = 5
        break
      case 'yield':
        value = plot.monthlyYield
        maxValue = Math.max(...plots.map(p => p.monthlyYield))
        break
    }
    
    const intensity = value / maxValue
    const opacity = 0.3 + intensity * 0.4
    
    if (heatmapType === 'price') return `rgba(255, 215, 0, ${opacity})`
    if (heatmapType === 'traffic') return `rgba(255, 99, 71, ${opacity})`
    return `rgba(0, 255, 136, ${opacity})`
  }, [showHeatmap, heatmapType, plots])
  
  // 移动端缩放
  const gridScale = isMobile ? 0.6 : 1
  const cellSize = isMobile ? 60 : 100
  
  return (
    <div className="relative bg-gray-900/50 rounded-2xl p-4 md:p-6 overflow-auto">
      {/* 地图图例 */}
      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur p-2 md:p-3 rounded-lg z-20">
        <h4 className="text-xs font-bold text-white mb-1 md:mb-2">图例</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded" />
            <span className="text-xs">可购买</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-500 rounded" />
            <span className="text-xs">已售出</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-gold-500 rounded" />
            <span className="text-xs">地标</span>
          </div>
        </div>
      </div>
      
      {/* 地图网格 */}
      <div 
        ref={gridRef}
        className="relative mx-auto"
        style={{ 
          width: config.gridSize.width * cellSize,
          transform: `scale(${gridScale})`,
          transformOrigin: 'top left'
        }}
      >
        {/* 地铁站标记 */}
        {config.subwayStations.map(station => (
          <motion.div
            key={station.name}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: station.x * cellSize + cellSize / 2,
              top: station.y * cellSize + cellSize / 2,
              width: 40,
              height: 40,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
              <div className="relative bg-blue-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold">
                M
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* 地块网格 */}
        <div 
          className="relative grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${config.gridSize.height}, ${cellSize}px)`
          }}
        >
          {plots.map(plot => (
            <PlotItem
              key={plot.id}
              plot={plot}
              isSelected={selectedPlot?.id === plot.id}
              isHovered={!isMobile && hoveredPlot?.id === plot.id}
              onClick={() => plot.status !== 'protected' && onPlotClick(plot)}
              onMouseEnter={() => !isMobile && setHoveredPlot(plot)}
              onMouseLeave={() => !isMobile && setHoveredPlot(null)}
              onTouchStart={() => handleTouchStart(plot)}
              heatmapColor={getHeatmapColor(plot)}
              cellSize={cellSize}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
      
      {/* 悬浮信息（仅桌面端） */}
      {!isMobile && (
        <AnimatePresence>
          {hoveredPlot && (
            <PlotTooltip plot={hoveredPlot} cellSize={cellSize} />
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// 优化的地块项组件 - 增强商店展示
function PlotItem({
  plot,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  heatmapColor,
  cellSize,
  isMobile
}: {
  plot: Plot
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onTouchStart: () => void
  heatmapColor: string
  cellSize: number
  isMobile: boolean
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  
  const gridStyle = {
    gridColumn: `${plot.coordinates.x + 1} / span ${plot.size.width}`,
    gridRow: `${plot.coordinates.y + 1} / span ${plot.size.height}`,
    width: plot.size.width * cellSize - 4,
    height: plot.size.height * cellSize - 4
  }
  
  // 判断是否是知名品牌
  const isFamousBrand = plot.building && (plot.building.type === 'mall' || plot.building.popularity > 85)
  
  return (
    <motion.div
      className={cn(
        "relative rounded-lg cursor-pointer overflow-hidden",
        "transition-all duration-200",
        plot.status === 'protected' ? 'cursor-not-allowed' : '',
        isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10'
      )}
      style={gridStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isSelected ? 1.05 : 1,
        boxShadow: isSelected ? '0 0 30px rgba(255, 215, 0, 0.5)' : 'none'
      }}
      transition={{ delay: plot.coordinates.y * 0.01 + plot.coordinates.x * 0.01 }}
    >
      {/* 热力图背景 */}
      {heatmapColor && (
        <div className="absolute inset-0" style={{ backgroundColor: heatmapColor }} />
      )}
      
      {/* 地块背景 */}
      <div 
        className={cn(
          "absolute inset-0 border-2",
          plot.type === 'landmark' ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30' :
          plot.type === 'protected' ? 'bg-gray-800/50' :
          `bg-gradient-to-br ${typeConfig.bgGradient}`,
          plot.status === 'available' ? 'border-green-500' :
          plot.status === 'protected' ? 'border-gray-600' :
          plot.type === 'landmark' ? 'border-gold-500' :
          isFamousBrand ? 'border-purple-500' :
          'border-gray-700'
        )}
      />
      
      {/* 建筑和商店展示 */}
      <div className="relative w-full h-full p-1 md:p-2 flex flex-col">
        {/* 顶部状态栏 */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex gap-1">
            {plot.features?.includes('地铁沿线') && !isMobile && (
              <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">M</span>
            )}
            {isFamousBrand && (
              <span className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded">品牌</span>
            )}
          </div>
          <div className="flex gap-1">
            {plot.building?.popularity && plot.building.popularity > 80 && (
              <Flame className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            )}
            {plot.status === 'available' && (
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
        
        {/* 中心内容 - 商店展示 */}
        <div className="flex-1 flex items-center justify-center">
          {plot.building ? (
            <div className="text-center relative">
              {/* 建筑楼层背景效果 */}
              {plot.building.floors && plot.building.floors > 1 && !isMobile && (
                <div className="absolute inset-0 -z-10">
                  {[...Array(Math.min(plot.building.floors, 3))].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 bg-gray-700/20 rounded"
                      style={{
                        transform: `translateY(${-(i + 1) * 2}px) translateX(${(i + 1) * 2}px)`,
                        zIndex: -i
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* 商店图标 */}
              <div className={cn(
                "text-2xl md:text-3xl mb-1",
                isFamousBrand && "animate-pulse"
              )}>
                {plot.building.icon}
              </div>
              
              {/* 商店名称 */}
              {!isMobile && (
                <div className="text-xs font-medium text-white/90 px-1">
                  {plot.building.name}
                </div>
              )}
              
              {/* 商店等级 */}
              {plot.building.level > 1 && !isMobile && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {[...Array(Math.min(plot.building.level, 5))].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-2 h-2 fill-yellow-500 text-yellow-500" 
                    />
                  ))}
                </div>
              )}
              
              {/* 楼层数显示 */}
              {plot.building.floors && plot.building.floors > 3 && !isMobile && (
                <div className="absolute -top-1 -right-1 bg-black/70 text-xs px-1 rounded">
                  {plot.building.floors}F
                </div>
              )}
            </div>
          ) : plot.status === 'available' ? (
            <div className="text-center">
              <Icon className="w-5 h-5 md:w-8 md:h-8 text-white/20 mb-1" />
              {!isMobile && (
                <div className="text-xs text-green-400 font-medium">可开店</div>
              )}
            </div>
          ) : (
            <Icon className="w-5 h-5 md:w-8 md:h-8 text-white/20" />
          )}
        </div>
        
        {/* 底部信息 */}
        {plot.status !== 'protected' && !isMobile && (
          <div className="text-center">
            {plot.status === 'available' ? (
              <div className="text-xs font-bold text-green-400">
                ¥{(plot.price/10000).toFixed(1)}万
              </div>
            ) : plot.building && (
              <div className="text-xs text-gray-400">
                营业中
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 人流动画 - 商业区增强 */}
      {plot.building && plot.trafficFlow && plot.trafficFlow > 2 && (
        <TrafficAnimation level={plot.trafficFlow} isCommercial={plot.type === 'commercial'} />
      )}
      
      {/* 营业状态光效 */}
      {plot.building && plot.status === 'owned' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
      )}
    </motion.div>
  )
}

// 增强的人流动画组件
function TrafficAnimation({ level, isCommercial }: { level: number; isCommercial: boolean }) {
  const particleCount = isCommercial ? level * 2 : level - 2
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(Math.max(particleCount, 0))].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full",
            isCommercial ? "bg-yellow-400" : "bg-blue-400"
          )}
          initial={{ 
            x: Math.random() < 0.5 ? -10 : 110, 
            y: Math.random() * 100 
          }}
          animate={{
            x: Math.random() < 0.5 ? 110 : -10,
            y: Math.random() * 100
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// 地块悬浮提示（优化性能）- 增强商店信息展示
const PlotTooltip = React.memo(({ plot, cellSize }: { plot: Plot; cellSize: number }) => {
  const typeConfig = PLOT_TYPES[plot.type]
  
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        left: (plot.coordinates.x + plot.size.width / 2) * cellSize,
        top: (plot.coordinates.y + plot.size.height) * cellSize + 10
      }}
    >
      <div className="bg-black/90 backdrop-blur rounded-lg p-3 text-sm min-w-[200px]">
        <div className="font-bold text-white mb-1">{plot.name}</div>
        <div className="text-xs text-gray-400 mb-2">{typeConfig.name}</div>
        
        {/* 商店信息 */}
        {plot.building && (
          <div className="border-t border-gray-700 pt-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{plot.building.icon}</span>
              <div>
                <div className="text-xs font-medium text-white">{plot.building.name}</div>
                <div className="text-xs text-gray-500">
                  Lv.{plot.building.level} {plot.building.floors && `· ${plot.building.floors}层`}
                </div>
              </div>
            </div>
            {plot.building.popularity && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-400">人气值:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      plot.building.popularity > 80 ? "bg-red-500" : 
                      plot.building.popularity > 60 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${plot.building.popularity}%` }}
                  />
                </div>
                <span className="text-white font-medium">{plot.building.popularity}</span>
              </div>
            )}
          </div>
        )}
        
        {/* 财务信息 */}
        <div className="flex items-center gap-3 text-xs">
          {plot.status === 'available' ? (
            <>
              <span className="text-green-400">¥{(plot.price/10000).toFixed(1)}万</span>
              <span className="text-yellow-400">预计+{plot.monthlyYield}/月</span>
            </>
          ) : (
            <>
              <span className="text-gray-400">已售出</span>
              <span className="text-yellow-400">+{plot.monthlyYield}/月</span>
            </>
          )}
        </div>
        
        {/* 特性标签 */}
        {plot.features && plot.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {plot.features.map((feature, i) => (
              <span key={i} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
        
        {/* 营业状态 */}
        {plot.building && plot.status === 'owned' && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400">营业中</span>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// 优化的筛选面板（移动端适配）
function FilterPanel({
  filters,
  onFilterChange,
  onToggleHeatmap,
  showHeatmap,
  heatmapType,
  onHeatmapTypeChange,
  user,
  isMobile
}: {
  filters: any
  onFilterChange: (key: string, value: string) => void
  onToggleHeatmap: () => void
  showHeatmap: boolean
  heatmapType: string
  onHeatmapTypeChange: (type: string) => void
  user: UserState
  isMobile: boolean
}) {
  const [showFilters, setShowFilters] = useState(!isMobile)
  
  if (isMobile && !showFilters) {
    return (
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gold-500 text-black rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <Filter className="w-6 h-6" />
      </button>
    )
  }
  
  return (
    <motion.div
      initial={isMobile ? { x: '-100%' } : { opacity: 1 }}
      animate={isMobile ? { x: 0 } : { opacity: 1 }}
      exit={isMobile ? { x: '-100%' } : { opacity: 0 }}
      className={cn(
        "space-y-4",
        isMobile && "fixed left-0 top-0 h-full w-80 bg-gray-900 z-40 p-4 overflow-y-auto"
      )}
    >
      {isMobile && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">筛选条件</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* 原有筛选功能 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-4">筛选条件</h3>
        
        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索地块..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        {/* 快捷筛选 */}
        <div className="space-y-2">
          <button
            onClick={() => onFilterChange('special', 'subway')}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <MapPin className="w-4 h-4 text-blue-500" />
            地铁沿线地块
          </button>
          <button
            onClick={() => onFilterChange('special', 'landmark')}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Crown className="w-4 h-4 text-gold-500" />
            地标周边地块
          </button>
          <button
            onClick={() => onFilterChange('special', 'highTraffic')}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-red-500" />
            高人流量地块
          </button>
        </div>
      </div>
      
      {/* 数据可视化 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-4">数据可视化</h3>
        
        <div className="space-y-3">
          <button
            onClick={onToggleHeatmap}
            className={cn(
              "w-full py-2 px-3 rounded-lg text-sm font-medium transition-all",
              showHeatmap ? "bg-gold-500 text-black" : "bg-gray-800 text-gray-400"
            )}
          >
            {showHeatmap ? '关闭热力图' : '显示热力图'}
          </button>
          
          {showHeatmap && (
            <div className="space-y-2">
              <button
                onClick={() => onHeatmapTypeChange('price')}
                className={cn(
                  "w-full py-2 px-3 rounded-lg text-sm flex items-center gap-2",
                  heatmapType === 'price' ? "bg-gold-500/20 text-gold-500" : "bg-gray-800 text-gray-400"
                )}
              >
                <Coins className="w-4 h-4" />
                价格分布
              </button>
              <button
                onClick={() => onHeatmapTypeChange('traffic')}
                className={cn(
                  "w-full py-2 px-3 rounded-lg text-sm flex items-center gap-2",
                  heatmapType === 'traffic' ? "bg-red-500/20 text-red-500" : "bg-gray-800 text-gray-400"
                )}
              >
                <Users className="w-4 h-4" />
                人流热度
              </button>
              <button
                onClick={() => onHeatmapTypeChange('yield')}
                className={cn(
                  "w-full py-2 px-3 rounded-lg text-sm flex items-center gap-2",
                  heatmapType === 'yield' ? "bg-green-500/20 text-green-500" : "bg-gray-800 text-gray-400"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                收益率
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 投资组合分析 */}
      {user.isLoggedIn && (
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4">我的投资</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">持有地块</span>
              <span className="font-bold">{user.ownedPlots || 0}个</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">总投资</span>
              <span className="font-bold text-gold-500">
                ¥{((user.totalInvestment || 0) / 10000).toFixed(1)}万
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">月收益</span>
              <span className="font-bold text-green-500">
                +¥{((user.monthlyIncome || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">收益率</span>
              <span className="font-bold text-blue-500">
                {user.totalInvestment ? 
                  ((user.monthlyIncome || 0) * 12 / user.totalInvestment * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
            查看详细分析 →
          </button>
        </div>
      )}
    </motion.div>
  )
}

// 优化的地块详情弹窗
function PlotDetailModal({
  plot,
  nearbyPlots,
  onClose,
  onAction,
  user,
  isMobile
}: {
  plot: Plot
  nearbyPlots: Plot[]
  onClose: () => void
  onAction: (action: string) => void
  user: UserState
  isMobile: boolean
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 计算周边数据
  const nearbyStats = useMemo(() => ({
    avgPrice: nearbyPlots.reduce((sum, p) => sum + p.price, 0) / nearbyPlots.length,
    commercialCount: nearbyPlots.filter(p => p.type === 'commercial').length,
    hasSubway: nearbyPlots.some(p => p.nearSubway),
    avgTraffic: nearbyPlots.reduce((sum, p) => sum + (p.trafficFlow || 0), 0) / nearbyPlots.length
  }), [nearbyPlots])
  
  const handleBuy = async () => {
    if (!user.isLoggedIn) {
      onAction('login')
      return
    }
    
    if (user.balance && user.balance.tdb < plot.price) {
      alert('余额不足，请先充值')
      return
    }
    
    setShowConfirm(true)
  }
  
  const confirmBuy = async () => {
    setLoading(true)
    try {
      // 模拟购买请求
      await new Promise(resolve => setTimeout(resolve, 1500))
      onAction('buy')
      onClose()
    } catch (error) {
      alert('购买失败，请重试')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }
  
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
          isMobile ? "max-h-[90vh]" : "max-w-2xl max-h-[90vh]"
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className={cn(
          "relative p-4 md:p-6 border-b border-gray-800",
          plot.type === 'landmark' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20' :
          `bg-gradient-to-r ${typeConfig.bgGradient}`
        )}>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black/20 rounded-xl flex items-center justify-center">
                {plot.building ? (
                  <span className="text-3xl md:text-4xl">{plot.building.icon}</span>
                ) : (
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white/70" />
                )}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{plot.name}</h3>
                <p className="text-sm text-white/70">{typeConfig.name}</p>
                {plot.building && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm bg-black/30 px-2 py-1 rounded">
                      {plot.building.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* 关键指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">当前价格</p>
              <p className="text-lg md:text-xl font-bold text-gold-500">¥{(plot.price/10000).toFixed(1)}万</p>
            </div>
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">月收益</p>
              <p className="text-lg md:text-xl font-bold text-green-500">¥{(plot.monthlyYield/1000).toFixed(1)}k</p>
            </div>
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">人流指数</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-1.5 md:w-6 md:h-2 rounded",
                      i < (plot.trafficFlow || 0) ? "bg-red-500" : "bg-gray-700"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm text-gray-400 mb-1">位置评分</p>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gold-500" />
                <span className="text-lg md:text-xl font-bold">{plot.nearSubway ? 'A+' : 'B'}</span>
              </div>
            </div>
          </div>

          {/* 位置优势 */}
          {(plot.features?.length || plot.nearSubway) && (
            <div className="mb-6">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-500" />
                位置优势
              </h4>
              <div className="flex flex-wrap gap-2">
                {plot.nearSubway && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    🚇 地铁站旁
                  </span>
                )}
                {plot.features?.map((feature, i) => (
                  <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 投资分析 */}
          <div className="mb-6 p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
            <h4 className="font-bold mb-3 text-gold-500 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              投资分析
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">年化收益率</span>
                <span className="text-gold-500 font-bold">
                  {((plot.monthlyYield * 12 / plot.price) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">回本周期</span>
                <span className="text-white">{(plot.price / plot.monthlyYield).toFixed(0)} 个月</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {plot.status === 'available' && (
              <>
                <button
                  onClick={handleBuy}
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
          </div>
        </div>
      </motion.div>
      
      {/* 购买确认弹窗 */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">确认购买</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">地块</span>
                  <span>{plot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">价格</span>
                  <span className="text-gold-500">¥{(plot.price/10000).toFixed(1)}万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">账户余额</span>
                  <span>{user.balance?.tdb.toLocaleString()} TDB</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-400">购买后余额</span>
                  <span>{((user.balance?.tdb || 0) - plot.price).toLocaleString()} TDB</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmBuy}
                  disabled={loading}
                  className="flex-1 bg-gold-500 text-black py-2 rounded font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '处理中...' : '确认支付'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
