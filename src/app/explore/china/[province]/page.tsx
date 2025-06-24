'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Building2, TrendingUp, Search,
  Filter, Grid3X3, Map as MapIcon, Zap, Star,
  ShoppingBag, Home, Factory, Trees, Landmark,
  Lock, Unlock, Construction, Store, Eye,
  Package, Coins, Timer, Users, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// 类型定义
interface Plot {
  id: string
  districtId: string
  name: string
  type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'special'
  coordinates: { x: number; y: number }
  price: number
  monthlyYield: number
  owned: boolean
  ownerId?: string
  building?: {
    type: 'shop' | 'apartment' | 'factory' | 'farm' | 'landmark'
    name: string
    icon: string
    level: number
  }
  status: 'available' | 'owned' | 'building' | 'rented'
  size: number // 平方米
}

interface District {
  id: string
  name: string
  type: string
  description: string
  totalPlots: number
  color: string
}

// 地块类型配置
const PLOT_TYPES = {
  residential: {
    name: '住宅用地',
    color: '#4FC3F7',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    icon: Home,
    buildings: ['公寓', '别墅', '民宿']
  },
  commercial: {
    name: '商业用地',
    color: '#FFB74D',
    bgGradient: 'from-orange-500/20 to-yellow-500/20',
    icon: ShoppingBag,
    buildings: ['商店', '餐厅', '娱乐场所']
  },
  industrial: {
    name: '工业用地',
    color: '#81C784',
    bgGradient: 'from-green-500/20 to-emerald-500/20',
    icon: Factory,
    buildings: ['工厂', '仓库', '物流中心']
  },
  agricultural: {
    name: '农业用地',
    color: '#A1887F',
    bgGradient: 'from-amber-500/20 to-brown-500/20',
    icon: Trees,
    buildings: ['农场', '果园', '养殖场']
  },
  special: {
    name: '特殊地块',
    color: '#BA68C8',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    icon: Landmark,
    buildings: ['地标建筑', '文化设施', '公共服务']
  }
}

// 生成模拟地块数据
function generateCityPlots(cityId: string): Plot[] {
  const plots: Plot[] = []
  const districts = ['chaoyang', 'haidian', 'dongcheng', 'xicheng', 'fengtai', 'tongzhou']
  
  // 根据城市生成不同的地块配置
  const cityConfigs: Record<string, any> = {
    beijing: {
      plotsPerRow: 15,
      totalRows: 10,
      specialPlots: [
        { x: 7, y: 5, name: '天安门广场', type: 'special', building: { type: 'landmark', name: '天安门', icon: '🏛️', level: 5 } },
        { x: 8, y: 4, name: '故宫', type: 'special', building: { type: 'landmark', name: '紫禁城', icon: '🏯', level: 5 } },
        { x: 10, y: 6, name: 'CBD核心', type: 'commercial', building: { type: 'shop', name: '国贸中心', icon: '🏢', level: 4 } },
        { x: 4, y: 3, name: '中关村', type: 'commercial', building: { type: 'shop', name: '科技园', icon: '💻', level: 4 } }
      ]
    },
    shanghai: {
      plotsPerRow: 12,
      totalRows: 10,
      specialPlots: [
        { x: 6, y: 5, name: '外滩', type: 'special', building: { type: 'landmark', name: '外滩金融中心', icon: '🌃', level: 5 } },
        { x: 7, y: 6, name: '陆家嘴', type: 'commercial', building: { type: 'shop', name: '东方明珠', icon: '🗼', level: 5 } },
        { x: 5, y: 4, name: '南京路', type: 'commercial', building: { type: 'shop', name: '步行街', icon: '🛍️', level: 4 } }
      ]
    }
  }
  
  const config = cityConfigs[cityId] || cityConfigs.beijing
  const { plotsPerRow, totalRows, specialPlots } = config
  
  // 生成网格地块
  for (let y = 0; y < totalRows; y++) {
    for (let x = 0; x < plotsPerRow; x++) {
      const plotId = `${cityId}-${x}-${y}`
      const districtIndex = Math.floor((y * plotsPerRow + x) / (plotsPerRow * totalRows / districts.length))
      const districtId = districts[Math.min(districtIndex, districts.length - 1)]
      
      // 检查是否是特殊地块
      const specialPlot = specialPlots.find((sp: any) => sp.x === x && sp.y === y)
      
      // 随机生成地块类型
      const types = Object.keys(PLOT_TYPES) as Array<keyof typeof PLOT_TYPES>
      const randomType = specialPlot?.type || types[Math.floor(Math.random() * types.length)]
      
      // 价格根据位置和类型计算
      const distanceFromCenter = Math.sqrt(Math.pow(x - plotsPerRow/2, 2) + Math.pow(y - totalRows/2, 2))
      const basePrice = randomType === 'special' ? 80000 : 
                       randomType === 'commercial' ? 50000 :
                       randomType === 'residential' ? 35000 :
                       randomType === 'industrial' ? 25000 : 15000
      const price = Math.floor(basePrice * (1 - distanceFromCenter * 0.05) + Math.random() * 10000)
      
      const plot: Plot = {
        id: plotId,
        districtId,
        name: specialPlot?.name || `地块${String(y * plotsPerRow + x + 1).padStart(3, '0')}`,
        type: randomType as Plot['type'],
        coordinates: { x, y },
        price,
        monthlyYield: Math.floor(price * 0.05 + Math.random() * 1000),
        owned: specialPlot ? true : Math.random() > 0.8,
        ownerId: specialPlot || Math.random() > 0.8 ? `user${Math.floor(Math.random() * 1000)}` : undefined,
        building: specialPlot?.building || (Math.random() > 0.7 && Math.random() > 0.5 ? {
          type: 'shop' as const,
          name: `商铺${Math.floor(Math.random() * 100)}`,
          icon: ['🏪', '🏬', '🏭', '🏠', '🌾'][Math.floor(Math.random() * 5)],
          level: Math.floor(Math.random() * 3) + 1
        } : undefined),
        status: specialPlot ? 'owned' : Math.random() > 0.8 ? 'owned' : 'available',
        size: 300
      }
      
      plots.push(plot)
    }
  }
  
  return plots
}

// 地块网格组件
function PlotGrid({
  plots,
  selectedPlot,
  viewMode,
  onPlotClick,
  onPlotHover,
  hoveredPlot
}: {
  plots: Plot[]
  selectedPlot: Plot | null
  viewMode: 'grid' | 'list'
  onPlotClick: (plot: Plot) => void
  onPlotHover: (plot: Plot | null) => void
  hoveredPlot: Plot | null
}) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2 p-4">
        {plots.map(plot => (
          <PlotListItem
            key={plot.id}
            plot={plot}
            isSelected={selectedPlot?.id === plot.id}
            onClick={() => onPlotClick(plot)}
          />
        ))}
      </div>
    )
  }

  // 计算网格尺寸
  const maxX = Math.max(...plots.map(p => p.coordinates.x)) + 1
  const maxY = Math.max(...plots.map(p => p.coordinates.y)) + 1

  return (
    <div className="relative bg-gray-900/50 rounded-2xl p-4 overflow-auto">
      <div 
        className="grid gap-1 min-w-max"
        style={{
          gridTemplateColumns: `repeat(${maxX}, 80px)`,
          gridTemplateRows: `repeat(${maxY}, 80px)`
        }}
      >
        {plots.map(plot => (
          <PlotGridItem
            key={plot.id}
            plot={plot}
            isSelected={selectedPlot?.id === plot.id}
            isHovered={hoveredPlot?.id === plot.id}
            onClick={() => onPlotClick(plot)}
            onMouseEnter={() => onPlotHover(plot)}
            onMouseLeave={() => onPlotHover(null)}
          />
        ))}
      </div>
    </div>
  )
}

// 网格地块项
function PlotGridItem({
  plot,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave
}: {
  plot: Plot
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border-2 cursor-pointer overflow-hidden",
        "transition-all duration-200",
        "flex flex-col",
        plot.status === 'available' ? 'hover:z-10 hover:scale-110' : '',
        isSelected ? 'border-gold-500 z-20 scale-110' : 
        isHovered ? 'border-white z-10' :
        plot.status === 'available' ? 'border-green-500/50' : 'border-gray-600',
        plot.owned ? 'opacity-90' : ''
      )}
      style={{
        background: `linear-gradient(135deg, ${typeConfig.color}20, ${typeConfig.color}10)`,
        gridColumn: plot.coordinates.x + 1,
        gridRow: plot.coordinates.y + 1
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: plot.status === 'available' ? 1.1 : 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: plot.coordinates.y * 0.01 + plot.coordinates.x * 0.01 }}
    >
      {/* 状态标记 */}
      <div className="absolute top-1 right-1 z-10">
        {plot.status === 'available' && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
        {plot.status === 'building' && (
          <Construction className="w-3 h-3 text-yellow-500" />
        )}
        {plot.owned && plot.ownerId === 'currentUser' && (
          <Star className="w-3 h-3 text-gold-500" />
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 p-1 flex flex-col items-center justify-center">
        {plot.building ? (
          <div className="text-center">
            <div className="text-2xl mb-1">{plot.building.icon}</div>
            {plot.building.level > 1 && (
              <div className="flex justify-center">
                {[...Array(plot.building.level)].map((_, i) => (
                  <Star key={i} className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Icon className="w-6 h-6 text-gray-500 opacity-50" />
        )}
      </div>

      {/* 底部信息 */}
      <div className={cn(
        "text-xs p-1 text-center",
        "bg-black/50"
      )}>
        <div className="font-bold text-green-400">
          ¥{(plot.price/1000).toFixed(0)}k
        </div>
      </div>
    </motion.div>
  )
}

// 列表地块项
function PlotListItem({
  plot,
  isSelected,
  onClick
}: {
  plot: Plot
  isSelected: boolean
  onClick: () => void
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon

  return (
    <motion.div
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer",
        "bg-gray-900/50 backdrop-blur",
        "transition-all duration-200",
        isSelected ? "border-gold-500" : "border-gray-700 hover:border-gray-600"
      )}
      onClick={onClick}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-lg flex items-center justify-center",
          `bg-gradient-to-br ${typeConfig.bgGradient}`
        )}>
          {plot.building ? (
            <span className="text-3xl">{plot.building.icon}</span>
          ) : (
            <Icon className="w-8 h-8 text-white/50" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-white">{plot.name}</h4>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              plot.status === 'available' ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
            )}>
              {plot.status === 'available' ? '可购买' : '已售出'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>坐标: ({plot.coordinates.x}, {plot.coordinates.y})</span>
            <span>{typeConfig.name}</span>
            <span>{plot.size}㎡</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-lg font-bold text-gold-500">¥{plot.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500 ml-2">+{plot.monthlyYield}/月</span>
            </div>
            {plot.building && (
              <div className="text-sm text-gray-400">
                {plot.building.name} Lv.{plot.building.level}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 地块详情弹窗
function PlotDetailModal({
  plot,
  onClose,
  onAction
}: {
  plot: Plot
  onClose: () => void
  onAction: (action: string) => void
}) {
  const typeConfig = PLOT_TYPES[plot.type]
  const Icon = typeConfig.icon

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className={cn(
          "p-6 border-b border-gray-800",
          `bg-gradient-to-r ${typeConfig.bgGradient}`
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black/20 rounded-xl flex items-center justify-center">
                {plot.building ? (
                  <span className="text-3xl">{plot.building.icon}</span>
                ) : (
                  <Icon className="w-8 h-8 text-white/70" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{plot.name}</h3>
                <p className="text-sm text-white/70">{typeConfig.name} · {plot.size}㎡</p>
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

        {/* 内容 */}
        <div className="p-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">位置坐标</p>
              <p className="text-lg font-bold">({plot.coordinates.x}, {plot.coordinates.y})</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">当前状态</p>
              <p className="text-lg font-bold">
                {plot.status === 'available' ? '可购买' : 
                 plot.status === 'owned' ? '已拥有' :
                 plot.status === 'building' ? '建设中' : '已出租'}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">价格</p>
              <p className="text-lg font-bold text-gold-500">¥{plot.price.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">月收益</p>
              <p className="text-lg font-bold text-green-500">+{plot.monthlyYield}</p>
            </div>
          </div>

          {/* 建筑信息 */}
          {plot.building && (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold-500" />
                建筑信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">建筑名称</span>
                  <span>{plot.building.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">建筑等级</span>
                  <span>Lv.{plot.building.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">建筑类型</span>
                  <span>{plot.building.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* 投资分析 */}
          <div className="p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg mb-6">
            <h4 className="font-bold mb-2 text-gold-500">投资分析</h4>
            <div className="space-y-1 text-sm">
              <p>年收益率: <span className="text-gold-500 font-bold">
                {((plot.monthlyYield * 12 / plot.price) * 100).toFixed(1)}%
              </span></p>
              <p>回本周期: <span className="text-gold-500 font-bold">
                {(plot.price / plot.monthlyYield).toFixed(0)}个月
              </span></p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {plot.status === 'available' && (
              <>
                <button
                  onClick={() => onAction('buy')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  <ShoppingBag className="w-4 h-4 inline mr-2" />
                  购买地块
                </button>
                <button
                  onClick={() => onAction('favorite')}
                  className="px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Star className="w-4 h-4" />
                </button>
              </>
            )}
            
            {plot.owned && plot.ownerId === 'currentUser' && (
              <>
                {!plot.building && (
                  <button
                    onClick={() => onAction('build')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Construction className="w-4 h-4 inline mr-2" />
                    建设
                  </button>
                )}
                {plot.building && (
                  <button
                    onClick={() => onAction('manage')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Store className="w-4 h-4 inline mr-2" />
                    管理店铺
                  </button>
                )}
                <button
                  onClick={() => onAction('sell')}
                  className="px-12 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  出售
                </button>
              </>
            )}
            
            {plot.owned && plot.ownerId !== 'currentUser' && (
              <button
                disabled
                className="flex-1 bg-gray-800 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed"
              >
                <Lock className="w-4 h-4 inline mr-2" />
                已被其他玩家拥有
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 筛选面板
function FilterPanel({
  filters,
  onFilterChange
}: {
  filters: {
    type: string
    status: string
    priceRange: string
    search: string
  }
  onFilterChange: (key: string, value: string) => void
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 space-y-4">
      {/* 搜索框 */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">搜索地块</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="地块名称或坐标..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 类型筛选 */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">地块类型</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterChange('type', 'all')}
            className={cn(
              "py-2 px-3 rounded-lg text-sm font-medium transition-all",
              filters.type === 'all' 
                ? "bg-gold-500 text-black" 
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            全部
          </button>
          {Object.entries(PLOT_TYPES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onFilterChange('type', key)}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                filters.type === key 
                  ? "bg-gold-500 text-black" 
                  : "bg-gray-800 text-gray-400 hover:text-white"
              )}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* 状态筛选 */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">地块状态</label>
        <div className="space-y-2">
          {[
            { value: 'all', label: '全部状态' },
            { value: 'available', label: '可购买', icon: Unlock },
            { value: 'owned', label: '已拥有', icon: Lock },
            { value: 'building', label: '建设中', icon: Construction }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => onFilterChange('status', option.value)}
              className={cn(
                "w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                filters.status === option.value 
                  ? "bg-gold-500 text-black" 
                  : "bg-gray-800 text-gray-400 hover:text-white"
              )}
            >
              {option.icon && <option.icon className="w-4 h-4" />}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 价格区间 */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">价格区间</label>
        <select
          value={filters.priceRange}
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
          className="w-full py-2 px-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
        >
          <option value="all">不限价格</option>
          <option value="0-20000">2万以下</option>
          <option value="20000-50000">2-5万</option>
          <option value="50000-100000">5-10万</option>
          <option value="100000+">10万以上</option>
        </select>
      </div>
    </div>
  )
}

// 城市统计卡片
function CityStats({ plots }: { plots: Plot[] }) {
  const stats = {
    total: plots.length,
    available: plots.filter(p => p.status === 'available').length,
    owned: plots.filter(p => p.owned).length,
    avgPrice: Math.floor(plots.reduce((sum, p) => sum + p.price, 0) / plots.length),
    totalValue: plots.reduce((sum, p) => sum + p.price, 0),
    monthlyIncome: plots.filter(p => p.owned && p.ownerId === 'currentUser').reduce((sum, p) => sum + p.monthlyYield, 0)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Package className="w-6 h-6 text-gray-400 mb-2" />
        <p className="text-2xl font-bold text-white">{stats.total}</p>
        <p className="text-xs text-gray-400">总地块</p>
      </motion.div>
      
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Unlock className="w-6 h-6 text-green-500 mb-2" />
        <p className="text-2xl font-bold text-green-500">{stats.available}</p>
        <p className="text-xs text-gray-400">可购买</p>
      </motion.div>
      
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Lock className="w-6 h-6 text-gold-500 mb-2" />
        <p className="text-2xl font-bold text-gold-500">{stats.owned}</p>
        <p className="text-xs text-gray-400">已售出</p>
      </motion.div>
      
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Coins className="w-6 h-6 text-yellow-500 mb-2" />
        <p className="text-2xl font-bold text-yellow-500">¥{(stats.avgPrice/1000).toFixed(0)}k</p>
        <p className="text-xs text-gray-400">均价</p>
      </motion.div>
      
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
        <p className="text-2xl font-bold text-blue-500">¥{(stats.totalValue/1000000).toFixed(1)}M</p>
        <p className="text-xs text-gray-400">总价值</p>
      </motion.div>
      
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-xl border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Timer className="w-6 h-6 text-purple-500 mb-2" />
        <p className="text-2xl font-bold text-purple-500">+{stats.monthlyIncome}</p>
        <p className="text-xs text-gray-400">月收入</p>
      </motion.div>
    </div>
  )
}

// 主组件
export default function CityDetailPage() {
  const params = useParams()
  const cityId = params.province as string // 虽然参数名是province，但实际是城市ID
  
  const [plots, setPlots] = useState<Plot[]>([])
  const [filteredPlots, setFilteredPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPlotDetail, setShowPlotDetail] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priceRange: 'all',
    search: ''
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

    // 类型筛选
    if (filters.type !== 'all') {
      filtered = filtered.filter(p => p.type === filters.type)
    }

    // 状态筛选
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status)
    }

    // 价格筛选
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(s => parseInt(s.replace('+', '')))
      filtered = filtered.filter(p => {
        if (max) return p.price >= min && p.price <= max
        return p.price >= min
      })
    }

    // 搜索
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        `${p.coordinates.x},${p.coordinates.y}`.includes(search) ||
        `(${p.coordinates.x},${p.coordinates.y})`.includes(search)
      )
    }

    setFilteredPlots(filtered)
  }, [filters, plots])

  // 处理筛选变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 处理地块点击
  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot)
    setShowPlotDetail(true)
  }

  // 处理地块操作
  const handlePlotAction = (action: string) => {
    console.log('Plot action:', action, selectedPlot)
    // 这里实现具体的操作逻辑
    if (action === 'buy' && selectedPlot) {
      // 购买逻辑
      alert(`购买地块 ${selectedPlot.name}`)
    } else if (action === 'build' && selectedPlot) {
      // 建设逻辑
      alert(`在 ${selectedPlot.name} 上建设`)
    } else if (action === 'manage' && selectedPlot) {
      // 管理逻辑
      window.location.href = `/explore/china/${cityId}/plot/${selectedPlot.id}/manage`
    }
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
                <p className="text-sm text-gray-400">选择地块进行投资</p>
              </div>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-900/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2",
                    viewMode === 'grid' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                  网格
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2",
                    viewMode === 'list' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  列表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8">
        {/* 统计信息 */}
        <div className="mb-8">
          <CityStats plots={plots} />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* 左侧筛选面板 */}
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* 右侧地块展示 */}
          <div className="lg:col-span-3">
            {/* 提示信息 */}
            {filteredPlots.length === 0 ? (
              <div className="bg-gray-900/50 rounded-2xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">没有找到符合条件的地块</p>
              </div>
            ) : (
              <PlotGrid
                plots={filteredPlots}
                selectedPlot={selectedPlot}
                viewMode={viewMode}
                onPlotClick={handlePlotClick}
                onPlotHover={setHoveredPlot}
                hoveredPlot={hoveredPlot}
              />
            )}
          </div>
        </div>
      </div>

      {/* 地块详情弹窗 */}
      <AnimatePresence>
        {showPlotDetail && selectedPlot && (
          <PlotDetailModal
            plot={selectedPlot}
            onClose={() => setShowPlotDetail(false)}
            onAction={handlePlotAction}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 文件路径: /app/explore/china/[province]/page.tsx
