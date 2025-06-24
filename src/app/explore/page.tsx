'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 世界地图配置 - 大富翁风格的地块系统
const WORLD_MAP_CONFIG = {
  gridSize: 20, // 20x20 的棋盘
  tileSize: 40, // 每个格子40px
  regions: {
    china: {
      id: 'china',
      name: '中国',
      emoji: '🇨🇳',
      status: 'open',
      color: '#FFD700',
      glowColor: '#FFA500',
      position: { row: 8, col: 14 },
      price: 0, // 已开放
      description: '繁华的东方大国，商机无限',
      stats: {
        totalLands: 50000,
        available: 12580,
        avgPrice: 15888,
        hotCities: 6
      }
    },
    northamerica: {
      id: 'northamerica',
      name: '北美洲',
      emoji: '🇺🇸',
      status: 'coming',
      color: '#87CEEB',
      glowColor: '#4682B4',
      position: { row: 6, col: 4 },
      price: 100000,
      releaseDate: '2025 Q2',
      description: '即将开放的新大陆'
    },
    europe: {
      id: 'europe',
      name: '欧洲',
      emoji: '🇪🇺',
      status: 'coming',
      color: '#98FB98',
      glowColor: '#90EE90',
      position: { row: 5, col: 10 },
      price: 150000,
      releaseDate: '2025 Q3',
      description: '古老的文明中心'
    },
    southamerica: {
      id: 'southamerica',
      name: '南美洲',
      emoji: '🌎',
      status: 'locked',
      color: '#DDA0DD',
      glowColor: '#DA70D6',
      position: { row: 12, col: 5 },
      price: 200000,
      description: '神秘的雨林大陆'
    },
    africa: {
      id: 'africa',
      name: '非洲',
      emoji: '🌍',
      status: 'locked',
      color: '#F0E68C',
      glowColor: '#DAA520',
      position: { row: 10, col: 10 },
      price: 180000,
      description: '资源丰富的大陆'
    },
    oceania: {
      id: 'oceania',
      name: '大洋洲',
      emoji: '🏝️',
      status: 'locked',
      color: '#FFB6C1',
      glowColor: '#FF69B4',
      position: { row: 14, col: 16 },
      price: 120000,
      description: '美丽的岛国'
    }
  },
  // 装饰性地标
  landmarks: [
    { emoji: '🗼', position: { row: 8, col: 15 }, name: '东方明珠' },
    { emoji: '🗽', position: { row: 6, col: 3 }, name: '自由女神' },
    { emoji: '🏛️', position: { row: 5, col: 11 }, name: '帕特农神庙' },
    { emoji: '🌋', position: { row: 13, col: 5 }, name: '安第斯山脉' },
    { emoji: '🦁', position: { row: 11, col: 10 }, name: '非洲草原' },
    { emoji: '🏖️', position: { row: 14, col: 17 }, name: '黄金海岸' }
  ],
  // 移动路径
  paths: [
    { from: 'china', to: 'northamerica', type: 'sea', emoji: '🚢' },
    { from: 'china', to: 'europe', type: 'land', emoji: '🚂' },
    { from: 'europe', to: 'africa', type: 'land', emoji: '🚗' },
    { from: 'northamerica', to: 'southamerica', type: 'land', emoji: '🚌' }
  ]
}

// 实时数据
const generateLiveData = () => ({
  onlineUsers: Math.floor(12000 + Math.random() * 3000),
  dailyTransactions: Math.floor(50000 + Math.random() * 20000),
  totalValue: (120 + Math.random() * 30).toFixed(1),
  newLands: Math.floor(50 + Math.random() * 100),
})

// 玩家位置组件
function PlayerToken({ position, isMoving }: { position: { row: number; col: number }, isMoving: boolean }) {
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      initial={false}
      animate={{
        left: position.col * WORLD_MAP_CONFIG.tileSize + WORLD_MAP_CONFIG.tileSize / 2,
        top: position.row * WORLD_MAP_CONFIG.tileSize + WORLD_MAP_CONFIG.tileSize / 2,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2"
        animate={isMoving ? {
          y: [0, -10, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{
          duration: 0.5,
          repeat: isMoving ? Infinity : 0
        }}
      >
        <div className="text-3xl">🚀</div>
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full"
          animate={{
            scale: isMoving ? [1, 1.2, 1] : 1,
            opacity: isMoving ? [0.3, 0.1, 0.3] : 0.3
          }}
          transition={{
            duration: 0.5,
            repeat: isMoving ? Infinity : 0
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// 地块组件
function MapTile({ 
  region, 
  isPath = false,
  onClick,
  isHighlighted = false,
  isPlayerHere = false
}: { 
  region?: any
  isPath?: boolean
  onClick?: () => void
  isHighlighted?: boolean
  isPlayerHere?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (!region && !isPath) {
    return (
      <div className="w-10 h-10 border border-gray-800/30 bg-gray-900/20" />
    )
  }

  if (isPath) {
    return (
      <div className="w-10 h-10 border border-gray-800/30 bg-gray-800/40 flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "w-10 h-10 border-2 relative cursor-pointer overflow-hidden",
        "transition-all duration-200",
        region.status === 'open' ? 'border-gold-500' : 
        region.status === 'coming' ? 'border-gray-600' : 'border-gray-700',
        isHighlighted && 'ring-4 ring-gold-500/50 z-20',
        isPlayerHere && 'z-20'
      )}
      style={{
        backgroundColor: region.status === 'open' ? region.color + '40' : 
                        region.status === 'coming' ? region.color + '20' : '#1a1a1a',
        boxShadow: isHovered ? `0 0 20px ${region.glowColor}` : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 地块内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-2xl"
          animate={region.status === 'open' ? {
            y: [0, -2, 0]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 2
          }}
        >
          {region.emoji}
        </motion.div>
      </div>

      {/* 状态标记 */}
      {region.status === 'coming' && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 rounded">
          SOON
        </div>
      )}
      {region.status === 'locked' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-lg">🔒</span>
        </div>
      )}

      {/* 热门标记 */}
      {region.status === 'open' && (
        <motion.div
          className="absolute -top-2 -left-2 text-sm"
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
    </motion.div>
  )
}

// 游戏化地图组件
function GameMap({ 
  onRegionClick, 
  playerPosition,
  highlightedRegion 
}: {
  onRegionClick: (region: any) => void
  playerPosition: { row: number; col: number }
  highlightedRegion: string | null
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMoving, setIsMoving] = useState(false)

  // 创建地图网格
  const renderGrid = () => {
    const grid = []
    for (let row = 0; row < WORLD_MAP_CONFIG.gridSize; row++) {
      for (let col = 0; col < WORLD_MAP_CONFIG.gridSize; col++) {
        const region = Object.values(WORLD_MAP_CONFIG.regions).find(
          r => r.position.row === row && r.position.col === col
        )
        const landmark = WORLD_MAP_CONFIG.landmarks.find(
          l => l.position.row === row && l.position.col === col
        )
        
        const isPlayerHere = playerPosition.row === row && playerPosition.col === col

        if (region) {
          grid.push(
            <MapTile
              key={`${row}-${col}`}
              region={region}
              onClick={() => onRegionClick(region)}
              isHighlighted={highlightedRegion === region.id}
              isPlayerHere={isPlayerHere}
            />
          )
        } else if (landmark) {
          grid.push(
            <div 
              key={`${row}-${col}`} 
              className="w-10 h-10 border border-gray-800/30 bg-gray-800/20 flex items-center justify-center text-xl"
              title={landmark.name}
            >
              {landmark.emoji}
            </div>
          )
        } else {
          // 检查是否是路径
          const isPath = checkIfPath(row, col)
          grid.push(
            <MapTile 
              key={`${row}-${col}`} 
              isPath={isPath}
              isPlayerHere={isPlayerHere}
            />
          )
        }
      }
    }
    return grid
  }

  // 检查是否是路径（简化版）
  const checkIfPath = (row: number, col: number) => {
    // 这里可以实现更复杂的路径算法
    return false
  }

  return (
    <div className="relative inline-block">
      <div 
        ref={mapRef}
        className="grid grid-cols-20 gap-0 p-4 bg-gray-900/50 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${WORLD_MAP_CONFIG.gridSize}, 40px)`,
          width: 'fit-content'
        }}
      >
        {renderGrid()}
      </div>
      <PlayerToken position={playerPosition} isMoving={isMoving} />
    </div>
  )
}

// 地区详情面板
function RegionDetailPanel({ region, onClose, onEnter }: {
  region: any
  onClose: () => void
  onEnter: () => void
}) {
  if (!region) return null

  return (
    <motion.div
      className="absolute right-0 top-0 h-full w-96 bg-[#0A1628] border-l-4 border-gold-500 p-6 overflow-y-auto z-40"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gold-500">{region.name}</h2>
        <button
          onClick={onClose}
          className="text-2xl hover:text-gold-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 地区图标 */}
      <div className="text-center mb-6">
        <motion.div
          className="text-8xl inline-block"
          animate={{
            y: [0, -10, 0],
            rotate: [-5, 5, -5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        >
          {region.emoji}
        </motion.div>
      </div>

      {/* 地区状态 */}
      <div className="mb-6">
        {region.status === 'open' ? (
          <div className="text-center">
            <span className="px-4 py-2 bg-green-500/20 text-green-500 font-bold text-lg">
              ✅ 已开放
            </span>
          </div>
        ) : region.status === 'coming' ? (
          <div className="text-center space-y-2">
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-500 font-bold">
              ⏳ 即将开放
            </span>
            <p className="text-sm text-gray-400">{region.releaseDate}</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <span className="px-4 py-2 bg-gray-500/20 text-gray-500 font-bold">
              🔒 未解锁
            </span>
            <p className="text-sm text-gray-400">需要解锁前置区域</p>
          </div>
        )}
      </div>

      {/* 地区描述 */}
      <p className="text-gray-400 mb-6">{region.description}</p>

      {/* 地区数据 */}
      {region.status === 'open' && region.stats && (
        <div className="space-y-4 mb-6">
          <h3 className="font-bold text-gold-500">区域数据</h3>
          <div className="grid grid-cols-2 gap-3">
            <PixelCard className="p-3 text-center">
              <div className="text-2xl font-black text-gold-500">
                {region.stats.totalLands.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">总地块</div>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <div className="text-2xl font-black text-green-500">
                {region.stats.available.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">可购买</div>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <div className="text-2xl font-black text-blue-500">
                ¥{region.stats.avgPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">均价</div>
            </PixelCard>
            <PixelCard className="p-3 text-center">
              <div className="text-2xl font-black text-red-500">
                {region.stats.hotCities}
              </div>
              <div className="text-xs text-gray-500">热门城市</div>
            </PixelCard>
          </div>
        </div>
      )}

      {/* 解锁价格 */}
      {region.status !== 'open' && (
        <div className="mb-6 p-4 bg-gray-800 rounded">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">解锁价格</span>
            <span className="text-2xl font-black text-gold-500">
              ¥{region.price.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-3">
        {region.status === 'open' ? (
          <PixelButton
            className="w-full"
            size="lg"
            onClick={onEnter}
          >
            <span className="mr-2">🚀</span>
            进入{region.name}
          </PixelButton>
        ) : (
          <PixelButton
            className="w-full"
            size="lg"
            variant="secondary"
            disabled
          >
            {region.status === 'coming' ? '⏳ 敬请期待' : '🔒 需要解锁'}
          </PixelButton>
        )}
        
        <button
          onClick={onClose}
          className="w-full py-3 text-gray-400 hover:text-white transition-colors"
        >
          返回地图
        </button>
      </div>
    </motion.div>
  )
}

// 游戏控制面板
function GameControlPanel({ 
  liveData, 
  playerInfo,
  onDiceRoll 
}: {
  liveData: any
  playerInfo: { tdb: number; yld: number; lands: number }
  onDiceRoll: () => void
}) {
  const [isRolling, setIsRolling] = useState(false)
  const [diceValue, setDiceValue] = useState<number | null>(null)

  const handleDiceRoll = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setDiceValue(null)
    
    // 骰子动画
    let count = 0
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      count++
      
      if (count > 10) {
        clearInterval(interval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        setIsRolling(false)
        onDiceRoll()
      }
    }, 100)
  }

  const diceEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628]/95 backdrop-blur border-t-4 border-gold-500 p-4 z-30">
      <Container>
        <div className="flex items-center justify-between">
          {/* 玩家信息 */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-500">TDB积分</div>
              <div className="text-xl font-black text-gold-500">
                {playerInfo.tdb.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">YLD积分</div>
              <div className="text-xl font-black text-purple-500">
                {playerInfo.yld.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">拥有地块</div>
              <div className="text-xl font-black text-green-500">
                {playerInfo.lands}
              </div>
            </div>
          </div>

          {/* 骰子 */}
          <div className="flex items-center gap-6">
            <motion.button
              className={cn(
                "w-20 h-20 bg-white text-black rounded-lg",
                "flex items-center justify-center text-5xl font-black",
                "shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]",
                "hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]",
                "transition-all duration-200",
                isRolling && "animate-bounce"
              )}
              onClick={handleDiceRoll}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={isRolling}
            >
              {diceValue ? diceEmojis[diceValue] : '🎲'}
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-gray-400">点击骰子</p>
              <p className="text-lg font-bold text-gold-500">开始探索</p>
            </div>
          </div>

          {/* 实时数据 */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">在线:</span>
              <span className="text-green-500 font-bold ml-1">
                {liveData.onlineUsers.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">今日交易:</span>
              <span className="text-gold-500 font-bold ml-1">
                {liveData.dailyTransactions.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">总价值:</span>
              <span className="text-gold-500 font-bold ml-1">
                ¥{liveData.totalValue}M
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

// 教程提示
function TutorialTooltip({ step }: { step: number }) {
  const tutorials = [
    {
      title: '欢迎来到平行世界',
      content: '点击骰子开始你的探索之旅！',
      position: 'bottom-right'
    },
    {
      title: '选择目的地',
      content: '点击地图上的区域查看详情',
      position: 'center'
    },
    {
      title: '进入区域',
      content: '开放的区域可以直接进入探索',
      position: 'right'
    }
  ]

  if (step >= tutorials.length) return null

  return (
    <motion.div
      className="fixed z-50 max-w-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        bottom: tutorials[step].position === 'bottom-right' ? '180px' : undefined,
        right: tutorials[step].position === 'bottom-right' ? '20px' : undefined,
        top: tutorials[step].position === 'center' ? '50%' : undefined,
        left: tutorials[step].position === 'center' ? '50%' : undefined,
        transform: tutorials[step].position === 'center' ? 'translate(-50%, -50%)' : undefined
      }}
    >
      <PixelCard className="p-6 bg-[#0A1628]/95">
        <h3 className="text-lg font-black text-gold-500 mb-2">
          {tutorials[step].title}
        </h3>
        <p className="text-gray-400 mb-4">{tutorials[step].content}</p>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i === step ? "bg-gold-500" : "bg-gray-600"
              )}
            />
          ))}
        </div>
      </PixelCard>
    </motion.div>
  )
}

export default function ExplorePage() {
  const [selectedRegion, setSelectedRegion] = useState<any>(null)
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null)
  const [playerPosition, setPlayerPosition] = useState({ row: 8, col: 14 }) // 从中国开始
  const [liveData, setLiveData] = useState(generateLiveData())
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)

  // 玩家数据
  const [playerInfo] = useState({
    tdb: 10000,
    yld: 5000,
    lands: 3
  })

  // 更新实时数据
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(generateLiveData())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 处理区域点击
  const handleRegionClick = (region: any) => {
    setSelectedRegion(region)
    setHighlightedRegion(region.id)
    if (showTutorial && tutorialStep === 1) {
      setTutorialStep(2)
    }
  }

  // 处理进入区域
  const handleEnterRegion = () => {
    if (selectedRegion?.status === 'open') {
      // 导航到具体区域页面
      window.location.href = `/explore/china`
    }
  }

  // 处理骰子投掷
  const handleDiceRoll = () => {
    if (showTutorial && tutorialStep === 0) {
      setTutorialStep(1)
    }
    // 这里可以实现移动逻辑
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0A1628]/95 backdrop-blur border-b-4 border-gold-500">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gold-500">
                ← 返回首页
              </Link>
              <h1 className="text-2xl font-black text-gold-500 pixel-font">
                WORLD EXPLORER
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                {showTutorial ? '关闭教程' : '显示教程'}
              </button>
              
              <Link href="/experience">
                <PixelButton size="sm" variant="secondary">
                  游客体验
                </PixelButton>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* 主内容区 */}
      <div className="pt-20 pb-32 relative">
        {/* 游戏地图容器 */}
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* 地图标题 */}
            <div className="text-center mb-6">
              <motion.h2
                className="text-3xl font-black text-gold-500 pixel-font mb-2"
                animate={{
                  textShadow: [
                    '0 0 10px #FFD700',
                    '0 0 20px #FFD700',
                    '0 0 10px #FFD700'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                平行世界地图
              </motion.h2>
              <p className="text-gray-400">点击区域开始探索之旅</p>
            </div>

            {/* 游戏地图 */}
            <GameMap
              onRegionClick={handleRegionClick}
              playerPosition={playerPosition}
              highlightedRegion={highlightedRegion}
            />

            {/* 地图图例 */}
            <div className="absolute -left-40 top-1/2 -translate-y-1/2 space-y-4">
              <PixelCard className="p-4">
                <h3 className="font-bold mb-3 text-gold-500">图例</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gold-500/40 border-2 border-gold-500" />
                    <span>已开放</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-600/40 border-2 border-gray-600" />
                    <span>即将开放</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700/40 border-2 border-gray-700 relative">
                      <span className="absolute inset-0 flex items-center justify-center text-xs">🔒</span>
                    </div>
                    <span>未解锁</span>
                  </div>
                </div>
              </PixelCard>

              <PixelCard className="p-4">
                <h3 className="font-bold mb-3 text-gold-500">快捷键</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>空格 - 投掷骰子</div>
                  <div>← → ↑ ↓ - 移动</div>
                  <div>Enter - 确认</div>
                  <div>ESC - 返回</div>
                </div>
              </PixelCard>
            </div>
          </motion.div>
        </div>

        {/* 区域详情面板 */}
        <AnimatePresence>
          {selectedRegion && (
            <RegionDetailPanel
              region={selectedRegion}
              onClose={() => {
                setSelectedRegion(null)
                setHighlightedRegion(null)
              }}
              onEnter={handleEnterRegion}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 游戏控制面板 */}
      <GameControlPanel
        liveData={liveData}
        playerInfo={playerInfo}
        onDiceRoll={handleDiceRoll}
      />

      {/* 教程提示 */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialTooltip step={tutorialStep} />
        )}
      </AnimatePresence>

      {/* 背景音乐控制（装饰性） */}
      <div className="fixed top-24 right-4 z-30">
        <motion.button
          className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🎵
        </motion.button>
      </div>
    </div>
  )
}
