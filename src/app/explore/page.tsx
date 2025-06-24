'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, TrendingUp, MapPin, Users, Sparkles, ChevronRight, Globe, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 类型定义
interface Country {
  id: string
  name: string
  nameEn: string
  emoji: string
  continent: string
  status: 'open' | 'coming' | 'locked'
  cities: number
  totalLands: number
  availableLands: number
  avgPrice: number
  priceChange: number
  hotLevel: number
  description: string
  coordinates: { x: number; y: number }
  color: string
}

// 世界地图数据
const WORLD_DATA: Country[] = [
  {
    id: 'china',
    name: '中国',
    nameEn: 'China',
    emoji: '🇨🇳',
    continent: 'asia',
    status: 'open',
    cities: 12,
    totalLands: 58900,
    availableLands: 12456,
    avgPrice: 25888,
    priceChange: 5.2,
    hotLevel: 5,
    description: '全球第二大经济体，投资机会丰富',
    coordinates: { x: 70, y: 35 },
    color: '#DC143C'
  },
  {
    id: 'usa',
    name: '美国',
    nameEn: 'USA',
    emoji: '🇺🇸',
    continent: 'northAmerica',
    status: 'open',
    cities: 8,
    totalLands: 45600,
    availableLands: 8934,
    avgPrice: 32888,
    priceChange: 3.8,
    hotLevel: 4,
    description: '全球最大经济体，成熟市场',
    coordinates: { x: 25, y: 38 },
    color: '#4169E1'
  },
  {
    id: 'japan',
    name: '日本',
    nameEn: 'Japan',
    emoji: '🇯🇵',
    continent: 'asia',
    status: 'open',
    cities: 5,
    totalLands: 23400,
    availableLands: 3456,
    avgPrice: 28888,
    priceChange: 2.1,
    hotLevel: 3,
    description: '亚洲发达国家，科技产业发达',
    coordinates: { x: 78, y: 36 },
    color: '#DC143C'
  },
  {
    id: 'uk',
    name: '英国',
    nameEn: 'UK',
    emoji: '🇬🇧',
    continent: 'europe',
    status: 'coming',
    cities: 0,
    totalLands: 18900,
    availableLands: 0,
    avgPrice: 30888,
    priceChange: 0,
    hotLevel: 0,
    description: '即将开放，敬请期待',
    coordinates: { x: 48, y: 25 },
    color: '#1E3A8A'
  },
  {
    id: 'singapore',
    name: '新加坡',
    nameEn: 'Singapore',
    emoji: '🇸🇬',
    continent: 'asia',
    status: 'open',
    cities: 1,
    totalLands: 5600,
    availableLands: 1234,
    avgPrice: 45888,
    priceChange: 8.5,
    hotLevel: 5,
    description: '亚洲金融中心，寸土寸金',
    coordinates: { x: 71, y: 48 },
    color: '#DC143C'
  },
  {
    id: 'australia',
    name: '澳大利亚',
    nameEn: 'Australia',
    emoji: '🇦🇺',
    continent: 'oceania',
    status: 'locked',
    cities: 0,
    totalLands: 34500,
    availableLands: 0,
    avgPrice: 26888,
    priceChange: 0,
    hotLevel: 0,
    description: '暂未开放',
    coordinates: { x: 75, y: 65 },
    color: '#047857'
  }
]

// 大洲配置
const CONTINENTS = {
  asia: { name: '亚洲', color: '#DC143C' },
  northAmerica: { name: '北美洲', color: '#4169E1' },
  europe: { name: '欧洲', color: '#1E3A8A' },
  oceania: { name: '大洋洲', color: '#047857' },
  southAmerica: { name: '南美洲', color: '#7C3AED' },
  africa: { name: '非洲', color: '#EA580C' }
}

// 国家卡片组件
function CountryCard({ 
  country,
  onClick,
  isSelected
}: {
  country: Country
  onClick: () => void
  isSelected: boolean
}) {
  const isOpen = country.status === 'open'
  const isComing = country.status === 'coming'
  
  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
        "bg-gray-900/50 backdrop-blur",
        isOpen ? "border-gray-700 hover:border-gold-500" : "border-gray-800",
        isSelected && "border-gold-500 ring-2 ring-gold-500/20",
        !isOpen && "opacity-60"
      )}
      onClick={isOpen ? onClick : undefined}
      whileHover={isOpen ? { scale: 1.02 } : {}}
      whileTap={isOpen ? { scale: 0.98 } : {}}
    >
      {/* 热门标记 */}
      {country.hotLevel >= 4 && isOpen && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔥 HOT
        </motion.div>
      )}

      {/* 即将开放标记 */}
      {isComing && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          COMING
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.emoji}</span>
          <div>
            <h3 className="font-bold text-lg">{country.name}</h3>
            <p className="text-xs text-gray-500">{country.nameEn}</p>
          </div>
        </div>
        {isOpen && country.priceChange !== 0 && (
          <div className={cn(
            "text-xs font-bold",
            country.priceChange > 0 ? "text-green-500" : "text-red-500"
          )}>
            {country.priceChange > 0 ? '+' : ''}{country.priceChange}%
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">{country.description}</p>

      {isOpen && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500">开放城市</p>
            <p className="font-bold text-gold-500">{country.cities}个</p>
          </div>
          <div>
            <p className="text-gray-500">可用地块</p>
            <p className="font-bold text-green-500">{country.availableLands.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">均价</p>
            <p className="font-bold">¥{country.avgPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">总地块</p>
            <p className="font-bold">{country.totalLands.toLocaleString()}</p>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            {isComing ? '即将开放' : '暂未开放'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// 地图马赛克组件
function WorldMapGrid({ 
  countries,
  selectedCountry,
  onCountryClick
}: {
  countries: Country[]
  selectedCountry: string | null
  onCountryClick: (countryId: string) => void
}) {
  const gridSize = 10
  const cellSize = 60

  return (
    <div className="relative bg-gray-900/30 rounded-lg p-8 overflow-hidden">
      {/* 网格背景 */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-10">
          <defs>
            <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <rect width={cellSize} height={cellSize} fill="none" stroke="#374151" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 大洲背景块 */}
      <div className="absolute inset-0">
        {/* 亚洲 */}
        <div 
          className="absolute bg-red-900/10 rounded-lg"
          style={{
            left: '60%',
            top: '30%',
            width: '30%',
            height: '40%'
          }}
        />
        {/* 北美洲 */}
        <div 
          className="absolute bg-blue-900/10 rounded-lg"
          style={{
            left: '15%',
            top: '25%',
            width: '25%',
            height: '35%'
          }}
        />
        {/* 欧洲 */}
        <div 
          className="absolute bg-indigo-900/10 rounded-lg"
          style={{
            left: '45%',
            top: '20%',
            width: '15%',
            height: '25%'
          }}
        />
      </div>

      {/* 国家方块 */}
      <div className="relative" style={{ width: '100%', height: '500px' }}>
        {countries.map((country) => (
          <motion.div
            key={country.id}
            className={cn(
              "absolute cursor-pointer rounded-lg transition-all",
              "flex items-center justify-center",
              country.status === 'open' 
                ? "hover:z-20 hover:scale-110" 
                : "opacity-50"
            )}
            style={{
              left: `${country.coordinates.x}%`,
              top: `${country.coordinates.y}%`,
              width: cellSize,
              height: cellSize,
              backgroundColor: country.status === 'open' 
                ? `${country.color}CC` 
                : '#6B7280',
              border: selectedCountry === country.id 
                ? '3px solid #FFD93D' 
                : '1px solid rgba(255,255,255,0.1)',
              boxShadow: selectedCountry === country.id 
                ? '0 0 20px rgba(255, 217, 61, 0.5)' 
                : '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onClick={() => country.status === 'open' && onCountryClick(country.id)}
            whileHover={country.status === 'open' ? { 
              scale: 1.1,
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
            } : {}}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: countries.indexOf(country) * 0.1 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{country.emoji}</div>
              {country.status === 'open' && country.hotLevel >= 4 && (
                <motion.div
                  className="absolute -top-1 -right-1 text-xs"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔥
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 图例 */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur p-3 rounded-lg text-xs">
        <p className="text-gray-400 mb-2">图例</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>已开放</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>即将开放</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span>未开放</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 统计数据组件
function WorldStats({ countries }: { countries: Country[] }) {
  const stats = {
    totalCountries: countries.filter(c => c.status === 'open').length,
    totalCities: countries.reduce((sum, c) => sum + c.cities, 0),
    totalLands: countries.reduce((sum, c) => sum + c.totalLands, 0),
    availableLands: countries.reduce((sum, c) => sum + c.availableLands, 0)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-gold-500" />
          <span className="text-xs text-gray-500">开放国家</span>
        </div>
        <p className="text-2xl font-bold text-gold-500">{stats.totalCountries}</p>
      </motion.div>

      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-500">开放城市</span>
        </div>
        <p className="text-2xl font-bold text-blue-500">{stats.totalCities}</p>
      </motion.div>

      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-500">总地块数</span>
        </div>
        <p className="text-2xl font-bold text-purple-500">{stats.totalLands.toLocaleString()}</p>
      </motion.div>

      <motion.div
        className="bg-gray-900/50 backdrop-blur p-4 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-500">可购地块</span>
        </div>
        <p className="text-2xl font-bold text-green-500">{stats.availableLands.toLocaleString()}</p>
      </motion.div>
    </div>
  )
}

// 筛选栏组件
function FilterBar({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange
}: {
  activeFilter: string
  onFilterChange: (filter: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}) {
  const filters = [
    { id: 'all', label: '全部', icon: Globe },
    { id: 'open', label: '已开放', icon: Sparkles },
    { id: 'hot', label: '热门', icon: TrendingUp },
    { id: 'coming', label: '即将开放', icon: MapPin }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* 搜索框 */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="搜索国家或城市..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-lg focus:border-gold-500 focus:outline-none transition-colors"
        />
      </div>

      {/* 筛选按钮 */}
      <div className="flex gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                activeFilter === filter.id
                  ? "bg-gold-500 text-black"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 主组件
export default function WorldMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  // 过滤国家
  const filteredCountries = WORLD_DATA.filter(country => {
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!country.name.toLowerCase().includes(term) && 
          !country.nameEn.toLowerCase().includes(term)) {
        return false
      }
    }

    // 状态过滤
    switch (activeFilter) {
      case 'open':
        return country.status === 'open'
      case 'hot':
        return country.status === 'open' && country.hotLevel >= 4
      case 'coming':
        return country.status === 'coming'
      default:
        return true
    }
  })

  // 选中的国家详情
  const selectedCountryData = selectedCountry 
    ? WORLD_DATA.find(c => c.id === selectedCountry)
    : null

  return (
    <div className="min-h-screen bg-[#0A0F1B] text-white">
      {/* 顶部导航 */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gold-500">平行世界</h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span>世界地图</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 视图切换 */}
              <div className="flex bg-gray-900/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-3 py-1 rounded transition-all text-sm",
                    viewMode === 'map' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  地图
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1 rounded transition-all text-sm",
                    viewMode === 'list' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  列表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 统计数据 */}
        <div className="mb-6">
          <WorldStats countries={WORLD_DATA} />
        </div>

        {/* 筛选栏 */}
        <div className="mb-6">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* 地图/列表视图 */}
        {viewMode === 'map' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 地图区域 */}
            <div className="lg:col-span-2">
              <WorldMapGrid
                countries={filteredCountries}
                selectedCountry={selectedCountry}
                onCountryClick={setSelectedCountry}
              />
            </div>

            {/* 国家列表侧边栏 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4">选择国家</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredCountries.map((country) => (
                  <CountryCard
                    key={country.id}
                    country={country}
                    onClick={() => setSelectedCountry(country.id)}
                    isSelected={selectedCountry === country.id}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 列表视图 */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCountries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                onClick={() => setSelectedCountry(country.id)}
                isSelected={selectedCountry === country.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 国家详情弹窗 */}
      <AnimatePresence>
        {selectedCountryData && selectedCountryData.status === 'open' && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCountry(null)}
          >
            <motion.div
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCountryData.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCountryData.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCountryData.nameEn}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 mb-6">{selectedCountryData.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">开放城市</p>
                  <p className="text-lg font-bold text-gold-500">{selectedCountryData.cities}个</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">可用地块</p>
                  <p className="text-lg font-bold text-green-500">{selectedCountryData.availableLands.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">平均价格</p>
                  <p className="text-lg font-bold">¥{selectedCountryData.avgPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">价格涨幅</p>
                  <p className={cn(
                    "text-lg font-bold",
                    selectedCountryData.priceChange > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {selectedCountryData.priceChange > 0 ? '+' : ''}{selectedCountryData.priceChange}%
                  </p>
                </div>
              </div>

              <Link href={`/explore/${selectedCountryData.id}`}>
                <button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  进入{selectedCountryData.name}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
