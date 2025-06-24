'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, TrendingUp, MapPin, Building2, Users, 
  Sparkles, ChevronRight, Star, Zap, Award,
  BarChart3, Clock, Shield, Flame, Search,
  Filter, Grid3X3, Map as MapIcon, Info
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 类型定义
interface City {
  id: string
  name: string
  nameEn: string
  tier: 'first' | 'new-first' | 'second'
  status: 'hot' | 'recommended' | 'normal'
  emoji: string
  description: string
  districts: number
  totalLands: number
  availableLands: number
  avgPrice: number
  priceChange: number
  monthlyReturn: string
  features: string[]
  landmarks: string[]
  advantages: string[]
  coordinates?: { x: number; y: number }
}

// 城市数据
const CITIES_DATA: Record<string, City> = {
  beijing: {
    id: 'beijing',
    name: '北京',
    nameEn: 'Beijing',
    tier: 'first',
    status: 'hot',
    emoji: '🏛️',
    description: '中国首都，政治文化中心，投资价值稳定',
    districts: 16,
    totalLands: 5680,
    availableLands: 256,
    avgPrice: 45888,
    priceChange: 5.8,
    monthlyReturn: '8-12%',
    features: ['政治中心', '文化底蕴', '教育资源', '科技创新'],
    landmarks: ['故宫', '天安门', 'CBD', '中关村'],
    advantages: ['政策优势明显', '高端产业聚集', '国际化程度高'],
    coordinates: { x: 70, y: 30 }
  },
  shanghai: {
    id: 'shanghai',
    name: '上海',
    nameEn: 'Shanghai',
    tier: 'first',
    status: 'hot',
    emoji: '🌃',
    description: '国际金融中心，经济最发达城市',
    districts: 16,
    totalLands: 4560,
    availableLands: 189,
    avgPrice: 52888,
    priceChange: 4.2,
    monthlyReturn: '10-15%',
    features: ['金融中心', '自贸区', '国际都市', '创新活力'],
    landmarks: ['外滩', '陆家嘴', '浦东新区', '虹桥枢纽'],
    advantages: ['金融产业发达', '国际贸易活跃', '创新创业氛围浓'],
    coordinates: { x: 80, y: 50 }
  },
  guangzhou: {
    id: 'guangzhou',
    name: '广州',
    nameEn: 'Guangzhou',
    tier: 'first',
    status: 'normal',
    emoji: '🏙️',
    description: '千年商都，华南经济中心',
    districts: 11,
    totalLands: 3890,
    availableLands: 456,
    avgPrice: 32888,
    priceChange: 3.5,
    monthlyReturn: '6-10%',
    features: ['商贸中心', '制造基地', '交通枢纽', '美食天堂'],
    landmarks: ['广州塔', '珠江新城', '白云山', '长隆'],
    advantages: ['商贸历史悠久', '制造业发达', '生活成本适中'],
    coordinates: { x: 65, y: 80 }
  },
  shenzhen: {
    id: 'shenzhen',
    name: '深圳',
    nameEn: 'Shenzhen',
    tier: 'first',
    status: 'recommended',
    emoji: '💻',
    description: '中国硅谷，科技创新之都',
    districts: 9,
    totalLands: 3200,
    availableLands: 234,
    avgPrice: 48888,
    priceChange: 7.2,
    monthlyReturn: '12-18%',
    features: ['科技创新', '创业天堂', '年轻活力', '改革先锋'],
    landmarks: ['南山科技园', '福田CBD', '前海', '华强北'],
    advantages: ['科技产业领先', '创新生态完善', '年轻人口占比高'],
    coordinates: { x: 67, y: 83 }
  },
  chengdu: {
    id: 'chengdu',
    name: '成都',
    nameEn: 'Chengdu',
    tier: 'new-first',
    status: 'recommended',
    emoji: '🐼',
    description: '天府之国，西部经济中心',
    districts: 12,
    totalLands: 3560,
    availableLands: 678,
    avgPrice: 22888,
    priceChange: 2.8,
    monthlyReturn: '5-8%',
    features: ['生活宜居', '美食之都', '文创产业', '西部枢纽'],
    landmarks: ['春熙路', '宽窄巷子', '大熊猫基地', '天府新区'],
    advantages: ['生活品质高', '文化氛围浓', '发展潜力大'],
    coordinates: { x: 35, y: 55 }
  },
  hangzhou: {
    id: 'hangzhou',
    name: '杭州',
    nameEn: 'Hangzhou',
    tier: 'new-first',
    status: 'normal',
    emoji: '🌊',
    description: '电商之都，数字经济领先',
    districts: 10,
    totalLands: 2890,
    availableLands: 345,
    avgPrice: 38888,
    priceChange: 4.5,
    monthlyReturn: '8-12%',
    features: ['电子商务', '数字经济', '旅游胜地', '创新活力'],
    landmarks: ['西湖', '阿里巴巴', '钱江新城', '未来科技城'],
    advantages: ['互联网产业发达', '生活环境优美', '创新创业活跃'],
    coordinates: { x: 78, y: 55 }
  },
  chongqing: {
    id: 'chongqing',
    name: '重庆',
    nameEn: 'Chongqing',
    tier: 'new-first',
    status: 'normal',
    emoji: '🌉',
    description: '山城重庆，西部直辖市',
    districts: 9,
    totalLands: 3100,
    availableLands: 523,
    avgPrice: 18888,
    priceChange: 3.2,
    monthlyReturn: '5-8%',
    features: ['直辖市', '交通枢纽', '工业基地', '网红城市'],
    landmarks: ['解放碑', '洪崖洞', '朝天门', '两江新区'],
    advantages: ['政策支持力度大', '发展空间广阔', '旅游资源丰富'],
    coordinates: { x: 40, y: 60 }
  },
  xian: {
    id: 'xian',
    name: '西安',
    nameEn: 'Xi\'an',
    tier: 'second',
    status: 'normal',
    emoji: '🏺',
    description: '千年古都，一带一路起点',
    districts: 8,
    totalLands: 2560,
    availableLands: 412,
    avgPrice: 16888,
    priceChange: 2.5,
    monthlyReturn: '4-7%',
    features: ['历史文化', '教育重镇', '科研基地', '旅游名城'],
    landmarks: ['大雁塔', '兵马俑', '钟楼', '高新区'],
    advantages: ['文化底蕴深厚', '教育资源丰富', '发展政策优惠'],
    coordinates: { x: 45, y: 45 }
  }
}

// 城市分级配置
const CITY_TIERS = {
  'first': { 
    name: '一线城市', 
    color: '#FFD700',
    bgColor: 'from-yellow-500/20 to-orange-500/20',
    description: '经济最发达，投资价值高'
  },
  'new-first': { 
    name: '新一线城市', 
    color: '#3B82F6',
    bgColor: 'from-blue-500/20 to-indigo-500/20',
    description: '快速发展，潜力巨大'
  },
  'second': { 
    name: '二线城市', 
    color: '#10B981',
    bgColor: 'from-green-500/20 to-emerald-500/20',
    description: '稳健增长，价格亲民'
  }
}

// 城市卡片组件
function CityCard({ 
  city, 
  isSelected,
  onClick 
}: { 
  city: City
  isSelected: boolean
  onClick: () => void
}) {
  const tierConfig = CITY_TIERS[city.tier]
  
  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer",
        "bg-gradient-to-br from-gray-900 to-gray-800",
        "rounded-2xl border-2 overflow-hidden",
        "transition-all duration-300",
        isSelected ? "border-gold-500" : "border-gray-700 hover:border-gray-600"
      )}
      onClick={onClick}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 顶部标签 */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        `bg-gradient-to-r ${tierConfig.bgColor}`
      )} />
      
      {/* 状态标记 */}
      {city.status === 'hot' && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
          <Flame className="w-3 h-3" />
          热门
        </div>
      )}
      {city.status === 'recommended' && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
          <Star className="w-3 h-3" />
          推荐
        </div>
      )}

      <div className="p-6">
        {/* 城市信息 */}
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl">{city.emoji}</span>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
            <p className="text-sm text-gray-400">{tierConfig.name} · {city.nameEn}</p>
          </div>
          <div className={cn(
            "text-sm font-bold px-2 py-1 rounded",
            city.priceChange > 5 ? "bg-red-500/20 text-red-500" :
            city.priceChange > 0 ? "bg-green-500/20 text-green-500" :
            "bg-gray-700/50 text-gray-400"
          )}>
            {city.priceChange > 0 ? '+' : ''}{city.priceChange}%
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {city.description}
        </p>

        {/* 数据展示 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <MapPin className="w-3 h-3" />
              <span>开放区域</span>
            </div>
            <p className="text-lg font-bold text-gold-500">{city.districts}个</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Building2 className="w-3 h-3" />
              <span>可用地块</span>
            </div>
            <p className="text-lg font-bold text-green-500">{city.availableLands}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>月收益率</span>
            </div>
            <p className="text-lg font-bold text-blue-500">{city.monthlyReturn}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <BarChart3 className="w-3 h-3" />
              <span>均价</span>
            </div>
            <p className="text-lg font-bold">¥{(city.avgPrice/1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* 特色标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {city.features.slice(0, 3).map((feature, i) => (
            <span 
              key={i}
              className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300"
            >
              {feature}
            </span>
          ))}
          {city.features.length > 3 && (
            <span className="text-xs text-gray-500">
              +{city.features.length - 3}
            </span>
          )}
        </div>

        {/* 进入按钮 */}
        <motion.button
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all",
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-gray-700 to-gray-600",
            "group-hover:from-gold-500 group-hover:to-yellow-600",
            "text-gray-300 group-hover:text-black"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          进入城市
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* 悬浮效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}

// 城市对比雷达图
function CityComparisonRadar({ cities }: { cities: City[] }) {
  const dimensions = [
    { key: 'price', label: '价格水平', max: 60000 },
    { key: 'growth', label: '增长潜力', max: 10 },
    { key: 'lands', label: '可用地块', max: 1000 },
    { key: 'return', label: '收益率', max: 20 },
    { key: 'districts', label: '区域数量', max: 20 }
  ]

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-gold-500" />
        城市数据对比
      </h3>
      
      <div className="relative h-64 flex items-center justify-center">
        {/* 这里简化展示，实际可以接入图表库 */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4">
            {cities.slice(0, 3).map((city) => (
              <div key={city.id} className="text-center">
                <span className="text-2xl block mb-2">{city.emoji}</span>
                <p className="text-sm font-medium text-white">{city.name}</p>
                <p className="text-xs text-gray-500">综合评分</p>
                <p className="text-xl font-bold text-gold-500">
                  {(85 + Math.random() * 10).toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 投资建议组件
function InvestmentGuide() {
  const guides = [
    {
      icon: Shield,
      title: '稳健投资',
      cities: ['北京', '上海'],
      description: '一线城市，价值稳定，适合长期持有'
    },
    {
      icon: Zap,
      title: '高增长',
      cities: ['深圳', '杭州'],
      description: '科技产业发达，增值潜力大'
    },
    {
      icon: Award,
      title: '价值洼地',
      cities: ['成都', '西安'],
      description: '价格亲民，发展空间大'
    }
  ]

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-gold-500" />
        投资建议
      </h3>
      
      <div className="space-y-4">
        {guides.map((guide, index) => {
          const Icon = guide.icon
          return (
            <motion.div
              key={index}
              className="flex gap-4 p-4 bg-gray-800/50 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-500" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{guide.title}</h4>
                <p className="text-xs text-gray-400 mb-2">{guide.description}</p>
                <div className="flex gap-2">
                  {guide.cities.map(city => (
                    <span key={city} className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// 主组件
export default function ChinaMapPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'tier'>('tier')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 获取城市列表
  const cities = Object.values(CITIES_DATA)
  
  // 过滤城市
  const filteredCities = cities.filter(city => {
    if (searchTerm && !city.name.includes(searchTerm) && !city.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filterTier !== 'all' && city.tier !== filterTier) {
      return false
    }
    return true
  })

  // 按层级分组
  const citiesByTier = {
    first: filteredCities.filter(c => c.tier === 'first'),
    'new-first': filteredCities.filter(c => c.tier === 'new-first'),
    second: filteredCities.filter(c => c.tier === 'second')
  }

  // 处理城市选择
  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId)
    // 延迟跳转
    setTimeout(() => {
      window.location.href = `/explore/china/${cityId}`
    }, 300)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1B]">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/explore" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回</span>
              </Link>
              <div className="h-4 w-px bg-gray-700" />
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  中国
                  <span className="text-3xl">🇨🇳</span>
                </h1>
                <p className="text-sm text-gray-400">选择您要投资的城市</p>
              </div>
            </div>

            {/* 视图切换 */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex bg-gray-900/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('tier')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all text-sm font-medium",
                    viewMode === 'tier' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  分级展示
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all text-sm font-medium",
                    viewMode === 'grid' 
                      ? "bg-gold-500 text-black" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  网格展示
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8">
        {/* 搜索和筛选栏 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索城市..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-xl focus:border-gold-500 focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部城市' },
              { value: 'first', label: '一线城市' },
              { value: 'new-first', label: '新一线城市' },
              { value: 'second', label: '二线城市' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterTier(filter.value)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-all text-sm",
                  filterTier === filter.value
                    ? "bg-gold-500 text-black"
                    : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="bg-gradient-to-br from-gold-500/20 to-transparent p-6 rounded-2xl border border-gold-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Building2 className="w-8 h-8 text-gold-500 mb-3" />
            <p className="text-2xl font-bold text-white">{cities.length}</p>
            <p className="text-sm text-gray-400">开放城市</p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-green-500/20 to-transparent p-6 rounded-2xl border border-green-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MapPin className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-white">
              {cities.reduce((sum, c) => sum + c.availableLands, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">可用地块</p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-transparent p-6 rounded-2xl border border-blue-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-8 h-8 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-white">
              +{(cities.reduce((sum, c) => sum + c.priceChange, 0) / cities.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">平均涨幅</p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-purple-500/20 to-transparent p-6 rounded-2xl border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="w-8 h-8 text-purple-500 mb-3" />
            <p className="text-2xl font-bold text-white">3,456</p>
            <p className="text-sm text-gray-400">活跃投资者</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧 - 城市列表 */}
          <div className="lg:col-span-2">
            {viewMode === 'tier' ? (
              /* 分级展示 */
              <div className="space-y-8">
                {Object.entries(citiesByTier).map(([tier, tierCities]) => {
                  if (tierCities.length === 0) return null
                  const tierConfig = CITY_TIERS[tier as keyof typeof CITY_TIERS]
                  
                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-white">{tierConfig.name}</h2>
                        <p className="text-sm text-gray-500">{tierConfig.description}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {tierCities.map(city => (
                          <CityCard
                            key={city.id}
                            city={city}
                            isSelected={selectedCity === city.id}
                            onClick={() => handleCitySelect(city.id)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              /* 网格展示 */
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCities.map(city => (
                  <CityCard
                    key={city.id}
                    city={city}
                    isSelected={selectedCity === city.id}
                    onClick={() => handleCitySelect(city.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 右侧 - 辅助信息 */}
          <div className="space-y-6">
            {/* 投资建议 */}
            <InvestmentGuide />
            
            {/* 城市对比 */}
            <CityComparisonRadar cities={cities.filter(c => c.status === 'hot' || c.status === 'recommended')} />
            
            {/* 新手提示 */}
            <motion.div
              className="bg-gradient-to-br from-gold-500/10 to-transparent rounded-2xl p-6 border border-gold-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                新手建议
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                初次投资建议选择标记为"推荐"的城市，这些城市具有较好的增长潜力和合理的价格。
              </p>
              <Link href="/guide">
                <button className="text-sm text-gold-500 hover:text-gold-400 font-medium">
                  查看投资指南 →
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
