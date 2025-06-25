// app/explore/china/[province]/components/FilterPanel.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, X, Search, MapPin, Crown, Users, TrendingUp,
  Star, Layers, ChevronDown, Coins, Activity, BarChart3,
  Sparkles, Calendar, Clock, Home, ShoppingBag, Factory,
  Trees, Diamond, Lock, RefreshCw, SlidersHorizontal, Wallet
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '../utils'
import { useDebounce } from '../hooks'
import type { FilterState, UserState } from '../types'
import { PLOT_TYPES, PRICE_RANGES, ANIMATION_CONFIG } from '../constants'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (key: string, value: string) => void
  onToggleHeatmap: () => void
  showHeatmap: boolean
  heatmapType: string
  onHeatmapTypeChange: (type: string) => void
  user: UserState
  isMobile: boolean
  plotStats?: {
    total: number
    available: number
    byType: Record<string, number>
  }
  marketStats?: {
    avgPrice: number
    totalVolume: number
    recentTransactions: number
  }
}

export function FilterPanel({
  filters,
  onFilterChange,
  onToggleHeatmap,
  showHeatmap,
  heatmapType,
  onHeatmapTypeChange,
  user,
  isMobile,
  plotStats,
  marketStats
}: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(!isMobile)
  const [expandedSection, setExpandedSection] = useState<string>('type')
  const [searchValue, setSearchValue] = useState(filters.search)
  
  // 搜索防抖
  const debouncedSearch = useDebounce(searchValue, 300)
  React.useEffect(() => {
    onFilterChange('search', debouncedSearch)
  }, [debouncedSearch, onFilterChange])
  
  // 清除所有筛选
  const clearFilters = () => {
    onFilterChange('type', 'all')
    onFilterChange('status', 'all')
    onFilterChange('priceRange', 'all')
    onFilterChange('special', '')
    onFilterChange('hasShop', '')
    setSearchValue('')
  }
  
  // 是否有激活的筛选
  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.status !== 'all' || 
    filters.priceRange !== 'all' || 
    filters.special !== '' || 
    filters.hasShop !== '' ||
    filters.search !== ''
  
  // 移动端浮动按钮
  if (isMobile && !showFilters) {
    return (
      <>
        {/* 筛选按钮 */}
        <button
          onClick={() => setShowFilters(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-gold-500 to-orange-600 text-black rounded-full shadow-lg flex items-center justify-center z-30"
        >
          <Filter className="w-6 h-6" />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        
        {/* 快速筛选栏 */}
        <QuickFilterBar 
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </>
    )
  }
  
  return (
    <motion.div
      initial={isMobile ? { x: '-100%' } : { opacity: 1 }}
      animate={isMobile ? { x: 0 } : { opacity: 1 }}
      exit={isMobile ? { x: '-100%' } : { opacity: 0 }}
      transition={ANIMATION_CONFIG.spring}
      className={cn(
        "space-y-4",
        isMobile && "fixed left-0 top-0 h-full w-80 bg-gray-900 z-40 p-4 overflow-y-auto"
      )}
    >
      {/* 移动端头部 */}
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
      
      {/* 搜索框 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          搜索
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索地块编号、商店名称..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* 地块统计 */}
      {plotStats && (
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            地块统计
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">总地块数</span>
              <span className="font-bold">{plotStats.total}个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">可购买</span>
              <span className="font-bold text-green-500">{plotStats.available}个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">成交率</span>
              <span className="font-bold text-blue-500">
                {((plotStats.total - plotStats.available) / plotStats.total * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-px bg-gray-700 my-2" />
            {Object.entries(plotStats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  {React.createElement(PLOT_TYPES[type as keyof typeof PLOT_TYPES].icon, { 
                    className: "w-3 h-3" 
                  })}
                  {PLOT_TYPES[type as keyof typeof PLOT_TYPES].name}
                </span>
                <span className="font-medium">{count}个</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 地块类型筛选 */}
      <FilterSection
        title="地块类型"
        icon={<Layers className="w-5 h-5" />}
        expanded={expandedSection === 'type'}
        onToggle={() => setExpandedSection(expandedSection === 'type' ? '' : 'type')}
      >
        <div className="space-y-2">
          <FilterButton
            active={filters.type === 'all'}
            onClick={() => onFilterChange('type', 'all')}
            icon={<Layers className="w-4 h-4" />}
            count={plotStats?.total}
          >
            全部类型
          </FilterButton>
          {Object.entries(PLOT_TYPES).map(([key, config]) => (
            <FilterButton
              key={key}
              active={filters.type === key}
              onClick={() => onFilterChange('type', key)}
              icon={<config.icon className="w-4 h-4" />}
              count={plotStats?.byType[key]}
              gradient={config.bgGradient}
            >
              {config.name}
            </FilterButton>
          ))}
        </div>
      </FilterSection>
      
      {/* 状态筛选 */}
      <FilterSection
        title="状态筛选"
        icon={<Activity className="w-5 h-5" />}
        expanded={expandedSection === 'status'}
        onToggle={() => setExpandedSection(expandedSection === 'status' ? '' : 'status')}
      >
        <div className="grid grid-cols-2 gap-2">
          <StatusButton
            active={filters.status === 'all'}
            onClick={() => onFilterChange('status', 'all')}
          >
            全部
          </StatusButton>
          <StatusButton
            active={filters.status === 'available'}
            onClick={() => onFilterChange('status', 'available')}
            color="green"
          >
            可购买
          </StatusButton>
          <StatusButton
            active={filters.status === 'owned'}
            onClick={() => onFilterChange('status', 'owned')}
            color="gray"
          >
            已售出
          </StatusButton>
          <StatusButton
            active={filters.hasShop === 'true'}
            onClick={() => onFilterChange('hasShop', filters.hasShop === 'true' ? '' : 'true')}
            color="purple"
          >
            有商店
          </StatusButton>
        </div>
      </FilterSection>
      
      {/* 价格区间 */}
      <FilterSection
        title="价格区间"
        icon={<Coins className="w-5 h-5" />}
        expanded={expandedSection === 'price'}
        onToggle={() => setExpandedSection(expandedSection === 'price' ? '' : 'price')}
      >
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <PriceRangeButton
              key={range.value}
              active={filters.priceRange === range.value}
              onClick={() => onFilterChange('priceRange', range.value)}
              range={range}
            />
          ))}
        </div>
      </FilterSection>
      
      {/* 快捷筛选 */}
      <FilterSection
        title="快捷筛选"
        icon={<Sparkles className="w-5 h-5" />}
        expanded={expandedSection === 'quick'}
        onToggle={() => setExpandedSection(expandedSection === 'quick' ? '' : 'quick')}
      >
        <div className="space-y-2">
          <QuickFilterButton
            active={filters.special === 'subway'}
            onClick={() => onFilterChange('special', filters.special === 'subway' ? '' : 'subway')}
            icon={<MapPin className="w-4 h-4 text-blue-500" />}
            label="地铁沿线地块"
            description="距离地铁站1格以内"
          />
          <QuickFilterButton
            active={filters.special === 'landmark'}
            onClick={() => onFilterChange('special', filters.special === 'landmark' ? '' : 'landmark')}
            icon={<Crown className="w-4 h-4 text-gold-500" />}
            label="地标周边地块"
            description="靠近知名地标建筑"
          />
          <QuickFilterButton
            active={filters.special === 'highTraffic'}
            onClick={() => onFilterChange('special', filters.special === 'highTraffic' ? '' : 'highTraffic')}
            icon={<Users className="w-4 h-4 text-red-500" />}
            label="高人流量地块"
            description="人流指数4星以上"
          />
          <QuickFilterButton
            active={filters.special === 'highYield'}
            onClick={() => onFilterChange('special', filters.special === 'highYield' ? '' : 'highYield')}
            icon={<TrendingUp className="w-4 h-4 text-green-500" />}
            label="高收益地块"
            description="收益率高于平均20%"
          />
          {user.isLoggedIn && (
            <QuickFilterButton
              active={filters.special === 'myPlots'}
              onClick={() => onFilterChange('special', filters.special === 'myPlots' ? '' : 'myPlots')}
              icon={<Star className="w-4 h-4 text-purple-500" />}
              label="我的地块"
              description="查看我拥有的地块"
              disabled={!user.ownedPlots}
            />
          )}
        </div>
      </FilterSection>
      
      {/* 数据可视化 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          数据可视化
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onToggleHeatmap}
            className={cn(
              "w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              showHeatmap 
                ? "bg-gradient-to-r from-gold-500 to-orange-600 text-black shadow-lg" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            <Activity className="w-4 h-4" />
            {showHeatmap ? '关闭热力图' : '显示热力图'}
          </button>
          
          {showHeatmap && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-2"
            >
              <HeatmapButton
                active={heatmapType === 'price'}
                onClick={() => onHeatmapTypeChange('price')}
                icon={<Coins className="w-4 h-4" />}
                label="价格分布"
                color="gold"
              />
              <HeatmapButton
                active={heatmapType === 'traffic'}
                onClick={() => onHeatmapTypeChange('traffic')}
                icon={<Users className="w-4 h-4" />}
                label="人流热度"
                color="red"
              />
              <HeatmapButton
                active={heatmapType === 'yield'}
                onClick={() => onHeatmapTypeChange('yield')}
                icon={<TrendingUp className="w-4 h-4" />}
                label="收益率"
                color="green"
              />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* 市场动态 */}
      {marketStats && (
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            市场动态
          </h3>
          
          <div className="space-y-3">
            <MarketStatItem
              icon={<Sparkles className="w-4 h-4 text-yellow-500" />}
              label="平均价格"
              value={formatCurrency(marketStats.avgPrice)}
              trend="+5.2%"
            />
            <MarketStatItem
              icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
              label="24h成交量"
              value={formatNumber(marketStats.totalVolume)}
              trend="+12.8%"
            />
            <MarketStatItem
              icon={<Clock className="w-4 h-4 text-green-500" />}
              label="最近成交"
              value={`${marketStats.recentTransactions}笔`}
              trend="5分钟前"
            />
          </div>
          
          <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
            查看完整报告 →
          </button>
        </div>
      )}
      
      {/* 我的投资（仅登录用户） */}
      {user.isLoggedIn && (
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-400" />
            我的投资
          </h3>
          
          <div className="space-y-3">
            <InvestmentStatItem
              label="持有地块"
              value={`${user.ownedPlots || 0}个`}
              icon={<Home className="w-4 h-4" />}
            />
            <InvestmentStatItem
              label="总投资"
              value={formatCurrency(user.totalInvestment || 0)}
              icon={<Coins className="w-4 h-4" />}
              valueColor="text-gold-500"
            />
            <InvestmentStatItem
              label="月收益"
              value={`+${formatCurrency(user.monthlyIncome || 0)}`}
              icon={<TrendingUp className="w-4 h-4" />}
              valueColor="text-green-500"
            />
            <InvestmentStatItem
              label="收益率"
              value={user.totalInvestment ? 
                `${((user.monthlyIncome || 0) * 12 / user.totalInvestment * 100).toFixed(1)}%` : 
                '0%'
              }
              icon={<Activity className="w-4 h-4" />}
              valueColor="text-blue-500"
            />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">投资等级</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">初级投资者</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-500 to-orange-600 transition-all"
                style={{ width: '35%' }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              再投资65万即可升级为中级投资者
            </p>
          </div>
        </div>
      )}
      
      {/* 清除筛选按钮 */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          清除所有筛选
        </button>
      )}
    </motion.div>
  )
}

// 筛选区块组件
function FilterSection({
  title,
  icon,
  expanded,
  onToggle,
  children
}: {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center mb-3"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-gray-400">{icon}</span>
          {title}
        </h3>
        <ChevronDown className={cn(
          "w-5 h-5 transition-transform",
          expanded && "rotate-180"
        )} />
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ANIMATION_CONFIG.fast}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 筛选按钮组件
function FilterButton({
  active,
  onClick,
  icon,
  count,
  gradient,
  children
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  count?: number
  gradient?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition-all",
        active 
          ? gradient 
            ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
            : "bg-gold-500 text-black shadow-lg" 
          : "bg-gray-800 hover:bg-gray-700 text-gray-400"
      )}
    >
      {icon}
      <span className="flex-1 text-left">{children}</span>
      {count !== undefined && (
        <span className={cn(
          "text-xs",
          active ? "font-bold" : "opacity-60"
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

// 状态按钮组件
function StatusButton({
  active,
  onClick,
  color = 'gold',
  children
}: {
  active: boolean
  onClick: () => void
  color?: 'gold' | 'green' | 'gray' | 'purple'
  children: React.ReactNode
}) {
  const colorClasses = {
    gold: 'bg-gold-500 text-black',
    green: 'bg-green-500 text-white',
    gray: 'bg-gray-600 text-white',
    purple: 'bg-purple-500 text-white'
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-2 px-3 rounded-lg text-sm transition-all",
        active 
          ? `${colorClasses[color]} shadow-lg` 
          : "bg-gray-800 hover:bg-gray-700 text-gray-400"
      )}
    >
      {children}
    </button>
  )
}

// 价格区间按钮
function PriceRangeButton({
  active,
  onClick,
  range
}: {
  active: boolean
  onClick: () => void
  range: typeof PRICE_RANGES[0]
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full py-2 px-3 rounded-lg text-sm text-left transition-all",
        active 
          ? "bg-gold-500 text-black shadow-lg" 
          : "bg-gray-800 hover:bg-gray-700 text-gray-400"
      )}
    >
      <div className="flex items-center justify-between">
        <span>{range.label}</span>
        {range.value !== 'all' && (
          <span className="text-xs opacity-70">
            {range.min > 0 && formatCurrency(range.min)}
            {range.max < Infinity && ` - ${formatCurrency(range.max)}`}
          </span>
        )}
      </div>
    </button>
  )
}

// 快捷筛选按钮
function QuickFilterButton({
  active,
  onClick,
  icon,
  label,
  description,
  disabled
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-3 px-3 rounded-lg text-left transition-all",
        active 
          ? "bg-gradient-to-r from-gold-500/20 to-orange-600/20 border border-gold-500/50" 
          : "bg-gray-800 hover:bg-gray-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5",
          active && "text-gold-500"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        </div>
      </div>
    </button>
  )
}

// 热力图按钮
function HeatmapButton({
  active,
  onClick,
  icon,
  label,
  color
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  color: 'gold' | 'red' | 'green'
}) {
  const colorClasses = {
    gold: 'bg-gold-500/20 text-gold-500 border-gold-500/50',
    red: 'bg-red-500/20 text-red-500 border-red-500/50',
    green: 'bg-green-500/20 text-green-500 border-green-500/50'
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition-all",
        active 
          ? `${colorClasses[color]} border` 
          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// 市场统计项
function MarketStatItem({
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-right">
        <div className="font-bold">{value}</div>
        <div className={cn(
          "text-xs",
          isPositive ? "text-green-400" : "text-gray-500"
        )}>
          {trend}
        </div>
      </div>
    </div>
  )
}

// 投资统计项
function InvestmentStatItem({
  label,
  value,
  icon,
  valueColor = 'text-white'
}: {
  label: string
  value: string
  icon: React.ReactNode
  valueColor?: string
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={cn("font-bold", valueColor)}>{value}</span>
    </div>
  )
}

// 快速筛选栏（移动端）
function QuickFilterBar({
  filters,
  onFilterChange
}: {
  filters: FilterState
  onFilterChange: (key: string, value: string) => void
}) {
  return (
    <div className="fixed bottom-20 left-4 right-20 bg-gray-900/90 backdrop-blur rounded-full px-4 py-2 z-30">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <QuickFilterChip
          active={filters.type === 'all'}
          onClick={() => onFilterChange('type', 'all')}
        >
          全部
        </QuickFilterChip>
        <QuickFilterChip
          active={filters.type === 'commercial'}
          onClick={() => onFilterChange('type', 'commercial')}
          color="orange"
        >
          商业
        </QuickFilterChip>
        <QuickFilterChip
          active={filters.type === 'residential'}
          onClick={() => onFilterChange('type', 'residential')}
          color="blue"
        >
          住宅
        </QuickFilterChip>
        <QuickFilterChip
          active={filters.status === 'available'}
          onClick={() => onFilterChange('status', 'available')}
          color="green"
        >
          可购买
        </QuickFilterChip>
        <QuickFilterChip
          active={filters.special === 'subway'}
          onClick={() => onFilterChange('special', filters.special === 'subway' ? '' : 'subway')}
          color="purple"
        >
          地铁
        </QuickFilterChip>
      </div>
    </div>
  )
}

// 快速筛选标签
function QuickFilterChip({
  active,
  onClick,
  color = 'gold',
  children
}: {
  active: boolean
  onClick: () => void
  color?: 'gold' | 'orange' | 'blue' | 'green' | 'purple'
  children: React.ReactNode
}) {
  const colorClasses = {
    gold: 'bg-gold-500 text-black',
    orange: 'bg-orange-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white'
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all",
        active 
          ? colorClasses[color] 
          : "bg-gray-800 text-gray-400"
      )}
    >
      {children}
    </button>
  )
}
