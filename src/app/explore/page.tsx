'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, MapPin, Users, Globe, ChevronRight, 
  Zap, Clock, Star, ArrowUpRight, Search, Info
} from 'lucide-react'
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
  features: string[]
  openDate?: string
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
    coordinates: { x: 65, y: 40 },
    color: '#EF4444',
    features: ['经济增长快', '城市化进程', '政策支持']
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
    coordinates: { x: 20, y: 35 },
    color: '#3B82F6',
    features: ['金融中心', '科技创新', '市场成熟']
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
    coordinates: { x: 75, y: 38 },
    color: '#EC4899',
    features: ['科技领先', '文化输出', '品质生活']
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
    coordinates: { x: 45, y: 20 },
    color: '#6366F1',
    features: ['金融重镇', '历史悠久', '教育资源'],
    openDate: '2024年2月'
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
    coordinates: { x: 68, y: 55 },
    color: '#F59E0B',
    features: ['金融港口', '贸易枢纽', '花园城市']
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
    coordinates: { x: 70, y: 70 },
    color: '#10B981',
    features: ['自然资源', '移民热门', '生活品质']
  },
  {
    id: 'germany',
    name: '德国',
    nameEn: 'Germany',
    emoji: '🇩🇪',
    continent: 'europe',
    status: 'coming',
    cities: 0,
    totalLands: 28900,
    availableLands: 0,
    avgPrice: 29888,
    priceChange: 0,
    hotLevel: 0,
    description: '即将开放',
    coordinates: { x: 48, y: 25 },
    color: '#6366F1',
    features: ['工业强国', '制造中心', '欧洲心脏'],
    openDate: '2024年3月'
  },
  {
    id: 'canada',
    name: '加拿大',
    nameEn: 'Canada',
    emoji: '🇨🇦',
    continent: 'northAmerica',
    status: 'locked',
    cities: 0,
    totalLands: 38500,
    availableLands: 0,
    avgPrice: 24888,
    priceChange: 0,
    hotLevel: 0,
    description: '暂未开放',
    coordinates: { x: 20, y: 20 },
    color: '#EF4444',
    features: ['资源丰富', '移民友好', '生活宜居']
  }
]

// 大洲背景配置
const CONTINENT_BACKGROUNDS = [
  { id: 'asia', x: 55, y: 35, width: 30, height: 35, color: '#DC2626' },
  { id: 'northAmerica', x: 10, y: 20, width: 25, height: 30, color: '#2563EB' },
  { id: 'europe', x: 40, y: 15, width: 20, height: 25, color: '#4F46E5' },
  { id: 'oceania', x: 60, y: 65, width: 25, height: 20, color: '#059669' },
]

// 悬浮信息卡组件
function CountryTooltip({ 
  country, 
  position 
}: { 
  country: Country
  position: { x: number; y: number }
}) {
  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl w-72">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{country.name}</h3>
              <p className="text-xs text-gray-500">{country.nameEn}</p>
            </div>
          </div>
          {country.status === 'open' && (
            <div className={cn(
              "px-2 py-1 rounded text-xs font-bold",
              country.priceChange > 0 
                ? "bg-green-500/20 text-green-500" 
                : "bg-red-500/20 text-red-500"
            )}>
              {country.priceChange > 0 ? '+' : ''}{country.priceChange}%
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-3">{country.description}</p>

        {country.status === 'open' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="text-xs text-gray-500">开放城市</p>
                <p className="font-bold text-gold-500">{country.cities}个</p>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <p className="text-xs text-gray-500">可用地块</p>
                <p className="font-bold text-green-500">{country.availableLands.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {country.features.map((feature, i) => (
                <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </>
        ) : country.status === 'coming' ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
            <p className="text-sm text-blue-400">
              <Clock className="w-3 h-3 inline mr-1" />
              预计 {country.openDate} 开放
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded p-3">
            <p className="text-sm text-gray-500 text-center">暂未开放</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 国家方块组件
function CountryBlock({ 
  country,
  isSelected,
  onHover,
  onClick
}: {
  country: Country
  isSelected: boolean
  onHover: (country: Country | null, event?: React.MouseEvent) => void
  onClick: () => void
}) {
  const isOpen = country.status === 'open'
  const isComing = country.status === 'coming'
  
  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer rounded-xl transition-all",
        "flex flex-col items-center justify-center",
        isOpen ? "hover:z-30" : "opacity-60"
      )}
      style={{
        left: `${country.coordinates.x}%`,
        top: `${country.coordinates.y}%`,
        width: '120px',
        height: '100px',
        transform: 'translate(-50%, -50%)',
        backgroundColor: isOpen ? country.color + '20' : '#37415140',
        border: `2px solid ${isSelected ? country.color : country.color + '60'}`,
        boxShadow: isSelected 
          ? `0 0 30px ${country.color}80, inset 0 0 20px ${country.color}20` 
          : '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onMouseEnter={(e) => onHover(country, e)}
      onMouseLeave={() => onHover(null)}
      onClick={isOpen ? onClick : undefined}
      whileHover={isOpen ? { 
        scale: 1.15,
        zIndex: 30,
        transition: { duration: 0.2 }
      } : {}}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* 热门标记 */}
      {isOpen && country.hotLevel >= 4 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔥
        </motion.div>
      )}

      {/* 即将开放标记 */}
      {isComing && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold">
          SOON
        </div>
      )}

      {/* 国家内容 */}
      <div className="text-center">
        <div className="text-4xl mb-2">{country.emoji}</div>
        <div className="font-bold text-sm">{country.name}</div>
        {isOpen && (
          <div className="text-xs text-gray-400 mt-1">
            {country.cities} 城市
          </div>
        )}
      </div>

      {/* 状态指示器 */}
      <div className={cn(
        "absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full",
        isOpen ? "bg-green-500" : isComing ? "bg-blue-500" : "bg-gray-600"
      )} />
    </motion.div>
  )
}

// 快速统计卡片
function QuickStats({ countries }: { countries: Country[] }) {
  const stats = {
    totalCountries: countries.filter(c => c.status === 'open').length,
    totalCities: countries.reduce((sum, c) => sum + c.cities, 0),
    avgPrice: Math.floor(
      countries.filter(c => c.status === 'open').reduce((sum, c) => sum + c.avgPrice, 0) / 
      countries.filter(c => c.status === 'open').length
    ),
    hotCountries: countries.filter(c => c.hotLevel >= 4).length
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <motion.div
        className="relative bg-gradient-to-br from-gold-500/20 to-transparent p-6 rounded-2xl border border-gold-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <Globe className="w-8 h-8 text-gold-500 mb-3" />
          <p className="text-3xl font-bold text-gold-500">{stats.totalCountries}</p>
          <p className="text-sm text-gray-400 mt-1">开放国家</p>
        </div>
      </motion.div>

      <motion.div
        className="relative bg-gradient-to-br from-blue-500/20 to-transparent p-6 rounded-2xl border border-blue-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <MapPin className="w-8 h-8 text-blue-500 mb-3" />
          <p className="text-3xl font-bold text-blue-500">{stats.totalCities}</p>
          <p className="text-sm text-gray-400 mt-1">开放城市</p>
        </div>
      </motion.div>

      <motion.div
        className="relative bg-gradient-to-br from-green-500/20 to-transparent p-6 rounded-2xl border border-green-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-3xl font-bold text-green-500">¥{(stats.avgPrice/1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-400 mt-1">平均价格</p>
        </div>
      </motion.div>

      <motion.div
        className="relative bg-gradient-to-br from-red-500/20 to-transparent p-6 rounded-2xl border border-red-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <Zap className="w-8 h-8 text-red-500 mb-3" />
          <p className="text-3xl font-bold text-red-500">{stats.hotCountries}</p>
          <p className="text-sm text-gray-400 mt-1">热门国家</p>
        </div>
      </motion.div>
    </div>
  )
}

// 国家列表组件（移动端优化）
function CountryList({ 
  countries,
  selectedCountry,
  onCountryClick
}: {
  countries: Country[]
  selectedCountry: string | null
  onCountryClick: (countryId: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {countries.map((country) => {
        const isOpen = country.status === 'open'
        const isComing = country.status === 'coming'
        const isSelected = selectedCountry === country.id
        
        return (
          <motion.div
            key={country.id}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all",
              "bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur",
              isOpen 
                ? "border-gray-700 hover:border-gold-500 cursor-pointer" 
                : "border-gray-800 opacity-60",
              isSelected && "border-gold-500 ring-2 ring-gold-500/20"
            )}
            onClick={() => isOpen && onCountryClick(country.id)}
            whileHover={isOpen ? { scale: 1.02 } : {}}
            whileTap={isOpen ? { scale: 0.98 } : {}}
          >
            {/* 状态标记 */}
            {isOpen && country.hotLevel >= 4 && (
              <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                热门
              </div>
            )}
            {isComing && (
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                即将开放
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="text-5xl">{country.emoji}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{country.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{country.description}</p>
                
                {isOpen ? (
                  <>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gold-500" />
                        <span className="text-sm font-bold text-gold-500">{country.cities} 城市</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-500">{country.availableLands.toLocaleString()} 地块</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">¥{country.avgPrice.toLocaleString()}</span>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold",
                        country.priceChange > 0 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-red-500/20 text-red-500"
                      )}>
                        {country.priceChange > 0 ? '+' : ''}{country.priceChange}%
                      </div>
                    </div>
                  </>
                ) : isComing ? (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{country.openDate}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">暂未开放</p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 主组件
export default function WorldMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [isMobile, setIsMobile] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setViewMode('list')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 处理悬浮
  const handleCountryHover = (country: Country | null, event?: React.MouseEvent) => {
    if (country && event && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left + 20
      const y = event.clientY - rect.top - 20
      setTooltipPosition({ x, y })
      setHoveredCountry(country)
    } else {
      setHoveredCountry(null)
    }
  }

  // 处理点击
  const handleCountryClick = (countryId: string) => {
    setSelectedCountry(countryId)
    const country = WORLD_DATA.find(c => c.id === countryId)
    if (country?.status === 'open') {
      // 延迟跳转，显示选中动画
      setTimeout(() => {
        window.location.href = `/explore/${countryId}`
      }, 300)
    }
  }

  // 过滤国家
  const filteredCountries = WORLD_DATA.filter(country => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return country.name.toLowerCase().includes(term) || 
             country.nameEn.toLowerCase().includes(term)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-gold-500">平行世界</h1>
              <p className="text-sm text-gray-400">探索全球数字地产机会</p>
            </div>
            
            {/* 搜索框 - 桌面端 */}
            <div className="hidden md:block relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索国家..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-full focus:border-gold-500 focus:outline-none transition-all"
              />
            </div>

            {/* 视图切换 - 桌面端 */}
            {!isMobile && (
              <div className="flex bg-gray-900/50 backdrop-blur rounded-full p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all text-sm font-medium",
                    viewMode === 'map' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  地图视图
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all text-sm font-medium",
                    viewMode === 'list' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  列表视图
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端搜索框 */}
      {isMobile && (
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索国家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-xl focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8">
        {/* 快速统计 */}
        <QuickStats countries={WORLD_DATA} />

        {/* 地图/列表视图 */}
        {viewMode === 'map' && !isMobile ? (
          <motion.div
            ref={mapRef}
            className="relative bg-gray-900/30 backdrop-blur rounded-2xl p-8 overflow-hidden"
            style={{ height: '700px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 大洲背景 */}
            {CONTINENT_BACKGROUNDS.map((continent) => (
              <div
                key={continent.id}
                className="absolute rounded-2xl opacity-5"
                style={{
                  left: `${continent.x}%`,
                  top: `${continent.y}%`,
                  width: `${continent.width}%`,
                  height: `${continent.height}%`,
                  backgroundColor: continent.color
                }}
              />
            ))}

            {/* 网格装饰 */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, #374151 1px, transparent 1px),
                                  linear-gradient(to bottom, #374151 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* 国家方块 */}
            {filteredCountries.map((country) => (
              <CountryBlock
                key={country.id}
                country={country}
                isSelected={selectedCountry === country.id}
                onHover={handleCountryHover}
                onClick={() => handleCountryClick(country.id)}
              />
            ))}

            {/* 悬浮提示 */}
            <AnimatePresence>
              {hoveredCountry && (
                <CountryTooltip
                  country={hoveredCountry}
                  position={tooltipPosition}
                />
              )}
            </AnimatePresence>

            {/* 地图说明 */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-2 font-medium">地图说明</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-gray-300">已开放国家</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span className="text-gray-300">即将开放</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded" />
                  <span className="text-gray-300">暂未开放</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 列表视图 */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CountryList
              countries={filteredCountries}
              selectedCountry={selectedCountry}
              onCountryClick={handleCountryClick}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
