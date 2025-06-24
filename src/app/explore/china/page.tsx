'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 中国地图配置 - 大富翁风格
const CHINA_MAP_CONFIG = {
  gridSize: { width: 30, height: 20 },
  tileSize: 32,
  provinces: {
    beijing: {
      id: 'beijing',
      name: '北京',
      type: 'capital',
      emoji: '🏛️',
      position: { x: 20, y: 6 },
      color: '#FFD700',
      price: 50000,
      lands: 5680,
      available: 256,
      avgPrice: 28888,
      monthlyReturn: '12-15%',
      hot: true,
      description: '首都，政治经济中心',
      neighbors: ['tianjin', 'hebei'],
      buildings: ['天安门', '故宫', 'CBD']
    },
    shanghai: {
      id: 'shanghai',
      name: '上海',
      type: 'megacity',
      emoji: '🌃',
      position: { x: 23, y: 11 },
      color: '#FF6B6B',
      price: 60000,
      lands: 4560,
      available: 189,
      avgPrice: 32888,
      monthlyReturn: '10-13%',
      hot: true,
      description: '魔都，金融中心',
      neighbors: ['jiangsu', 'zhejiang'],
      buildings: ['外滩', '陆家嘴', '浦东']
    },
    guangdong: {
      id: 'guangdong',
      name: '广东',
      type: 'province',
      emoji: '🏙️',
      position: { x: 19, y: 16 },
      color: '#4ECDC4',
      price: 45000,
      lands: 8900,
      available: 1234,
      avgPrice: 22888,
      monthlyReturn: '8-12%',
      hot: true,
      description: '经济大省，制造业基地',
      neighbors: ['guangxi', 'hunan', 'jiangxi', 'fujian'],
      cities: ['广州', '深圳', '东莞', '佛山']
    },
    sichuan: {
      id: 'sichuan',
      name: '四川',
      type: 'province',
      emoji: '🌶️',
      position: { x: 12, y: 11 },
      color: '#95E1D3',
      price: 25000,
      lands: 3200,
      available: 890,
      avgPrice: 12888,
      monthlyReturn: '6-10%',
      hot: false,
      description: '天府之国，美食之都',
      neighbors: ['chongqing', 'yunnan', 'guizhou', 'shaanxi', 'gansu', 'qinghai', 'xizang'],
      cities: ['成都', '绵阳', '德阳']
    },
    zhejiang: {
      id: 'zhejiang',
      name: '浙江',
      type: 'province',
      emoji: '💰',
      position: { x: 22, y: 12 },
      color: '#A8E6CF',
      price: 40000,
      lands: 4200,
      available: 567,
      avgPrice: 25888,
      monthlyReturn: '9-12%',
      hot: true,
      description: '民营经济发达',
      neighbors: ['shanghai', 'jiangsu', 'anhui', 'jiangxi', 'fujian'],
      cities: ['杭州', '宁波', '温州']
    },
    jiangsu: {
      id: 'jiangsu',
      name: '江苏',
      type: 'province',
      emoji: '🏭',
      position: { x: 21, y: 10 },
      color: '#FFD93D',
      price: 38000,
      lands: 5100,
      available: 789,
      avgPrice: 20888,
      monthlyReturn: '8-11%',
      hot: true,
      description: '经济强省',
      neighbors: ['shanghai', 'zhejiang', 'anhui', 'shandong'],
      cities: ['南京', '苏州', '无锡']
    },
    shandong: {
      id: 'shandong',
      name: '山东',
      type: 'province',
      emoji: '🥟',
      position: { x: 20, y: 8 },
      color: '#6BCF7F',
      price: 30000,
      lands: 4800,
      available: 923,
      avgPrice: 15888,
      monthlyReturn: '7-10%',
      hot: false,
      description: '人口大省，工业基地',
      neighbors: ['hebei', 'henan', 'anhui', 'jiangsu'],
      cities: ['济南', '青岛', '烟台']
    }
  },
  // 交通线路
  routes: [
    { from: 'beijing', to: 'shanghai', type: 'highspeed', emoji: '🚄', time: '4小时' },
    { from: 'beijing', to: 'guangdong', type: 'flight', emoji: '✈️', time: '3小时' },
    { from: 'shanghai', to: 'guangdong', type: 'highspeed', emoji: '🚄', time: '7小时' },
    { from: 'shanghai', to: 'sichuan', type: 'flight', emoji: '✈️', time: '3小时' }
  ],
  // 特殊地标
  landmarks: [
    { name: '长城', emoji: '🏯', position: { x: 19, y: 5 } },
    { name: '黄河', emoji: '🌊', position: { x: 18, y: 9 } },
    { name: '长江', emoji: '🌊', position: { x: 20, y: 13 } },
    { name: '珠江', emoji: '🌊', position: { x: 19, y: 17 } }
  ]
}

// 省份卡片组件
function ProvinceCard({ 
  province, 
  isSelected,
  isPlayerHere,
  onClick 
}: {
  province: any
  isSelected: boolean
  isPlayerHere: boolean
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer",
        "transition-all duration-200"
      )}
      style={{
        left: province.position.x * CHINA_MAP_CONFIG.tileSize,
        top: province.position.y * CHINA_MAP_CONFIG.tileSize,
        zIndex: isSelected || isHovered ? 20 : 10
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "relative rounded-lg border-3",
          "w-24 h-20 p-2",
          "flex flex-col items-center justify-center",
          "shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]",
          isSelected ? 'border-gold-500 ring-4 ring-gold-500/30' : 'border-gray-700',
          province.hot && 'animate-pulse'
        )}
        style={{
          backgroundColor: province.color + '40',
          borderColor: isHovered ? province.color : undefined
        }}
      >
        {/* 省份图标 */}
        <motion.div
          className="text-3xl mb-1"
          animate={isPlayerHere ? {
            y: [0, -5, 0],
            rotate: [-5, 5, -5]
          } : {}}
          transition={{
            duration: 1,
            repeat: isPlayerHere ? Infinity : 0
          }}
        >
          {province.emoji}
        </motion.div>
        
        {/* 省份名称 */}
        <div className="text-xs font-black" style={{ color: province.color }}>
          {province.name}
        </div>

        {/* 热门标记 */}
        {province.hot && (
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

        {/* 可用地块数 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs px-2 rounded-full font-bold">
          {province.available}块
        </div>

        {/* 玩家标记 */}
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

// 交通路线组件
function RouteConnection({ route, provinces }: { route: any, provinces: any }) {
  const from = provinces[route.from]
  const to = provinces[route.to]
  
  if (!from || !to) return null

  const x1 = from.position.x * CHINA_MAP_CONFIG.tileSize + 48
  const y1 = from.position.y * CHINA_MAP_CONFIG.tileSize + 40
  const x2 = to.position.x * CHINA_MAP_CONFIG.tileSize + 48
  const y2 = to.position.y * CHINA_MAP_CONFIG.tileSize + 40

  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <g className="pointer-events-none">
      {/* 路线 */}
      <motion.path
        d={`M ${x1} ${y1} Q ${midX} ${midY - 50} ${x2} ${y2}`}
        stroke={route.type === 'highspeed' ? '#4169E1' : '#FF6347'}
        strokeWidth="2"
        fill="none"
        strokeDasharray={route.type === 'flight' ? '5,5' : '0'}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* 交通工具图标 */}
      <motion.text
        x={midX}
        y={midY - 25}
        textAnchor="middle"
        fontSize="20"
        animate={{
          x: [x1, x2],
          y: [y1, y2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        {route.emoji}
      </motion.text>
    </g>
  )
}

// 游戏地图组件
function ChinaGameMap({ 
  selectedProvince,
  playerPosition,
  onProvinceClick 
}: {
  selectedProvince: string | null
  playerPosition: string
  onProvinceClick: (provinceId: string) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative inline-block">
      {/* 地图背景 */}
      <div 
        ref={mapRef}
        className="relative bg-gray-900/50 rounded-lg p-8"
        style={{
          width: CHINA_MAP_CONFIG.gridSize.width * CHINA_MAP_CONFIG.tileSize + 64,
          height: CHINA_MAP_CONFIG.gridSize.height * CHINA_MAP_CONFIG.tileSize + 64
        }}
      >
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width={CHINA_MAP_CONFIG.tileSize} height={CHINA_MAP_CONFIG.tileSize} patternUnits="userSpaceOnUse">
                <path d={`M ${CHINA_MAP_CONFIG.tileSize} 0 L 0 0 0 ${CHINA_MAP_CONFIG.tileSize}`} fill="none" stroke="#444" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 交通路线 */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {CHINA_MAP_CONFIG.routes.map((route, index) => (
            <RouteConnection key={index} route={route} provinces={CHINA_MAP_CONFIG.provinces} />
          ))}
        </svg>

        {/* 地标 */}
        {CHINA_MAP_CONFIG.landmarks.map((landmark, index) => (
          <motion.div
            key={index}
            className="absolute text-2xl opacity-50"
            style={{
              left: landmark.position.x * CHINA_MAP_CONFIG.tileSize,
              top: landmark.position.y * CHINA_MAP_CONFIG.tileSize
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: index * 0.1 }}
            title={landmark.name}
          >
            {landmark.emoji}
          </motion.div>
        ))}

        {/* 省份 */}
        {Object.values(CHINA_MAP_CONFIG.provinces).map((province) => (
          <ProvinceCard
            key={province.id}
            province={province}
            isSelected={selectedProvince === province.id}
            isPlayerHere={playerPosition === province.id}
            onClick={() => onProvinceClick(province.id)}
          />
        ))}

        {/* 地图标题 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl font-black text-gold-500 pixel-font">
          中国地图
        </div>
      </div>
    </div>
  )
}

// 省份详情面板
function ProvinceDetailPanel({ province, onClose, onEnter }: {
  province: any
  onClose: () => void
  onEnter: () => void
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'cities' | 'invest'>('info')

  return (
    <motion.div
      className="fixed right-0 top-20 bottom-0 w-96 bg-[#0A1628] border-l-4 border-gold-500 overflow-hidden z-40"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {/* 头部 */}
      <div className="p-6 border-b-2 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{province.emoji}</span>
            <div>
              <h2 className="text-2xl font-black" style={{ color: province.color }}>
                {province.name}
              </h2>
              <p className="text-sm text-gray-500">{province.type === 'capital' ? '首都' : province.type === 'megacity' ? '直辖市' : '省份'}</p>
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
          {(['info', 'cities', 'invest'] as const).map((tab) => (
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
              {tab === 'info' ? '📊 数据' : tab === 'cities' ? '🏙️ 城市' : '💰 投资'}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
        <AnimatePresence mode="wait">
          {/* 基本信息 */}
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-gray-400">{province.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <PixelCard className="p-4 text-center">
                  <div className="text-3xl font-black text-gold-500">
                    {province.lands.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">总地块</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-3xl font-black text-green-500">
                    {province.available}
                  </div>
                  <div className="text-xs text-gray-500">可购买</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-3xl font-black text-blue-500">
                    ¥{province.avgPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">均价</div>
                </PixelCard>
                <PixelCard className="p-4 text-center">
                  <div className="text-2xl font-black text-purple-500">
                    {province.monthlyReturn}
                  </div>
                  <div className="text-xs text-gray-500">月收益</div>
                </PixelCard>
              </div>

              {/* 邻近省份 */}
              {province.neighbors && (
                <div>
                  <h3 className="font-bold mb-2 text-gold-500">邻近地区</h3>
                  <div className="flex flex-wrap gap-2">
                    {province.neighbors.map((neighbor: string) => (
                      <span key={neighbor} className="px-3 py-1 bg-gray-800 text-sm rounded">
                        {CHINA_MAP_CONFIG.provinces[neighbor]?.name || neighbor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 城市列表 */}
          {activeTab === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {province.cities ? (
                province.cities.map((city: string, index: number) => (
                  <motion.div
                    key={city}
                    className="p-4 bg-gray-800 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{city}</h4>
                        <p className="text-xs text-gray-500">热门城市</p>
                      </div>
                      <span className="text-gold-500">→</span>
                    </div>
                  </motion.div>
                ))
              ) : province.buildings ? (
                province.buildings.map((building: string, index: number) => (
                  <motion.div
                    key={building}
                    className="p-4 bg-gray-800 rounded"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏛️</span>
                      <div>
                        <h4 className="font-bold">{building}</h4>
                        <p className="text-xs text-gray-500">地标建筑</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500">暂无城市数据</p>
              )}
            </motion.div>
          )}

          {/* 投资机会 */}
          {activeTab === 'invest' && (
            <motion.div
              key="invest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PixelCard className="p-4 bg-gradient-to-br from-gold-500/20 to-transparent">
                <h3 className="font-bold mb-3 text-gold-500">💎 投资建议</h3>
                <div className="space-y-2 text-sm">
                  <p>• 该地区{province.hot ? '🔥 热度极高' : '发展潜力大'}</p>
                  <p>• 月收益率 <span className="text-green-500 font-bold">{province.monthlyReturn}</span></p>
                  <p>• 建议投资额 <span className="text-gold-500 font-bold">¥{province.price.toLocaleString()}</span></p>
                </div>
              </PixelCard>

              <div className="space-y-2">
                <h3 className="font-bold text-gold-500">🏆 热门地块</h3>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded flex items-center justify-between">
                    <div>
                      <p className="font-bold">地块 #{1000 + i}</p>
                      <p className="text-xs text-gray-500">300㎡ · 商业用地</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-500 font-bold">¥{(province.avgPrice + i * 5000).toLocaleString()}</p>
                      <button className="text-xs text-green-500 hover:underline">
                        查看 →
                      </button>
                    </div>
                  </div>
                ))}
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
          onClick={onEnter}
        >
          <span className="mr-2">🚀</span>
          进入{province.name}
        </PixelButton>
      </div>
    </motion.div>
  )
}

// 游戏状态栏
function GameStatusBar({ 
  playerInfo,
  currentProvince 
}: {
  playerInfo: { tdb: number; lands: number; level: string }
  currentProvince: string
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628]/95 backdrop-blur border-t-4 border-gold-500 p-4 z-30">
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* 当前位置 */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">当前位置:</span>
              <span className="font-bold text-gold-500">
                {CHINA_MAP_CONFIG.provinces[currentProvince]?.name || '未知'}
              </span>
            </div>

            {/* 玩家信息 */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">TDB</div>
                <div className="text-xl font-black text-gold-500">
                  {playerInfo.tdb.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">地块</div>
                <div className="text-xl font-black text-green-500">
                  {playerInfo.lands}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">等级</div>
                <div className="text-xl font-black text-purple-500">
                  {playerInfo.level}
                </div>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="flex items-center gap-4">
            <motion.button
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🗺️</span>
              全国地图
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-gold-500 text-black font-bold rounded hover:bg-gold-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">🏠</span>
              我的地产
            </motion.button>
          </div>
        </div>
      </Container>
    </div>
  )
}

// 热门活动面板
function HotActivities() {
  const activities = [
    { emoji: '🎯', title: '北京CBD抢地活动', desc: '限时8折优惠', time: '剩余2天' },
    { emoji: '🏆', title: '上海地产争霸赛', desc: '奖金池100万TDB', time: '进行中' },
    { emoji: '🎁', title: '新手专属福利', desc: '首次购地送工具', time: '永久有效' }
  ]

  return (
    <PixelCard className="p-4">
      <h3 className="font-bold mb-3 text-gold-500">🔥 热门活动</h3>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{activity.emoji}</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{activity.title}</h4>
                <p className="text-xs text-gray-500">{activity.desc}</p>
              </div>
              <span className="text-xs text-green-500">{activity.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </PixelCard>
  )
}

// 排行榜组件
function Leaderboard() {
  const leaders = [
    { rank: 1, name: '地产大亨', lands: 1580, value: '¥2,580万' },
    { rank: 2, name: '投资达人', lands: 1234, value: '¥1,680万' },
    { rank: 3, name: '土地之王', lands: 888, value: '¥1,280万' }
  ]

  return (
    <PixelCard className="p-4">
      <h3 className="font-bold mb-3 text-gold-500">🏆 地产排行榜</h3>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div key={leader.rank} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : '🥉'}
              </span>
              <div>
                <p className="font-bold text-sm">{leader.name}</p>
                <p className="text-xs text-gray-500">{leader.lands}块地</p>
              </div>
            </div>
            <span className="text-sm font-bold text-gold-500">{leader.value}</span>
          </div>
        ))}
      </div>
    </PixelCard>
  )
}

export default function ChinaMapPage() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [playerPosition, setPlayerPosition] = useState('beijing')
  const [playerInfo] = useState({
    tdb: 10000,
    lands: 3,
    level: '小星星'
  })
  const [showAnimation, setShowAnimation] = useState(false)

  // 处理省份点击
  const handleProvinceClick = (provinceId: string) => {
    setSelectedProvince(provinceId)
    
    // 模拟移动动画
    if (provinceId !== playerPosition) {
      setShowAnimation(true)
      setTimeout(() => {
        setPlayerPosition(provinceId)
        setShowAnimation(false)
      }, 1000)
    }
  }

  // 处理进入省份
  const handleEnterProvince = () => {
    if (selectedProvince) {
      window.location.href = `/explore/china/${selectedProvince}`
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0A1628]/95 backdrop-blur border-b-4 border-gold-500">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/explore" className="text-gray-400 hover:text-gold-500">
                ← 返回世界地图
              </Link>
              <h1 className="text-2xl font-black text-gold-500 pixel-font">
                中国区域
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-400">总地块:</span>
                <span className="text-gold-500 font-bold ml-2">50,000+</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">可用:</span>
                <span className="text-green-500 font-bold ml-2">12,580</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">均价:</span>
                <span className="text-gold-500 font-bold ml-2">¥15,888</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 主内容区 */}
      <div className="pt-20 pb-20 relative">
        <div className="flex">
          {/* 左侧面板 */}
          <div className="w-80 p-6 space-y-6">
            <HotActivities />
            <Leaderboard />
          </div>

          {/* 中间地图 */}
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* 移动动画提示 */}
              {showAnimation && (
                <motion.div
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <div className="bg-gold-500 text-black px-8 py-4 rounded-lg font-black text-xl">
                    🚗 移动中...
                  </div>
                </motion.div>
              )}

              <ChinaGameMap
                selectedProvince={selectedProvince}
                playerPosition={playerPosition}
                onProvinceClick={handleProvinceClick}
              />
            </motion.div>
          </div>

          {/* 右侧提示 */}
          <div className="w-80 p-6">
            <PixelCard className="p-4">
              <h3 className="font-bold mb-3 text-gold-500">💡 游戏提示</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• 点击省份查看详情</p>
                <p>• 🔥 标记表示热门地区</p>
                <p>• 数字显示可用地块数</p>
                <p>• 📍 标记您的当前位置</p>
              </div>
              
              <div className="mt-4 p-3 bg-gold-500/10 rounded">
                <p className="text-xs text-gold-500">
                  💡 小贴士：热门地区收益高但价格贵，冷门地区有升值潜力
                </p>
              </div>
            </PixelCard>
          </div>
        </div>

        {/* 省份详情面板 */}
        <AnimatePresence>
          {selectedProvince && (
            <ProvinceDetailPanel
              province={CHINA_MAP_CONFIG.provinces[selectedProvince]}
              onClose={() => setSelectedProvince(null)}
              onEnter={handleEnterProvince}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 游戏状态栏 */}
      <GameStatusBar
        playerInfo={playerInfo}
        currentProvince={playerPosition}
      />

      {/* 背景音效控制 */}
      <motion.button
        className="fixed top-24 right-4 z-30 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🎵
      </motion.button>
    </div>
  )
}
