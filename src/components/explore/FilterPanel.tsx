// src/components/explore/FilterPanel.tsx
// 筛选面板组件

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, ChevronDown, X } from 'lucide-react'
import type { FilterState } from '@/types/assets'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  stats?: any
  totalLands?: number
}

const landTypes = [
  { value: 'all', label: '全部类型' },
  { value: 'urban', label: '城市用地' },
  { value: 'farm', label: '农业用地' },
  { value: 'iron_mine', label: '铁矿' },
  { value: 'stone_mine', label: '石矿' },
  { value: 'forest', label: '森林' },
  { value: 'yld_mine', label: 'YLD矿' },
]

const priceRanges = [
  { value: 'all', label: '不限价格', min: undefined, max: undefined },
  { value: '0-10k', label: '1万以下', min: 0, max: 10000 },
  { value: '10k-50k', label: '1-5万', min: 10000, max: 50000 },
  { value: '50k-100k', label: '5-10万', min: 50000, max: 100000 },
  { value: '100k+', label: '10万以上', min: 100000, max: undefined },
]

const sortOptions = [
  { value: '-created_at', label: '最新发布' },
  { value: 'current_price', label: '价格从低到高' },
  { value: '-current_price', label: '价格从高到低' },
  { value: '-transaction_count', label: '交易量最多' },
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
  
  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      {stats && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-bold mb-3">区域统计</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">总土地数</span>
              <span className="font-bold">{stats.total_lands}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">可购买</span>
              <span className="font-bold text-green-500">{stats.available_lands}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">平均价格</span>
              <span className="font-bold text-gold-500">
                ¥{Math.round(stats.average_price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 土地类型 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <button
          onClick={() => toggleSection('type')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="font-bold">土地类型</h3>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            expanded.includes('type') && "rotate-180"
          )} />
        </button>
        
        {expanded.includes('type') && (
          <div className="space-y-2">
            {landTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  filters.land_type === type.value
                    ? "bg-gold-500 text-black font-bold"
                    : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 价格区间 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="font-bold">价格区间</h3>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            expanded.includes('price') && "rotate-180"
          )} />
        </button>
        
        {expanded.includes('price') && (
          <div className="space-y-2">
            {priceRanges.map(range => (
              <button
                key={range.value}
                onClick={() => handlePriceRangeChange(range)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  filters.priceRange.min === range.min && filters.priceRange.max === range.max
                    ? "bg-gold-500 text-black font-bold"
                    : "bg-gray-700 hover:bg-gray-600"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 排序 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="font-bold mb-3">排序方式</h3>
        <select
          value={filters.ordering}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* 清除筛选 */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          清除筛选
        </button>
      )}
    </div>
  )
}
