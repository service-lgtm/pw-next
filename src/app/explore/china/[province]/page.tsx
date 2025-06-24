'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Building2, TrendingUp, Info,
  Zap, Filter, Search, Layers, Navigation, Eye,
  Maximize2, Move, Building, TreePine, Train,
  Landmark, ShoppingBag, GraduationCap, Briefcase
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// 类型定义
interface District {
  id: string
  name: string
  type: 'cbd' | 'tech' | 'cultural' | 'residential' | 'suburban' | 'educational'
  polygon: { x: number; y: number }[]
  center: { x: number; y: number }
  color: string
  totalLands: number
  availableLands: number
  avgPrice: number
  priceChange: number
  description: string
  features: string[]
}

interface DistrictsMap {
  [key: string]: District
}

interface Landmark {
  id: string
  name: string
  type: 'tourist' | 'business' | 'transport' | 'education' | 'shopping'
  position: { x: number; y: number }
  icon: any
  description: string
  nearbyDistricts: string[]
}

interface SubwayLine {
  id: string
  name: string
  color: string
  stations: { x: number; y: number; name: string }[]
}

// 北京地图数据配置
const BEIJING_MAP_DATA: {
  boundary: {
    width: number
    height: number
    viewBox: string
  }
  districts: DistrictsMap
  landmarks: Landmark[]
  subwayLines: SubwayLine[]
} = {
  // 地图边界（简化的北京轮廓）
  boundary: {
    width: 1000,
    height: 800,
    viewBox: '0 0 1000 800'
  },
  
  // 区域数据
  districts: {
    dongcheng: {
      id: 'dongcheng',
      name: '东城区',
      type: 'cultural' as const,
      polygon: [
        { x: 480, y: 350 },
        { x: 520, y: 340 },
        { x: 540, y: 380 },
        { x: 530, y: 420 },
        { x: 490, y: 430 },
        { x: 470, y: 390 }
      ],
      center: { x: 505, y: 385 },
      color: '#DC143C',
      totalLands: 650,
      availableLands: 12,
      avgPrice: 52000,
      priceChange: 2.1,
      description: '历史文化核心区',
      features: ['皇城遗址', '胡同文化', '保护建筑']
    },
    xicheng: {
      id: 'xicheng',
      name: '西城区',
      type: 'cultural',
      polygon: [
        { x: 420, y: 350 },
        { x: 480, y: 350 },
        { x: 470, y: 390 },
        { x: 460, y: 430 },
        { x: 410, y: 420 },
        { x: 400, y: 380 }
      ],
      center: { x: 440, y: 385 },
      color: '#FF69B4',
      totalLands: 580,
      availableLands: 8,
      avgPrice: 48000,
      priceChange: 1.8,
      description: '金融街所在地',
      features: ['金融中心', '政府机关', '历史街区']
    },
    chaoyang: {
      id: 'chaoyang',
      name: '朝阳区',
      type: 'cbd',
      polygon: [
        { x: 540, y: 340 },
        { x: 680, y: 320 },
        { x: 720, y: 400 },
        { x: 700, y: 480 },
        { x: 560, y: 460 },
        { x: 530, y: 420 },
        { x: 540, y: 380 }
      ],
      center: { x: 620, y: 400 },
      color: '#FFD700',
      totalLands: 1200,
      availableLands: 45,
      avgPrice: 45000,
      priceChange: 5.8,
      description: 'CBD商务核心区',
      features: ['国际商务', '高端住宅', '使馆区']
    },
    haidian: {
      id: 'haidian',
      name: '海淀区',
      type: 'tech',
      polygon: [
        { x: 280, y: 280 },
        { x: 420, y: 300 },
        { x: 420, y: 350 },
        { x: 400, y: 380 },
        { x: 320, y: 360 },
        { x: 260, y: 320 }
      ],
      center: { x: 340, y: 330 },
      color: '#4169E1',
      totalLands: 980,
      availableLands: 67,
      avgPrice: 38000,
      priceChange: 4.2,
      description: '科技创新中心',
      features: ['中关村', '高校云集', '科研院所']
    },
    fengtai: {
      id: 'fengtai',
      name: '丰台区',
      type: 'residential',
      polygon: [
        { x: 380, y: 480 },
        { x: 460, y: 430 },
        { x: 490, y: 430 },
        { x: 520, y: 520 },
        { x: 450, y: 560 },
        { x: 360, y: 540 }
      ],
      center: { x: 440, y: 495 },
      color: '#90EE90',
      totalLands: 820,
      availableLands: 98,
      avgPrice: 28000,
      priceChange: 3.5,
      description: '宜居生活区',
      features: ['交通枢纽', '生活便利', '房价适中']
    },
    tongzhou: {
      id: 'tongzhou',
      name: '通州区',
      type: 'suburban',
      polygon: [
        { x: 720, y: 400 },
        { x: 850, y: 380 },
        { x: 880, y: 460 },
        { x: 860, y: 520 },
        { x: 740, y: 500 },
        { x: 700, y: 480 }
      ],
      center: { x: 790, y: 450 },
      color: '#FF69B4',
      totalLands: 1500,
      availableLands: 234,
      avgPrice: 22000,
      priceChange: 8.2,
      description: '城市副中心',
      features: ['新城开发', '环球影城', '运河文化']
    }
  },
  
  // 地标数据
  landmarks: [
    {
      id: 'tiananmen',
      name: '天安门',
      type: 'tourist',
      position: { x: 490, y: 400 },
      icon: Landmark,
      description: '中国的象征',
      nearbyDistricts: ['dongcheng', 'xicheng']
    },
    {
      id: 'forbidden-city',
      name: '故宫',
      type: 'tourist',
      position: { x: 490, y: 380 },
      icon: Landmark,
      description: '世界最大的宫殿建筑群',
      nearbyDistricts: ['dongcheng']
    },
    {
      id: 'cbd',
      name: 'CBD中央商务区',
      type: 'business',
      position: { x: 640, y: 420 },
      icon: Building,
      description: '北京商业中心',
      nearbyDistricts: ['chaoyang']
    },
    {
      id: 'zhongguancun',
      name: '中关村',
      type: 'business',
      position: { x: 340, y: 330 },
      icon: Briefcase,
      description: '中国硅谷',
      nearbyDistricts: ['haidian']
    },
    {
      id: 'wangfujing',
      name: '王府井',
      type: 'shopping',
      position: { x: 520, y: 390 },
      icon: ShoppingBag,
      description: '著名商业街',
      nearbyDistricts: ['dongcheng']
    },
    {
      id: 'tsinghua',
      name: '清华大学',
      type: 'education',
      position: { x: 320, y: 310 },
      icon: GraduationCap,
      description: '顶尖学府',
      nearbyDistricts: ['haidian']
    },
    {
      id: 'beijing-west',
      name: '北京西站',
      type: 'transport',
      position: { x: 420, y: 470 },
      icon: Train,
      description: '重要交通枢纽',
      nearbyDistricts: ['fengtai', 'xicheng']
    },
    {
      id: 'universal',
      name: '环球影城',
      type: 'tourist',
      position: { x: 820, y: 460 },
      icon: Landmark,
      description: '大型主题公园',
      nearbyDistricts: ['tongzhou']
    }
  ],
  
  // 地铁线路（简化）
  subwayLines: [
    {
      id: 'line1',
      name: '1号线',
      color: '#C23A30',
      stations: [
        { x: 280, y: 390, name: '苹果园' },
        { x: 420, y: 390, name: '西单' },
        { x: 490, y: 390, name: '天安门' },
        { x: 520, y: 390, name: '王府井' },
        { x: 640, y: 390, name: '国贸' }
      ]
    },
    {
      id: 'line2',
      name: '2号线',
      color: '#004A90',
      stations: [
        { x: 420, y: 350, name: '西直门' },
        { x: 490, y: 350, name: '鼓楼' },
        { x: 540, y: 380, name: '朝阳门' },
        { x: 540, y: 420, name: '建国门' },
        { x: 490, y: 430, name: '北京站' }
      ]
    }
  ]
}

// 区域类型配置
const DISTRICT_TYPES = {
  cbd: { name: '商务区', icon: Building, desc: '商业核心，租金收益高' },
  tech: { name: '科技区', icon: Briefcase, desc: '创新中心，增值潜力大' },
  cultural: { name: '文化区', icon: Landmark, desc: '历史底蕴，资源稀缺' },
  residential: { name: '住宅区', icon: Building2, desc: '生活便利，需求稳定' },
  suburban: { name: '新城区', icon: TreePine, desc: '发展迅速，价格亲民' },
  educational: { name: '文教区', icon: GraduationCap, desc: '教育资源，长期价值' }
}

// 马赛克地图组件
function MosaicMap({ 
  city,
  selectedDistrict,
  hoveredDistrict,
  onDistrictClick,
  onDistrictHover
}: {
  city: string
  selectedDistrict: string | null
  hoveredDistrict: string | null
  onDistrictClick: (districtId: string) => void
  onDistrictHover: (districtId: string | null) => void
}) {
  const mapData = BEIJING_MAP_DATA // 实际应根据city参数选择不同城市数据
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // 处理缩放
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)))
  }

  // 处理拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && svgRef.current) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="relative bg-gray-900/30 rounded-2xl overflow-hidden" style={{ height: '700px' }}>
      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Maximize2 className="w-4 h-4 rotate-180" />
        </button>
        <button
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
          className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* 地图图例 */}
      <div className="absolute bottom-4 left-4 z-20 bg-gray-800/80 backdrop-blur p-4 rounded-lg">
        <h4 className="text-sm font-bold text-white mb-2">图例</h4>
        <div className="space-y-2 text-xs">
          {Object.entries(DISTRICT_TYPES).slice(0, 4).map(([key, type]) => (
            <div key={key} className="flex items-center gap-2">
              <type.icon className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG地图 */}
      <svg
        ref={svgRef}
        className={cn(
          "w-full h-full",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        viewBox={mapData.boundary.viewBox}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="none" stroke="#1F2937" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

          {/* 地铁线路 */}
          <g opacity="0.6">
            {mapData.subwayLines.map(line => (
              <g key={line.id}>
                <polyline
                  points={line.stations.map(s => `${s.x},${s.y}`).join(' ')}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {line.stations.map((station, index) => (
                  <circle
                    key={index}
                    cx={station.x}
                    cy={station.y}
                    r="4"
                    fill={line.color}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* 区域多边形 */}
          {Object.values(mapData.districts).map(district => {
            const isHovered = hoveredDistrict === district.id
            const isSelected = selectedDistrict === district.id
            
            return (
              <motion.g
                key={district.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* 区域形状 */}
                <motion.polygon
                  points={district.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                  fill={district.color}
                  fillOpacity={isSelected ? 0.3 : isHovered ? 0.25 : 0.15}
                  stroke={district.color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => onDistrictHover(district.id)}
                  onMouseLeave={() => onDistrictHover(null)}
                  onClick={() => onDistrictClick(district.id)}
                  whileHover={{ fillOpacity: 0.25 }}
                />
                
                {/* 区域名称 */}
                <text
                  x={district.center.x}
                  y={district.center.y}
                  textAnchor="middle"
                  className="fill-white font-bold text-sm pointer-events-none"
                  style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {district.name}
                </text>
                
                {/* 可用地块数 */}
                <text
                  x={district.center.x}
                  y={district.center.y + 20}
                  textAnchor="middle"
                  className="fill-green-400 text-xs pointer-events-none"
                  style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {district.availableLands} 块可用
                </text>
              </motion.g>
            )
          })}

          {/* 地标 */}
          {mapData.landmarks.map((landmark, index) => {
            const Icon = landmark.icon
            return (
              <motion.g
                key={landmark.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.5 }}
                className="cursor-pointer"
              >
                {/* 地标背景 */}
                <circle
                  cx={landmark.position.x}
                  cy={landmark.position.y}
                  r="20"
                  fill="#1F2937"
                  fillOpacity="0.8"
                />
                
                {/* 地标图标 */}
                <foreignObject
                  x={landmark.position.x - 12}
                  y={landmark.position.y - 12}
                  width="24"
                  height="24"
                >
                  <Icon className="w-6 h-6 text-gold-500" />
                </foreignObject>
                
                {/* 地标名称 */}
                <text
                  x={landmark.position.x}
                  y={landmark.position.y + 30}
                  textAnchor="middle"
                  className="fill-gray-300 text-xs"
                  style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {landmark.name}
                </text>
              </motion.g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// 区域信息卡片
function DistrictInfoCard({ 
  district,
  onClose,
  onViewDetails
}: {
  district: District
  onClose: () => void
  onViewDetails: () => void
}) {
  const typeConfig = DISTRICT_TYPES[district.type]
  const Icon = typeConfig.icon

  return (
    <motion.div
      className="absolute bottom-4 right-4 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden z-30"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
    >
      {/* 头部 */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{district.name}</h3>
              <p className="text-sm text-gray-400">{typeConfig.name} · {typeConfig.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-6">
        <p className="text-gray-300 mb-4">{district.description}</p>

        {/* 数据展示 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">总地块</p>
            <p className="text-lg font-bold">{district.totalLands}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">可购买</p>
            <p className="text-lg font-bold text-green-500">{district.availableLands}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">均价</p>
            <p className="text-lg font-bold text-gold-500">¥{(district.avgPrice/1000).toFixed(0)}k</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">涨幅</p>
            <p className={cn(
              "text-lg font-bold",
              district.priceChange > 0 ? "text-green-500" : "text-red-500"
            )}>
              {district.priceChange > 0 ? '+' : ''}{district.priceChange}%
            </p>
          </div>
        </div>

        {/* 特色 */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">区域特色</p>
          <div className="flex flex-wrap gap-2">
            {district.features.map((feature, i) => (
              <span key={i} className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <motion.button
          onClick={onViewDetails}
          className="w-full bg-gradient-to-r from-gold-500 to-yellow-600 text-black py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-gold-500/25 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          查看地块详情
        </motion.button>
      </div>
    </motion.div>
  )
}

// 城市统计面板
function CityStatsPanel({ city }: { city: string }) {
  const districts = Object.values(BEIJING_MAP_DATA.districts)
  const stats = {
    totalDistricts: districts.length,
    totalLands: districts.reduce((sum, d) => sum + d.totalLands, 0),
    availableLands: districts.reduce((sum, d) => sum + d.availableLands, 0),
    avgPrice: Math.floor(districts.reduce((sum, d) => sum + d.avgPrice, 0) / districts.length),
    hotDistricts: districts.filter(d => d.priceChange > 4).length
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-gold-500" />
        北京概况
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-white">{stats.totalDistricts}</p>
          <p className="text-sm text-gray-400">开放区域</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-green-500">{stats.availableLands}</p>
          <p className="text-sm text-gray-400">可用地块</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gold-500">¥{(stats.avgPrice/1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-400">平均价格</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-500">{stats.hotDistricts}</p>
          <p className="text-sm text-gray-400">热门区域</p>
        </div>
      </div>
    </div>
  )
}

// 区域排行榜
function DistrictRanking() {
  const districts = Object.values(BEIJING_MAP_DATA.districts)
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 5)

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-gold-500" />
        价值排行榜
      </h3>
      
      <div className="space-y-3">
        {districts.map((district, index) => (
          <div key={district.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gold-500">#{index + 1}</span>
              <div>
                <p className="font-medium text-white">{district.name}</p>
                <p className="text-xs text-gray-500">{district.availableLands}块可用</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gold-500">¥{(district.avgPrice/1000).toFixed(0)}k</p>
              <p className={cn(
                "text-xs",
                district.priceChange > 0 ? "text-green-500" : "text-red-500"
              )}>
                {district.priceChange > 0 ? '+' : ''}{district.priceChange}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 主组件
export default function CityDetailPage() {
  const params = useParams()
  const cityId = params.city as string
  
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [showDistrictInfo, setShowDistrictInfo] = useState(false)

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

  // 处理区域点击
  const handleDistrictClick = (districtId: string) => {
    setSelectedDistrict(districtId)
    setShowDistrictInfo(true)
  }

  // 查看区域详情
  const handleViewDetails = () => {
    if (selectedDistrict) {
      window.location.href = `/explore/china/${cityId}/${selectedDistrict}`
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
                  <span className="text-3xl">🏛️</span>
                </h1>
                <p className="text-sm text-gray-400">选择投资区域</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors">
                <Layers className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 左侧信息面板 */}
          <div className="lg:col-span-1 space-y-6">
            <CityStatsPanel city={cityId} />
            <DistrictRanking />
          </div>

          {/* 中间地图 */}
          <div className="lg:col-span-3">
            <MosaicMap
              city={cityId}
              selectedDistrict={selectedDistrict}
              hoveredDistrict={hoveredDistrict}
              onDistrictClick={handleDistrictClick}
              onDistrictHover={setHoveredDistrict}
            />
          </div>
        </div>
      </div>

      {/* 区域信息弹窗 */}
      <AnimatePresence>
        {showDistrictInfo && selectedDistrict && BEIJING_MAP_DATA.districts[selectedDistrict as keyof typeof BEIJING_MAP_DATA.districts] && (
          <DistrictInfoCard
            district={BEIJING_MAP_DATA.districts[selectedDistrict as keyof typeof BEIJING_MAP_DATA.districts]}
            onClose={() => setShowDistrictInfo(false)}
            onViewDetails={handleViewDetails}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
