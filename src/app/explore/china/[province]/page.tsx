'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// 城市地图配置 - 大富翁风格
const CITY_MAP_CONFIG = {
  beijing: {
    name: '北京',
    emoji: '🏛️',
    gridSize: { width: 25, height: 20 },
    tileSize: 40,
    center: { lat: 39.9042, lng: 116.4074 },
    zoom: 11,
    districts: [
      { 
        id: 'chaoyang', 
        name: '朝阳区',
        emoji: '🏢',
        type: 'cbd',
        position: { x: 18, y: 10 },
        color: '#FFD700',
        lands: 1200,
        available: 45,
        avgPrice: 45000,
        hot: true,
        description: 'CBD商务区，高端写字楼聚集',
        landmarks: ['国贸', 'CBD', '三里屯']
      },
      { 
        id: 'haidian', 
        name: '海淀区',
        emoji: '💻',
        type: 'tech',
        position: { x: 10, y: 8 },
        color: '#4169E1',
        lands: 980,
        available: 67,
        avgPrice: 38000,
        hot: true,
        description: '科技创新中心，高校云集',
        landmarks: ['中关村', '清华', '北大']
      },
      { 
        id: 'dongcheng', 
        name: '东城区',
        emoji: '🏛️',
        type: 'cultural',
        position: { x: 15, y: 11 },
        color: '#DC143C',
        lands: 650,
        available: 12,
        avgPrice: 52000,
        hot: false,
        description: '历史文化区，古建筑保护',
        landmarks: ['故宫', '天坛', '王府井']
      },
      { 
        id: 'tongzhou', 
        name: '通州区',
        emoji: '🌳',
        type: 'suburban',
        position: { x: 22, y: 12 },
        color: '#90EE90',
        lands: 1500,
        available: 234,
        avgPrice: 22000,
        hot: false,
        description: '城市副中心，发展潜力大',
        landmarks: ['运河公园', '副中心']
      },
      { 
        id: 'xicheng', 
        name: '西城区',
        emoji: '🏛️',
        type: 'cultural',
        position: { x: 13, y: 10 },
        color: '#FFB6C1',
        lands: 580,
        available: 8,
        avgPrice: 48000,
        hot: false,
        description: '政府机关所在地',
        landmarks: ['西单', '金融街']
      },
      { 
        id: 'fengtai', 
        name: '丰台区',
        emoji: '🚂',
        type: 'transport',
        position: { x: 12, y: 14 },
        color: '#FF8C00',
        lands: 820,
        available: 98,
        avgPrice: 28000,
        hot: false,
        description: '交通枢纽区',
        landmarks: ['北京西站', '南站']
      }
    ],
    // 地铁线路
    subwayLines: [
      { from: 'haidian', to: 'xicheng', line: '4号线', color: '#00A0E9' },
      { from: 'xicheng', to: 'dongcheng', line: '6号线', color: '#D47DAA' },
      { from: 'dongcheng', to: 'chaoyang', line: '1号线', color: '#C23A30' },
      { from: 'chaoyang', to: 'tongzhou', line: '八通线', color: '#C23A30' },
      { from: 'fengtai', to: 'chaoyang', line: '10号线', color: '#009BC0' }
    ],
    // 特殊地标
    landmarks: [
      { name: '天安门', emoji: '🏛️', position: { x: 14, y: 11 } },
      { name: '鸟巢', emoji: '🏟️', position: { x: 16, y: 8 } },
      { name: '颐和园', emoji: '🏞️', position: { x: 9, y: 7 } },
      { name: '长城', emoji: '🏯', position: { x: 8, y: 5 } }
    ]
  }
}

// 区域类型配置
const DISTRICT_TYPES = {
  cbd: { name: '商业区', icon: '🏢', color: '#FFD700', desc: '商业繁华，租金收益高' },
  tech: { name: '科技园', icon: '💻', color: '#4169E1', desc: '科技产业，升值潜力大' },
  cultural: { name: '文化区', icon: '🏛️', color: '#DC143C', desc: '历史悠久，稀缺资源' },
  suburban: { name: '郊区', icon: '🌳', color: '#90EE90', desc: '价格亲民，发展空间大' },
  industrial: { name: '工业区', icon: '🏭', color: '#708090', desc: '产业聚集，稳定收益' },
  transport: { name: '交通枢纽', icon: '🚂', color: '#FF8C00', desc: '交通便利，商机无限' }
}

// 地块状态
const LAND_STATUS = {
  available: { color: '#00FF00', text: '可购买', icon: '🟢' },
  owned: { color: '#87CEEB', text: '已售', icon: '🔵' },
  building: { color: '#FFA500', text: '建设中', icon: '🟠' },
  rented: { color: '#FFD700', text: '已出租', icon: '🟡' },
  special: { color: '#FF69B4', text: '特殊地块', icon: '⭐' }
}

// 区域卡片组件
function DistrictCard({
  district,
  isSelected,
  isPlayerHere,
  onClick
}: {
  district: any
  isSelected: boolean
  isPlayerHere: boolean
  onClick: () => void
}) {
  const typeConfig = DISTRICT_TYPES[district.type as keyof typeof DISTRICT_TYPES]

  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer",
        "transition-all duration-200"
      )}
      style={{
        left: district.position.x * CITY_MAP_CONFIG.beijing.tileSize,
        top: district.position.y * CITY_MAP_CONFIG.beijing.tileSize,
        zIndex: isSelected ? 20 : 10
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "relative rounded-lg border-3 p-3",
          "w-32 h-28",
          "shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]",
          isSelected ? 'border-gold-500 ring-4 ring-gold-500/30' : 'border-gray-700',
          district.hot && 'animate-pulse'
        )}
        style={{
          backgroundColor: typeConfig.color + '30',
          borderColor: isSelected ? undefined : typeConfig.color + '80'
        }}
      >
        {/* 区域图标 */}
        <div className="text-center">
          <div className="text-3xl mb-1">{district.emoji}</div>
          <h4 className="font-black text-sm" style={{ color: typeConfig.color }}>
            {district.name}
          </h4>
        </div>

        {/* 区域数据 */}
        <div className="absolute bottom-2 left-0 right-0 px-2">
          <div className="flex justify-between text-xs">
            <span className="text-green-500 font-bold">{district.available}块</span>
            <span className="text-gold-500 font-bold">¥{(district.avgPrice/1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* 热门标记 */}
        {district.hot && (
          <motion.div
            className="absolute -top-2 -right-2 text-lg"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [-10, 10, -10]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            🔥
          </motion.div>
        )}

        {/* 玩家位置 */}
        {isPlayerHere && (
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          >
            📍
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// 地铁线路组件
function SubwayLine({ line, districts }: { line: any; districts: any[] }) {
  const from = districts.find(d => d.id === line.from)
  const to = districts.find(d => d.id === line.to)
  
  if (!from || !to) return null

  const x1 = from.position.x * CITY_MAP_CONFIG.beijing.tileSize + 64
  const y1 = from.position.y * CITY_MAP_CONFIG.beijing.tileSize + 56
  const x2 = to.position.x * CITY_MAP_CONFIG.beijing.tileSize + 64
  const y2 = to.position.y * CITY_MAP_CONFIG.beijing.tileSize + 56

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={line.color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - 5}
        textAnchor="middle"
        fill={line.color}
        fontSize="12"
        fontWeight="bold"
      >
        {line.line}
      </text>
    </g>
  )
}

// 城市地图组件
function CityMap({
  city,
  selectedDistrict,
  playerPosition,
  onDistrictClick
}: {
  city: any
  selectedDistrict: string | null
  playerPosition: string
  onDistrictClick: (districtId: string) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative inline-block">
      <div
        ref={mapRef}
        className="relative bg-gray-900/50 rounded-lg p-8"
        style={{
          width: city.gridSize.width * city.tileSize + 64,
          height: city.gridSize.height * city.tileSize + 64
        }}
      >
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width={city.tileSize} height={city.tileSize} patternUnits="userSpaceOnUse">
                <path d={`M ${city.tileSize} 0 L 0 0 0 ${city.tileSize}`} fill="none" stroke="#444" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 地铁线路 */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {city.subwayLines.map((line: any, index: number) => (
            <SubwayLine key={index} line={line} districts={city.districts} />
          ))}
        </svg>

        {/* 地标 */}
        {city.landmarks.map((landmark: any, index: number) => (
          <motion.div
            key={index}
            className="absolute text-3xl opacity-60"
            style={{
              left: landmark.position.x * city.tileSize,
              top: landmark.position.y * city.tileSize
            }}
            title={landmark.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: index * 0.1 }}
          >
            {landmark.emoji}
          </motion.div>
        ))}

        {/* 区域 */}
        {city.districts.map((district: any) => (
          <DistrictCard
            key={district.id}
            district={district}
            isSelected={selectedDistrict === district.id}
            isPlayerHere={playerPosition === district.id}
            onClick={() => onDistrictClick(district.id)}
          />
        ))}

        {/* 城市名称 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl font-black text-gold-500 pixel-font">
          {city.name}地图
        </div>
      </div>
    </div>
  )
}

// 区域详情面板
function DistrictDetailPanel({
  district,
  onClose,
  onViewLands
}: {
  district: any
  onClose: () => void
  onViewLands: () => void
}) {
  const typeConfig = DISTRICT_TYPES[district.type as keyof typeof DISTRICT_TYPES]
  const [activeTab, setActiveTab] = useState<'overview' | 'lands' | 'invest'>('overview')

  // 生成模拟地块数据
  const generateLands = () => {
    return Array.from({ length: 9 }, (_, i) => ({
      id: `${district.id}-${i + 1}`,
      number: Math.floor(1000 + Math.random() * 9000),
      size: district.type === 'suburban' ? 1000 : 300,
      price: district.avgPrice + Math.floor(Math.random() * 10000) - 5000,
      status: Math.random() > 0.3 ? 'available' : ['owned', 'building', 'rented'][Math.floor(Math.random() * 3)],
      floor: Math.floor(Math.random() * 5) + 1,
      appreciation: Math.floor(Math.random() * 30) + 5
    }))
  }

  const [lands] = useState(generateLands())

  return (
    <motion.div
      className="fixed right-0 top-20 bottom-0 w-[480px] bg-[#0A1628] border-l-4 border-gold-500 overflow-hidden z-40"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {/* 头部 */}
      <div className="p-6 border-b-2 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{district.emoji}</span>
            <div>
              <h2 className="text-2xl font-black" style={{ color: typeConfig.color }}>
                {district.name}
              </h2>
              <p className="text-sm text-gray-500">{typeConfig.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gold-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2">
          {(['overview', 'lands', 'invest'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 font-bold transition-all",
                activeTab === tab
                  ? 'bg-gold-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              {tab === 'overview' ? '📊 概览' : tab === 'lands' ? '🏘️ 地块' : '💰 投资'}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
        <AnimatePresence mode="wait">
          {/* 概览 */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-gray-400">{district.description}</p>
              <p className="text-sm text-gray-500">{typeConfig.desc}</p>

              {/* 数据统计 */}
              <div className="grid grid-cols-2 gap-4">
                <PixelCard className="p-4 text-center">
                  <div className="text-3xl font-black text-gold-500">
                    {district.lands}
                  </div>
                  <div className="text-xs text-gray-500">总地块</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-3xl font-black text-green-500">
                    {district.available}
                  </div>
                  <div className="text-xs text-gray-500">可购买</div>
                </PixelCard>
                <PixelCard className="p-4 text-center col-span-2">
                  <div className="text-3xl font-black text-gold-500">
                    ¥{district.avgPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">平均价格/块</div>
                </PixelCard>
              </div>

              {/* 地标建筑 */}
              {district.landmarks && (
                <div>
                  <h3 className="font-bold mb-3 text-gold-500">🏛️ 地标建筑</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {district.landmarks.map((landmark: string) => (
                      <div key={landmark} className="p-3 bg-gray-800 rounded flex items-center gap-2">
                        <span className="text-2xl">🏢</span>
                        <span className="text-sm font-bold">{landmark}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 区域特色 */}
              <PixelCard className="p-4 bg-gradient-to-br from-gold-500/20 to-transparent">
                <h4 className="font-bold mb-2 text-gold-500">✨ 区域特色</h4>
                <div className="space-y-2 text-sm">
                  <p>• {district.hot ? '🔥 投资热门地区' : '💎 潜力投资区域'}</p>
                  <p>• 预计月收益 <span className="text-green-500 font-bold">8-12%</span></p>
                  <p>• 适合{district.type === 'cbd' ? '商业开发' : district.type === 'tech' ? '科技产业' : '多元投资'}</p>
                </div>
              </PixelCard>
            </motion.div>
          )}

          {/* 地块列表 */}
          {activeTab === 'lands' && (
            <motion.div
              key="lands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gold-500">热门地块</h3>
                <button
                  onClick={onViewLands}
                  className="text-sm text-gold-500 hover:underline"
                >
                  查看全部 →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {lands.map((land, index) => {
                  const status = LAND_STATUS[land.status as keyof typeof LAND_STATUS]
                  return (
                    <motion.div
                      key={land.id}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        land.status === 'available' 
                          ? 'border-green-500 hover:border-gold-500' 
                          : 'border-gray-700 opacity-75'
                      )}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-center">
                        <div className="text-xs font-bold mb-1">#{land.number}</div>
                        <div className="text-2xl mb-1">{status.icon}</div>
                        <div className="text-xs text-gray-500">{land.size}㎡</div>
                        {land.status === 'available' && (
                          <div className="text-sm font-bold text-gold-500 mt-1">
                            ¥{(land.price/1000).toFixed(0)}k
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* 地块状态说明 */}
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <h4 className="font-bold mb-3 text-sm">地块状态说明</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(LAND_STATUS).map(([key, status]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-lg">{status.icon}</span>
                      <span className="text-gray-400">{status.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 投资分析 */}
          {activeTab === 'invest' && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* 投资建议 */}
              <PixelCard className="p-4 bg-gradient-to-br from-gold-500/20 to-transparent">
                <h3 className="font-bold mb-3 text-gold-500">💎 投资价值分析</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">投资评级</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={i <= 4 ? 'text-gold-500' : 'text-gray-600'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">风险等级</span>
                    <span className="text-sm font-bold text-green-500">低风险</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">预期收益</span>
                    <span className="text-sm font-bold text-gold-500">8-12%/月</span>
                  </div>
                </div>
              </PixelCard>

              {/* 投资计算器 */}
              <PixelCard className="p-4">
                <h4 className="font-bold mb-3">📊 收益计算器</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">投资金额</label>
                    <div className="mt-1 p-2 bg-gray-800 rounded text-gold-500 font-bold">
                      ¥100,000
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-gray-800 rounded">
                      <div className="text-gray-400">月收益</div>
                      <div className="text-green-500 font-bold">¥8,000-12,000</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded">
                      <div className="text-gray-400">年收益</div>
                      <div className="text-green-500 font-bold">¥96,000-144,000</div>
                    </div>
                  </div>
                </div>
              </PixelCard>

              {/* 投资建议 */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <p className="text-sm text-green-500">
                  💡 <strong>投资建议：</strong>
                  {district.hot ? '该区域热度高，适合短期投资获利' : '该区域价格合理，适合长期持有'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部操作 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0A1628] border-t-2 border-gray-800">
        <PixelButton
          className="w-full"
          size="lg"
          onClick={onViewLands}
        >
          <span className="mr-2">🏘️</span>
          查看{district.name}所有地块
        </PixelButton>
      </div>
    </motion.div>
  )
}

// 快速操作面板
function QuickActions({ 
  currentDistrict,
  onAction 
}: {
  currentDistrict: string
  onAction: (action: string) => void
}) {
  const actions = [
    { id: 'buy', icon: '🛒', label: '购买地块', color: 'bg-green-500' },
    { id: 'build', icon: '🏗️', label: '建设房产', color: 'bg-blue-500' },
    { id: 'rent', icon: '💰', label: '出租管理', color: 'bg-gold-500' },
    { id: 'sell', icon: '💸', label: '出售资产', color: 'bg-red-500' }
  ]

  return (
    <PixelCard className="p-4">
      <h3 className="font-bold mb-3 text-gold-500">⚡ 快速操作</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            className={cn(
              "p-3 rounded text-white font-bold transition-all",
              action.color,
              "hover:opacity-80"
            )}
            onClick={() => onAction(action.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-xs">{action.label}</div>
          </motion.button>
        ))}
      </div>
    </PixelCard>
  )
}

// 区域排行榜
function DistrictRanking({ districts }: { districts: any[] }) {
  const sortedDistricts = [...districts].sort((a, b) => b.avgPrice - a.avgPrice)

  return (
    <PixelCard className="p-4">
      <h3 className="font-bold mb-3 text-gold-500">🏆 区域价值排行</h3>
      <div className="space-y-2">
        {sortedDistricts.slice(0, 5).map((district, index) => (
          <div key={district.id} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gold-500">#{index + 1}</span>
              <div>
                <p className="font-bold text-sm">{district.name}</p>
                <p className="text-xs text-gray-500">{district.available}块可用</p>
              </div>
            </div>
            <span className="text-sm font-bold text-gold-500">
              ¥{(district.avgPrice/1000).toFixed(0)}k
            </span>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

export default function ProvinceDetailPage() {
  const params = useParams()
  const provinceId = params.province as string
  const cityData = CITY_MAP_CONFIG[provinceId as keyof typeof CITY_MAP_CONFIG] || CITY_MAP_CONFIG.beijing

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [playerPosition, setPlayerPosition] = useState('chaoyang')
  const [showAnimation, setShowAnimation] = useState(false)

  // 处理区域点击
  const handleDistrictClick = (districtId: string) => {
    setSelectedDistrict(districtId)
    
    // 模拟移动动画
    if (districtId !== playerPosition) {
      setShowAnimation(true)
      setTimeout(() => {
        setPlayerPosition(districtId)
        setShowAnimation(false)
      }, 800)
    }
  }

  // 查看地块列表
  const handleViewLands = () => {
    if (selectedDistrict) {
      window.location.href = `/explore/lands?province=${provinceId}&district=${selectedDistrict}`
    }
  }

  // 快速操作
  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action)
    // 这里可以实现具体的操作逻辑
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0A1628]/95 backdrop-blur border-b-4 border-gold-500">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/explore/china" className="text-gray-400 hover:text-gold-500">
                ← 返回中国地图
              </Link>
              <h1 className="text-2xl font-black text-gold-500 pixel-font">
                {cityData.name} <span className="text-xl">{cityData.emoji}</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">总地块:</span>
                <span className="text-gold-500 font-bold ml-2">
                  {cityData.districts.reduce((sum, d) => sum + d.lands, 0).toLocaleString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">可用:</span>
                <span className="text-green-500 font-bold ml-2">
                  {cityData.districts.reduce((sum, d) => sum + d.available, 0)}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 主内容区 */}
      <div className="pt-20 pb-8">
        <div className="flex">
          {/* 左侧面板 */}
          <div className="w-80 p-6 space-y-6">
            <QuickActions 
              currentDistrict={playerPosition}
              onAction={handleQuickAction}
            />
            <DistrictRanking districts={cityData.districts} />
          </div>

          {/* 中间地图 */}
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* 移动动画 */}
              {showAnimation && (
                <motion.div
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <div className="bg-gold-500 text-black px-8 py-4 rounded-lg font-black text-xl">
                    🚇 地铁移动中...
                  </div>
                </motion.div>
              )}

              <CityMap
                city={cityData}
                selectedDistrict={selectedDistrict}
                playerPosition={playerPosition}
                onDistrictClick={handleDistrictClick}
              />
            </motion.div>
          </div>

          {/* 右侧提示 */}
          <div className="w-80 p-6">
            <PixelCard className="p-4">
              <h3 className="font-bold mb-3 text-gold-500">📍 当前位置</h3>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {cityData.districts.find(d => d.id === playerPosition)?.emoji}
                </div>
                <h4 className="font-bold text-lg">
                  {cityData.districts.find(d => d.id === playerPosition)?.name}
                </h4>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <p>• 🚇 地铁连接各区</p>
                <p>• 🔥 标记热门投资区</p>
                <p>• 📍 显示您的位置</p>
                <p>• 点击区域查看详情</p>
              </div>

              <div className="mt-4 p-3 bg-gold-500/10 rounded">
                <p className="text-xs text-gold-500">
                  💡 不同区域有不同投资价值，选择适合您的投资策略
                </p>
              </div>
            </PixelCard>
          </div>
        </div>

        {/* 区域详情面板 */}
        <AnimatePresence>
          {selectedDistrict && (
            <DistrictDetailPanel
              district={cityData.districts.find(d => d.id === selectedDistrict)}
              onClose={() => setSelectedDistrict(null)}
              onViewLands={handleViewLands}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
