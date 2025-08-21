// src/components/explore/FilterPanel.tsx
// 筛选面板组件 - 添加创世土地标识

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, ChevronDown, X, Sparkles, TrendingUp, 
  Package, Coins, RotateCcw, Check, Zap, Star
} from 'lucide-react'
import type { FilterState } from '@/types/assets'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  stats?: any
  totalLands?: number
}

const landTypes = [
  { value: 'all', label: '全部类型', icon: '🌍', color: 'from-gray-500 to-gray-600' },
  { value: 'urban', label: '城市用地', icon: '🏢', color: 'from-blue-500 to-cyan-500' },
  { value: 'farm', label: '农业用地', icon: '🌾', color: 'from-green-500 to-emerald-500' },
  { value: 'iron_mine', label: '铁矿', icon: '⛏️', color: 'from-gray-500 to-slate-500' },
  { value: 'stone_mine', label: '石矿', icon: '🪨', color: 'from-stone-500 to-amber-500' },
  { value: 'forest', label: '森林', icon: '🌲', color: 'from-green-600 to-teal-600' },
  { value: 'yld_mine', label: 'YLD矿', icon: '💎', color: 'from-purple-500 to-pink-500' },
]

// 价格区间改为显示原价和折扣价
const priceRanges = [
  { value: 'all', label: '不限价格', min: undefined, max: undefined },
  { value: '0-10k', label: '2.5万 TDB 以下（原价1万以下）', min: 0, max: 10000 },
  { value: '10k-50k', label: '2.5-12.5万 TDB（原价1-5万）', min: 10000, max: 50000 },
  { value: '50k-100k', label: '12.5-25万 TDB（原价5-10万）', min: 50000, max: 100000 },
  { value: '100k+', label: '25万 TDB 以上（原价10万+）', min: 100000, max: undefined },
]

const sortOptions = [
  { value: '-created_at', label: '最新发布', icon: Sparkles },
  { value: 'current_price', label: '价格从低到高', icon: TrendingUp },
  { value: '-current_price', label: '价格从高到低', icon: TrendingUp },
  { value: '-transaction_count', label: '交易量最多', icon: Package },
]

export function FilterPanel({
  filters,
  onFilterChange,
  stats,
  totalLands,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState<string[]>(['type', 'price'])
  
  const toggleSection = (section: string) => {
    setExpanded(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  const handleTypeChange = (type: string) => {
    onFilterChange({ land_type: type })
  }
  
  const handlePriceRangeChange = (range: any) => {
    onFilterChange({
      priceRange: {
        min: range.min,
        max: range.max,
      }
    })
  }
  
  const handleSortChange = (ordering: string) => {
    onFilterChange({ ordering })
  }
  
  const clearFilters = () => {
    onFilterChange({
      land_type: 'all',
      status: 'all',
      priceRange: {},
      search: '',
      ordering: '-created_at',
    })
  }
  
  const hasActiveFilters = 
    filters.land_type !== 'all' ||
    filters.status !== 'all' ||
    filters.priceRange.min !== undefined ||
    filters.priceRange.max !== undefined ||
    filters.search !== ''
  
  const activeFilterCount = [
    filters.land_type !== 'all',
    filters.priceRange.min !== undefined || filters.priceRange.max !== undefined,
    filters.search !== ''
  ].filter(Boolean).length
  
  return (
    <div className="space-y-4">
      {/* 创世土地活动卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-xl p-5 border-2 border-purple-500/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-yellow-600 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-black" />
            </div>
            <h3 className="font-bold text-white">创世纪元 · 限时特惠</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-gold-500" />
              <span className="text-gold-400">首批土地享受4折优惠</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">成为创世先锋，见证历史</span>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 mt-3">
              <p className="text-xs text-red-400 text-center font-medium">
                限时优惠 -60% OFF
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 统计信息卡片 */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-5 border border-purple-500/30"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            区域统计
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">总土地数</span>
              <span className="text-lg font-bold">{stats.total_lands}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">可购买</span>
              <span className="text-lg font-bold text-green-400">{stats.available_lands}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">创世优惠价</span>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Coins className="w-4 h-4 text-gold-500" />
                  <span className="text-lg font-bold text-gold-500">
                    {Math.round(stats.average_price).toLocaleString()}
                  </span>
                  <span className="text-sm text-gold-400">TDB</span>
                </div>
                <p className="text-xs text-gray-500 line-through">
                  原价 {Math.round(stats.average_price / 0.4).toLocaleString()} TDB
                </p>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="pt-2">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((stats.total_lands - stats.available_lands) / stats.total_lands) * 100}%`
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                已售出 {Math.round(((stats.total_lands - stats.available_lands) / stats.total_lands) * 100)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 土地类型选择 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <button
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h3 className="font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            土地类型
            {filters.land_type !== 'all' && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                已选择
              </span>
            )}
          </h3>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform text-gray-400 group-hover:text-white",
            expanded.includes('type') && "rotate-180"
          )} />
        </button>
        
        <AnimatePresence>
          {expanded.includes('type') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {landTypes.map((type, index) => (
                <motion.button
                  key={type.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTypeChange(type.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-left transition-all",
                    "flex items-center justify-between group",
                    filters.land_type === type.value
                      ? "bg-gradient-to-r " + type.color + " text-white shadow-lg"
                      : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </span>
                  {filters.land_type === type.value && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 价格区间 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h3 className="font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-400" />
            价格区间 (4折后)
            {(filters.priceRange.min !== undefined || filters.priceRange.max !== undefined) && (
              <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                已设置
              </span>
            )}
          </h3>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform text-gray-400 group-hover:text-white",
            expanded.includes('price') && "rotate-180"
          )} />
        </button>
        
        <AnimatePresence>
          {expanded.includes('price') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {priceRanges.map((range, index) => {
                const isActive = filters.priceRange.min === range.min && filters.priceRange.max === range.max
                return (
                  <motion.button
                    key={range.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handlePriceRangeChange(range)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-left transition-all",
                      "flex items-center justify-between",
                      isActive
                        ? "bg-gradient-to-r from-gold-500 to-yellow-600 text-black font-bold shadow-lg"
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <span className="text-sm">{range.label}</span>
                    {isActive && <Check className="w-4 h-4" />}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 排序方式 */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" />
          排序方式
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "p-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2",
                  filters.ordering === option.value
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 清除筛选 */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={clearFilters}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 border border-red-500/30 rounded-xl text-sm flex items-center justify-center gap-2 transition-all font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            清除所有筛选条件 ({activeFilterCount})
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
