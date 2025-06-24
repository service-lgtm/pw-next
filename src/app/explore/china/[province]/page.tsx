'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Building2, TrendingUp, Search,
  Filter, Grid3X3, Map as MapIcon, Zap, Star,
  ShoppingBag, Home, Factory, Trees, Landmark,
  Lock, Unlock, Construction, Store, Eye,
  Package, Coins, Timer, Users, AlertCircle,
  Flame, Trophy, Crown, Diamond, Layers,
  Activity, Droplets, Sun, CloudRain, Wind
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// 类型定义
interface Plot {
  id: string
  districtId: string
  name: string
  type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'special' | 'landmark' | 'protected'
  coordinates: { x: number; y: number }
  size: { width: number; height: number } // 支持多格地块
  price: number
  monthlyYield: number
  owned: boolean
  ownerId?: string
  building?: {
    type: 'shop' | 'apartment' | 'factory' | 'farm' | 'landmark' | 'mall' | 'office'
    name: string
    icon: string
    level: number
    floors?: number // 楼层数
    popularity?: number // 人气值
  }
  status: 'available' | 'owned' | 'building' | 'rented' | 'protected'
  features?: string[] // 特殊属性
  nearSubway?: boolean // 是否靠近地铁
  trafficFlow?: number // 人流量 1-5
}

interface SpecialLocation {
  id: string
  name: string
  type: 'landmark' | 'subway' | 'river' | 'park' | 'road'
  coordinates: { x: number; y: number }
  size?: { width: number; height: number }
  icon?: string
  color?: string
}

// 增强的地块类型配置
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
  // 知名地标（占用多格）
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
    },
    {
      id: 'guomao',
      name: '国贸CBD',
      coordinates: { x: 13, y: 8 },
      size: { width: 3, height: 2 },
      icon: '🏢',
      type: 'special',
      building: { type: 'office', name: '国贸中心', icon: '🏢', level: 5, floors: 80, popularity: 90 }
    },
    {
      id: 'sanlitun',
      name: '三里屯',
      coordinates: { x: 12, y: 6 },
      size: { width: 2, height: 2 },
      icon: '🛍️',
      type: 'commercial',
      building: { type: 'mall', name: '三里屯太古里', icon: '🛍️', level: 4, popularity: 85 }
    },
    {
      id: 'zhongguancun',
      name: '中关村',
      coordinates: { x: 5, y: 4 },
      size: { width: 2, height: 3 },
      icon: '💻',
      type: 'special',
      building: { type: 'office', name: '中关村科技园', icon: '💻', level: 5, popularity: 88 }
    }
  ],
  // 地铁站点
  subwayStations: [
    { name: '天安门东', x: 11, y: 7, lines: ['1号线'] },
    { name: '国贸', x: 14, y: 8, lines: ['1号线', '10号线'] },
    { name: '三里屯', x: 12, y: 6, lines: ['10号线'] },
    { name: '中关村', x: 5, y: 4, lines: ['4号线'] },
    { name: '西单', x: 7, y: 7, lines: ['1号线', '4号线'] },
    { name: '东单', x: 11, y: 8, lines: ['1号线', '5号线'] }
  ],
  // 主要道路
  roads: [
    { name: '长安街', type: 'major', points: [{x: 0, y: 7}, {x: 20, y: 7}] },
    { name: '二环路', type: 'ring', points: [{x: 3, y: 3}, {x: 17, y: 3}, {x: 17, y: 12}, {x: 3, y: 12}, {x: 3, y: 3}] }
  ],
  // 水系
  waterBodies: [
    { name: '什刹海', type: 'lake', x: 8, y: 4, width: 2, height: 1 }
  ]
}

// 生成城市地块数据
function generateCityPlots(cityId: string): Plot[] {
  const config = cityId === 'beijing' ? BEIJING_CONFIG : BEIJING_CONFIG // 可扩展其他城市
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
      // 跳过已被占用的格子
      if (occupiedCells.has(`${x},${y}`)) continue
      
      // 检查是否靠近地铁
      const nearSubway = config.subwayStations.some(station => 
        Math.abs(station.x - x) <= 1 && Math.abs(station.y - y) <= 1
      )
      
      // 检查是否在主干道旁
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
      
      // 计算基础价格
      const distanceFromCenter = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 7, 2))
      const basePrice = type === 'commercial' ? 80000 : 
                       type === 'residential' ? 60000 :
                       type === 'industrial' ? 40000 : 20000
      
      // 位置加成
      let priceMultiplier = 1
      if (nearSubway) priceMultiplier *= 1.5
      if (nearRoad) priceMultiplier *= 1.2
      priceMultiplier *= (1 - distanceFromCenter * 0.03)
      
      const price = Math.floor(basePrice * priceMultiplier + Math.random() * 10000)
      const baseYield = PLOT_TYPES[type].baseYield
      
      // 随机决定是否有建筑
      const hasBuilding = Math.random() > 0.6
      const isOwned = hasBuilding || Math.random() > 0.7
      
      const plot: Plot = {
        id: `plot-${x}-${y}`,
        districtId: x < 10 ? 'west' : 'east',
        name: `地块${String(y * config.gridSize.width + x + 1).padStart(3, '0')}`,
        type,
        coordinates: { x, y },
        size: { width: 1, height: 1 },
        price,
        monthlyYield: Math.floor(price * baseYield * (nearSubway ? 1.3 : 1)),
        owned: isOwned,
        ownerId: isOwned ? `user${Math.floor(Math.random() * 1000)}` : undefined,
        building: hasBuilding ? {
          type: 'shop',
          name: ['星巴克', '肯德基', '711便利店', '全家', '永辉超市'][Math.floor(Math.random() * 5)],
          icon: ['☕', '🍗', '🏪', '🏬', '🛒'][Math.floor(Math.random() * 5)],
          level: Math.floor(Math.random() * 3) + 1,
          floors: type === 'commercial' ? Math.floor(Math.random() * 5) + 1 : undefined,
          popularity: Math.floor(Math.random() * 50) + 30
        } : undefined,
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

// 增强的地块网格组件
function EnhancedPlotGrid({
  plots,
  selectedPlot,
  onPlotClick,
  showHeatmap,
  heatmapType
}: {
  plots: Plot[]
  selectedPlot: Plot | null
  onPlotClick: (plot: Plot) => void
  showHeatmap: boolean
  heatmapType: 'price' | 'traffic' | 'yield'
}) {
  const config = BEIJING_CONFIG
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null)
  
  // 计算热力图颜色
  const getHeatmapColor = (plot: Plot) => {
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
  }
  
  return (
    <div className="relative bg-gray-900/50 rounded-2xl p-6 overflow-auto">
      {/* 地图图例 */}
      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur p-3 rounded-lg z-20">
        <h4 className="text-xs font-bold text-white mb-2">图例</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>可购买</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded" />
            <span>已售出</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gold-500 rounded" />
            <span>地标建筑</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>地铁站</span>
          </div>
        </div>
      </div>
      
      {/* 天气效果 */}
      <WeatherEffect />
      
      {/* 地图网格 */}
      <div className="relative">
        {/* 背景层 - 道路和水系 */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          viewBox={`0 0 ${config.gridSize.width * 100} ${config.gridSize.height * 100}`}
          style={{ width: config.gridSize.width * 100, height: config.gridSize.height * 100 }}
        >
          {/* 水系 */}
          {config.waterBodies.map(water => (
            <rect
              key={water.name}
              x={water.x * 100}
              y={water.y * 100}
              width={water.width * 100}
              height={water.height * 100}
              fill="#4FC3F7"
              opacity="0.3"
              rx="20"
            />
          ))}
          
          {/* 主要道路 */}
          <line x1="0" y1="750" x2="2000" y2="750" stroke="#666" strokeWidth="30" opacity="0.5" />
          <text x="1000" y="740" textAnchor="middle" fill="#999" fontSize="12">长安街</text>
        </svg>
        
        {/* 地铁站标记 */}
        {config.subwayStations.map(station => (
          <motion.div
            key={station.name}
            className="absolute flex items-center justify-center"
            style={{
              left: station.x * 100 + 50,
              top: station.y * 100 + 50,
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
              <div className="relative bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                M
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* 地块网格 */}
        <div 
          className="relative grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize.width}, 100px)`,
            gridTemplateRows: `repeat(${config.gridSize.height}, 100px)`
          }}
        >
          {plots.map(plot => (
            <PlotItem
              key={plot.id}
              plot={plot}
              isSelected={selectedPlot?.id === plot.id}
              isHovered={hoveredPlot?.id === plot.id}
              onClick={() => plot.status !== 'protected' && onPlotClick(plot)}
              onMouseEnter={() => setHoveredPlot(plot)}
              onMouseLeave={() => setHoveredPlot(null)}
              heatmapColor={getHeatmapColor(plot)}
            />
          ))}
        </div>
      </div>
      
      {/* 悬浮信息 */}
      <AnimatePresence>
        {hoveredPlot && (
          <PlotTooltip plot={hoveredPlot} />
        )}
      </AnimatePresence>
    </div>
  )
}

// 地块项组件
function PlotItem({
  plot,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  heatmapColor
}: {
  plot: Plot
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  heatmapColor: string
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  
  // 多格地块的样式
  const gridStyle = {
    gridColumn: `${plot.coordinates.x + 1} / span ${plot.size.width}`,
    gridRow: `${plot.coordinates.y + 1} / span ${plot.size.height}`,
    width: plot.size.width * 100 - 4,
    height: plot.size.height * 100 - 4
  }
  
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
          'border-gray-700'
        )}
      />
      
      {/* 建筑展示 */}
      <div className="relative w-full h-full p-2 flex flex-col">
        {/* 顶部状态 */}
        <div className="flex justify-between items-start mb-1">
          <div>
            {plot.features?.includes('地铁沿线') && (
              <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">地铁</span>
            )}
          </div>
          <div className="flex gap-1">
            {plot.building?.popularity && plot.building.popularity > 80 && (
              <Flame className="w-4 h-4 text-red-500" />
            )}
            {plot.status === 'available' && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>
        
        {/* 中心内容 */}
        <div className="flex-1 flex items-center justify-center">
          {plot.building ? (
            <div className="text-center">
              <div className="text-3xl mb-1">{plot.building.icon}</div>
              {plot.building.floors && plot.building.floors > 3 && (
                <div className="text-xs text-gray-400">{plot.building.floors}F</div>
              )}
              {plot.type === 'landmark' && (
                <div className="text-xs font-bold text-gold-500 mt-1">{plot.name}</div>
              )}
            </div>
          ) : (
            <Icon className="w-8 h-8 text-white/20" />
          )}
        </div>
        
        {/* 底部信息 */}
        {plot.status !== 'protected' && (
          <div className="text-center">
            <div className="text-xs font-bold text-green-400">
              ¥{(plot.price/10000).toFixed(1)}万
            </div>
            {plot.monthlyYield > 0 && (
              <div className="text-xs text-gray-400">
                +{(plot.monthlyYield/1000).toFixed(1)}k/月
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 人流动画 */}
      {plot.trafficFlow && plot.trafficFlow > 3 && (
        <TrafficAnimation level={plot.trafficFlow} />
      )}
    </motion.div>
  )
}

// 人流动画组件
function TrafficAnimation({ level }: { level: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(level - 2)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          initial={{ x: -10, y: Math.random() * 100 }}
          animate={{
            x: 110,
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

// 天气效果组件
function WeatherEffect() {
  const [weather] = useState('sunny') // 可以随机或根据时间变化
  
  if (weather === 'rainy') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-4 bg-blue-400/30"
            initial={{ x: Math.random() * 2000, y: -20 }}
            animate={{ y: 1500 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>
    )
  }
  
  return null
}

// 地块悬浮提示
function PlotTooltip({ plot }: { plot: Plot }) {
  const typeConfig = PLOT_TYPES[plot.type]
  
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        left: (plot.coordinates.x + plot.size.width / 2) * 100,
        top: (plot.coordinates.y + plot.size.height) * 100 + 10
      }}
    >
      <div className="bg-black/90 backdrop-blur rounded-lg p-3 text-sm">
        <div className="font-bold text-white mb-1">{plot.name}</div>
        <div className="text-xs text-gray-400 mb-2">{typeConfig.name}</div>
        {plot.building && (
          <div className="text-xs text-gray-300 mb-1">
            {plot.building.icon} {plot.building.name}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-400">¥{(plot.price/10000).toFixed(1)}万</span>
          <span className="text-yellow-400">+{plot.monthlyYield}/月</span>
        </div>
        {plot.features && plot.features.length > 0 && (
          <div className="mt-1 flex gap-1">
            {plot.features.map((feature, i) => (
              <span key={i} className="text-xs bg-gray-700 px-1 py-0.5 rounded">
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 增强的筛选面板
function EnhancedFilterPanel({
  filters,
  onFilterChange,
  onToggleHeatmap,
  showHeatmap,
  heatmapType,
  onHeatmapTypeChange
}: {
  filters: any
  onFilterChange: (key: string, value: string) => void
  onToggleHeatmap: () => void
  showHeatmap: boolean
  heatmapType: string
  onHeatmapTypeChange: (type: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* 原有筛选功能 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6">
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
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6">
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
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">我的投资</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">持有地块</span>
            <span className="font-bold">5个</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">总投资</span>
            <span className="font-bold text-gold-500">¥126.8万</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">月收益</span>
            <span className="font-bold text-green-500">+¥8.5万</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">收益率</span>
            <span className="font-bold text-blue-500">6.7%</span>
          </div>
        </div>
        
        <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
          查看详细分析 →
        </button>
      </div>
    </div>
  )
}

// 增强的地块详情弹窗
function EnhancedPlotDetailModal({
  plot,
  nearbyPlots,
  onClose,
  onAction
}: {
  plot: Plot
  nearbyPlots: Plot[]
  onClose: () => void
  onAction: (action: string) => void
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon
  
  // 计算周边数据
  const nearbyStats = {
    avgPrice: nearbyPlots.reduce((sum, p) => sum + p.price, 0) / nearbyPlots.length,
    commercialCount: nearbyPlots.filter(p => p.type === 'commercial').length,
    hasSubway: nearbyPlots.some(p => p.nearSubway),
    avgTraffic: nearbyPlots.reduce((sum, p) => sum + (p.trafficFlow || 0), 0) / nearbyPlots.length
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
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 - 根据地块类型展示不同风格 */}
        <div className={cn(
          "relative p-6 border-b border-gray-800",
          plot.type === 'landmark' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20' :
          `bg-gradient-to-r ${typeConfig.bgGradient}`
        )}>
          {/* 3D建筑效果 */}
          {plot.building?.floors && plot.building.floors > 3 && (
            <div className="absolute top-4 right-4 opacity-20">
              <Building2 className="w-24 h-24" />
            </div>
          )}
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-black/20 rounded-xl flex items-center justify-center">
                {plot.building ? (
                  <span className="text-4xl">{plot.building.icon}</span>
                ) : (
                  <Icon className="w-10 h-10 text-white/70" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{plot.name}</h3>
                <p className="text-sm text-white/70">{typeConfig.name} · {plot.size.width}x{plot.size.height}格</p>
                {plot.building && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm bg-black/30 px-2 py-1 rounded">
                      {plot.building.name}
                    </span>
                    {plot.building.popularity && plot.building.popularity > 80 && (
                      <span className="text-sm bg-red-500/30 px-2 py-1 rounded flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        人气爆棚
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* 关键指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">当前价格</p>
              <p className="text-xl font-bold text-gold-500">¥{(plot.price/10000).toFixed(1)}万</p>
              <p className="text-xs text-gray-500 mt-1">
                {plot.price > nearbyStats.avgPrice ? '高于' : '低于'}周边
                {Math.abs(((plot.price - nearbyStats.avgPrice) / nearbyStats.avgPrice * 100)).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">月收益</p>
              <p className="text-xl font-bold text-green-500">¥{(plot.monthlyYield/1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-1">年化 {((plot.monthlyYield * 12 / plot.price) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">人流指数</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-6 h-2 rounded",
                      i < (plot.trafficFlow || 0) ? "bg-red-500" : "bg-gray-700"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{plot.trafficFlow || 0}/5</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">位置评分</p>
              <div className="flex items-center gap-1">
                <Trophy className="w-5 h-5 text-gold-500" />
                <span className="text-xl font-bold">{plot.nearSubway ? 'A+' : nearbyStats.hasSubway ? 'A' : 'B'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{plot.nearSubway ? '地铁沿线' : '交通便利'}</p>
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
                {nearbyStats.commercialCount > 3 && (
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                    🛍️ 商业繁华
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 建筑详情 */}
          {plot.building && (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold-500" />
                建筑信息
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">建筑名称：</span>
                  <span className="text-white">{plot.building.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">建筑等级：</span>
                  <span className="text-white">Lv.{plot.building.level}</span>
                </div>
                {plot.building.floors && (
                  <div>
                    <span className="text-gray-400">建筑楼层：</span>
                    <span className="text-white">{plot.building.floors}层</span>
                  </div>
                )}
                {plot.building.popularity && (
                  <div>
                    <span className="text-gray-400">人气指数：</span>
                    <span className="text-white">{plot.building.popularity}/100</span>
                  </div>
                )}
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
                <span className="text-gray-400">投资回报率</span>
                <span className="text-gold-500 font-bold">
                  {((plot.monthlyYield * 12 / plot.price) * 100).toFixed(1)}% / 年
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">回本周期</span>
                <span className="text-white">{(plot.price / plot.monthlyYield).toFixed(0)} 个月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">预期升值</span>
                <span className="text-green-500">
                  {plot.nearSubway ? '+15-20%' : '+8-12%'} / 年
                </span>
              </div>
            </div>
          </div>

          {/* 周边环境 */}
          <div className="mb-6">
            <h4 className="font-bold mb-3">周边环境</h4>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <Store className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                <p className="text-gray-400">商业设施</p>
                <p className="font-bold">{nearbyStats.commercialCount}个</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-gray-400">平均人流</p>
                <p className="font-bold">{nearbyStats.avgTraffic.toFixed(1)}/5</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-gold-500 mx-auto mb-1" />
                <p className="text-gray-400">区域均价</p>
                <p className="font-bold">¥{(nearbyStats.avgPrice/10000).toFixed(1)}万</p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {plot.status === 'available' && (
              <>
                <button
                  onClick={() => onAction('buy')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  立即购买
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 主组件
export default function CityDetailPage() {
  const params = useParams()
  const cityId = params.province as string
  
  const [plots, setPlots] = useState<Plot[]>([])
  const [filteredPlots, setFilteredPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [showPlotDetail, setShowPlotDetail] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [heatmapType, setHeatmapType] = useState<'price' | 'traffic' | 'yield'>('price')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priceRange: 'all',
    search: '',
    special: ''
  })

  // 城市名称映射
  const cityNames: Record<string, string> = {
    beijing: '北京',
    shanghai: '上海',
    guangzhou: '广州',
    shenzhen: '深圳',
    chengdu: '成都',
    hangzhou: '杭州'
  }

  const cityName = cityNames[cityId] || '未知城市'

  // 初始化地块数据
  useEffect(() => {
    const cityPlots = generateCityPlots(cityId)
    setPlots(cityPlots)
    setFilteredPlots(cityPlots)
  }, [cityId])

  // 应用筛选
  useEffect(() => {
    let filtered = [...plots]

    // 特殊筛选
    if (filters.special === 'subway') {
      filtered = filtered.filter(p => p.nearSubway)
    } else if (filters.special === 'landmark') {
      filtered = filtered.filter(p => p.type === 'landmark' || p.type === 'special')
    } else if (filters.special === 'highTraffic') {
      filtered = filtered.filter(p => p.trafficFlow && p.trafficFlow >= 4)
    }

    // 其他筛选逻辑...
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.building?.name.toLowerCase().includes(search)
      )
    }

    setFilteredPlots(filtered)
  }, [filters, plots])

  // 获取周边地块
  const getNearbyPlots = (plot: Plot) => {
    return plots.filter(p => {
      const dx = Math.abs(p.coordinates.x - plot.coordinates.x)
      const dy = Math.abs(p.coordinates.y - plot.coordinates.y)
      return dx <= 2 && dy <= 2 && p.id !== plot.id
    })
  }

  // 处理地块点击
  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot)
    setShowPlotDetail(true)
  }

  // 处理地块操作
  const handlePlotAction = (action: string) => {
    console.log('Plot action:', action, selectedPlot)
    // 实现具体操作逻辑
  }

  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/explore/china" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回</span>
              </Link>
              <div className="h-4 w-px bg-gray-700" />
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {cityName}
                  <span className="text-3xl">🏙️</span>
                </h1>
                <p className="text-sm text-gray-400">探索城市地块，发现投资机会</p>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showHeatmap ? "bg-gold-500 text-black" : "bg-gray-900/50 text-gray-400"
                )}
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* 左侧面板 */}
          <div className="lg:col-span-1">
            <EnhancedFilterPanel
              filters={filters}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              showHeatmap={showHeatmap}
              heatmapType={heatmapType}
              onHeatmapTypeChange={(type) => setHeatmapType(type as any)}
            />
          </div>

          {/* 地图区域 */}
          <div className="lg:col-span-4">
            <EnhancedPlotGrid
              plots={filteredPlots}
              selectedPlot={selectedPlot}
              onPlotClick={handlePlotClick}
              showHeatmap={showHeatmap}
              heatmapType={heatmapType}
            />
          </div>
        </div>
      </div>

      {/* 地块详情弹窗 */}
      <AnimatePresence>
        {showPlotDetail && selectedPlot && (
          <EnhancedPlotDetailModal
            plot={selectedPlot}
            nearbyPlots={getNearbyPlots(selectedPlot)}
            onClose={() => setShowPlotDetail(false)}
            onAction={handlePlotAction}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 文件路径: /app/explore/china/[province]/page.tsx
