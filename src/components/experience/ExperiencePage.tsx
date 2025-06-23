'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { PixelLogo } from '@/components/ui/PixelLogo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// 体验流程配置
const experienceFlow = {
  welcome: {
    title: '欢迎来到平行世界',
    subtitle: '一个价值与现实锚定的数字世界',
    duration: 5000,
  },
  features: [
    {
      id: 'land',
      name: '数字地产',
      description: '每块土地都有真实坐标',
      icon: '🏞️',
    },
    {
      id: 'mining',
      name: '挖矿系统',
      description: '付出劳动，收获财富',
      icon: '⛏️',
    },
    {
      id: 'market',
      name: '真实商城',
      description: '实体商品，链上交易',
      icon: '🛍️',
    },
    {
      id: 'prosumer',
      name: '消费创富',
      description: '消费即投资，分享即收益',
      icon: '💎',
    },
  ],
}

// 实时数据模拟
const generateLiveData = () => ({
  onlineUsers: Math.floor(12000 + Math.random() * 3000),
  dailyTransactions: Math.floor(50000 + Math.random() * 20000),
  totalValue: (120 + Math.random() * 30).toFixed(1),
  newUsers: Math.floor(200 + Math.random() * 100),
})

// 地图数据
const mapData = {
  beijing: { 
    name: '北京', 
    lands: 156, 
    available: 23, 
    avgPrice: 18888,
    hotspot: true,
    coordinates: { x: 70, y: 30 }
  },
  shanghai: { 
    name: '上海', 
    lands: 143, 
    available: 31, 
    avgPrice: 22888,
    hotspot: true,
    coordinates: { x: 75, y: 45 }
  },
  shenzhen: { 
    name: '深圳', 
    lands: 98, 
    available: 15, 
    avgPrice: 25888,
    hotspot: true,
    coordinates: { x: 70, y: 60 }
  },
  chengdu: { 
    name: '成都', 
    lands: 76, 
    available: 45, 
    avgPrice: 12888,
    coordinates: { x: 50, y: 45 }
  },
  xian: { 
    name: '西安', 
    lands: 54, 
    available: 32, 
    avgPrice: 9888,
    coordinates: { x: 55, y: 35 }
  },
}

// 商品数据增强
const featuredProducts = [
  {
    id: 1,
    name: '贵州茅台·平行世界纪念版',
    category: '白酒',
    price: 2499,
    originalPrice: 2999,
    image: '🍾',
    monthlyDividend: '8%',
    totalVouchers: 1000,
    soldVouchers: 856,
    merchantVerified: true,
    tags: ['热销', '限量'],
    description: '53度飞天茅台，区块链溯源认证',
  },
  {
    id: 2,
    name: '新疆和田玉·财富守护',
    category: '珠宝',
    price: 8888,
    originalPrice: 12888,
    image: '💎',
    monthlyDividend: '10%',
    totalVouchers: 200,
    soldVouchers: 187,
    merchantVerified: true,
    tags: ['精品', '收藏'],
    description: '天然和田白玉，附国检证书',
  },
  {
    id: 3,
    name: '云南普洱·千年古树',
    category: '茶叶',
    price: 999,
    originalPrice: 1299,
    image: '🍵',
    monthlyDividend: '6%',
    totalVouchers: 2000,
    soldVouchers: 1654,
    merchantVerified: true,
    tags: ['养生', '投资'],
    description: '2019年古树纯料，越陈越香',
  },
  {
    id: 4,
    name: '东北五常·稻花香米',
    category: '粮油',
    price: 168,
    originalPrice: 198,
    image: '🌾',
    monthlyDividend: '5%',
    totalVouchers: 5000,
    soldVouchers: 3421,
    merchantVerified: true,
    tags: ['刚需', '包邮'],
    description: '当季新米，产地直供',
  },
]

// 收益数据
const earningsData = {
  daily: {
    mining: { min: 100, max: 300, avg: 180 },
    farming: { min: 50, max: 150, avg: 80 },
    rental: { min: 200, max: 500, avg: 320 },
  },
  monthly: {
    passive: { min: 5000, max: 50000 },
    active: { min: 10000, max: 100000 },
  },
  topEarners: [
    { name: '王*明', level: '水星', monthlyIncome: 2580000, days: 486 },
    { name: '李*华', level: '金星', monthlyIncome: 1680000, days: 365 },
    { name: '张*丽', level: '金星', monthlyIncome: 1280000, days: 298 },
  ],
}

export default function ExperiencePage() {
  const router = useRouter()
  const [currentFeature, setCurrentFeature] = useState(0)
  const [liveData, setLiveData] = useState(generateLiveData())
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [miningActive, setMiningActive] = useState(false)
  const [miningReward, setMiningReward] = useState(0)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  
  const { scrollYProgress } = useScroll()
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // 更新实时数据
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(generateLiveData())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 自动切换功能展示
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % experienceFlow.features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // 记录停留时间
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 模拟挖矿
  const startMining = () => {
    setMiningActive(true)
    setMiningReward(0)
    
    // 模拟挖矿过程
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      if (progress >= 100) {
        clearInterval(interval)
        const reward = Math.floor(100 + Math.random() * 200)
        setMiningReward(reward)
        setMiningActive(false)
        
        // 3秒后提示注册
        setTimeout(() => setShowLoginPrompt(true), 3000)
      }
    }, 500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      {/* 进度条 */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gold-500 z-50"
        style={{ width: progressBarWidth }}
      />

      {/* 顶部导航 */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 bg-[#0F0F1E]/95 backdrop-blur-md border-b-2 border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <PixelLogo />
              <span className="font-black text-gold-500">平行世界</span>
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 font-bold animate-pulse">
                游客体验
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-gray-500">
                  体验时长: <span className="text-gold-500 font-bold">{formatTime(timeSpent)}</span>
                </div>
                <div className="text-gray-500">
                  在线: <span className="text-green-500 font-bold">{liveData.onlineUsers.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href="/login">
                  <motion.button
                    className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    登录
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    className="pixel-btn text-sm px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    注册领礼包
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </motion.nav>

      {/* 主内容区 */}
      <div className="pt-20">
        {/* Hero区域 - 实时数据展示 */}
        <section className="py-12 border-b border-gray-800">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                {experienceFlow.welcome.title}
              </h1>
              <p className="text-xl text-gray-400">
                {experienceFlow.welcome.subtitle}
              </p>
            </motion.div>

            {/* 实时数据卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="pixel-card p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-2xl font-black text-gold-500">
                  ¥{liveData.totalValue}M
                </div>
                <div className="text-xs text-gray-500">平台总价值</div>
              </motion.div>
              
              <motion.div
                className="pixel-card p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl font-black text-green-500">
                  {liveData.dailyTransactions.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">今日交易</div>
              </motion.div>
              
              <motion.div
                className="pixel-card p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl font-black text-blue-500">
                  {liveData.onlineUsers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">在线用户</div>
              </motion.div>
              
              <motion.div
                className="pixel-card p-4 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-2xl font-black text-purple-500">
                  +{liveData.newUsers}
                </div>
                <div className="text-xs text-gray-500">今日新增</div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* 功能导航 */}
        <section className="py-8 bg-gray-900/30">
          <Container>
            <div className="flex flex-wrap justify-center gap-4">
              {experienceFlow.features.map((feature, index) => (
                <motion.button
                  key={feature.id}
                  onClick={() => setCurrentFeature(index)}
                  className={cn(
                    'px-6 py-3 rounded-lg font-bold transition-all duration-300',
                    'border-2 flex items-center gap-2',
                    currentFeature === index
                      ? 'bg-gold-500 text-black border-gold-500 scale-105'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span>{feature.name}</span>
                </motion.button>
              ))}
            </div>
          </Container>
        </section>

        {/* 功能展示区 */}
        <section className="py-12">
          <Container>
            <AnimatePresence mode="wait">
              {/* 数字地产 */}
              {currentFeature === 0 && (
                <motion.div
                  key="land"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-4">
                      <span className="text-gold-500">数字地产系统</span>
                    </h2>
                    <p className="text-gray-400">
                      基于北斗定位，每块土地都对应真实地理坐标
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* 地图展示 */}
                    <div className="pixel-card p-6">
                      <h3 className="text-xl font-bold mb-4">全国土地分布</h3>
                      <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
                        {/* 简化的中国地图 */}
                        <svg viewBox="0 0 100 80" className="w-full h-full">
                          {/* 地图轮廓 */}
                          <path
                            d="M 20 20 L 30 15 L 50 10 L 70 15 L 80 25 L 85 40 L 80 55 L 70 65 L 50 70 L 30 65 L 20 50 Z"
                            fill="none"
                            stroke="#444"
                            strokeWidth="1"
                          />
                          
                          {/* 城市标记 */}
                          {Object.entries(mapData).map(([key, city]) => (
                            <g key={key}>
                              <motion.circle
                                cx={city.coordinates.x}
                                cy={city.coordinates.y}
                                r="3"
                                fill={city.hotspot ? '#FFD700' : '#00D4AA'}
                                className="cursor-pointer"
                                whileHover={{ scale: 1.5 }}
                                onClick={() => setSelectedCity(key)}
                              />
                              <text
                                x={city.coordinates.x}
                                y={city.coordinates.y - 5}
                                textAnchor="middle"
                                fontSize="6"
                                fill="white"
                                className="pointer-events-none"
                              >
                                {city.name}
                              </text>
                              {city.hotspot && (
                                <motion.circle
                                  cx={city.coordinates.x}
                                  cy={city.coordinates.y}
                                  r="8"
                                  fill="none"
                                  stroke="#FFD700"
                                  strokeWidth="1"
                                  opacity="0.5"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0.2, 0.5],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                  }}
                                />
                              )}
                            </g>
                          ))}
                        </svg>

                        {/* 图例 */}
                        <div className="absolute bottom-4 left-4 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gold-500 rounded-full" />
                            <span>热门城市</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00D4AA] rounded-full" />
                            <span>普通城市</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 城市详情 */}
                    <div className="space-y-4">
                      {selectedCity ? (
                        <motion.div
                          className="pixel-card p-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <h4 className="text-xl font-bold mb-4">
                            {mapData[selectedCity].name}土地详情
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">总地块</span>
                              <span className="font-bold">{mapData[selectedCity].lands}块</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">可购买</span>
                              <span className="font-bold text-green-500">
                                {mapData[selectedCity].available}块
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">均价</span>
                              <span className="font-bold text-gold-500">
                                ¥{mapData[selectedCity].avgPrice}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">状态</span>
                              <span className="font-bold">
                                {mapData[selectedCity].hotspot ? '🔥 热门' : '✅ 可投资'}
                              </span>
                            </div>
                          </div>
                          
                          <motion.button
                            className="w-full mt-6 pixel-btn text-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowLoginPrompt(true)}
                          >
                            查看地块详情
                          </motion.button>
                        </motion.div>
                      ) : (
                        <div className="pixel-card p-6 text-center text-gray-500">
                          <p>点击地图上的城市查看详情</p>
                        </div>
                      )}

                      {/* 土地类型说明 */}
                      <div className="pixel-card p-6">
                        <h4 className="text-lg font-bold mb-4">土地类型</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🏙️</span>
                            <div>
                              <h5 className="font-bold text-gold-500">城市地块</h5>
                              <p className="text-sm text-gray-400">
                                300㎡/块，可建房开店，月收益8-12%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🌾</span>
                            <div>
                              <h5 className="font-bold text-green-500">农业用地</h5>
                              <p className="text-sm text-gray-400">
                                1000㎡/块，种植作物，月收益5-8%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">⛰️</span>
                            <div>
                              <h5 className="font-bold text-purple-500">矿山土地</h5>
                              <p className="text-sm text-gray-400">
                                5000㎡起，开采资源，月收益10-15%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 挖矿系统 */}
              {currentFeature === 1 && (
                <motion.div
                  key="mining"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-4">
                      <span className="text-gold-500">挖矿系统</span>
                    </h2>
                    <p className="text-gray-400">
                      真实模拟挖矿过程，每一份收获都来自辛勤劳动
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="pixel-card p-8">
                      <div className="text-center">
                        {!miningActive && miningReward === 0 && (
                          <>
                            <motion.div
                              className="text-8xl mb-6 inline-block cursor-pointer"
                              whileHover={{ scale: 1.1, rotate: -10 }}
                              onClick={startMining}
                            >
                              ⛏️
                            </motion.div>
                            <h3 className="text-xl font-bold mb-4">免费体验挖矿</h3>
                            <p className="text-gray-400 mb-6">
                              点击镐头开始挖矿，体验真实收益
                            </p>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="text-center">
                                <div className="text-3xl mb-2">⚡</div>
                                <p className="text-xs text-gray-500">消耗20能量</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl mb-2">⏱️</div>
                                <p className="text-xs text-gray-500">5秒完成</p>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl mb-2">💰</div>
                                <p className="text-xs text-gray-500">随机收益</p>
                              </div>
                            </div>
                            
                            <motion.button
                              className="pixel-btn"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={startMining}
                            >
                              开始挖矿
                            </motion.button>
                          </>
                        )}

                        {miningActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="text-8xl mb-6 inline-block"
                              animate={{
                                rotate: [-10, 10, -10],
                                y: [0, -10, 0],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                              }}
                            >
                              ⛏️
                            </motion.div>
                            <h3 className="text-xl font-bold mb-4">挖矿中...</h3>
                            <div className="flex items-center justify-center gap-2">
                              <motion.div
                                className="w-3 h-3 bg-gold-500 rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-3 h-3 bg-gold-500 rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.5, delay: 0.1, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-3 h-3 bg-gold-500 rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 0.5, delay: 0.2, repeat: Infinity }}
                              />
                            </div>
                          </motion.div>
                        )}

                        {!miningActive && miningReward > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="space-y-4"
                          >
                            <motion.div
                              className="text-8xl"
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 1 }}
                            >
                              💎
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gold-500">
                              挖矿成功！
                            </h3>
                            <div className="pixel-card p-6 bg-gold-500/10">
                              <p className="text-3xl font-black mb-2">
                                {miningReward} 铁矿石
                              </p>
                              <p className="text-sm text-gray-400">
                                价值 ¥{(miningReward * 0.3).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">
                              实际游戏中需要5小时完成一轮挖矿
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* 挖矿收益对比 */}
                    <div className="mt-8 grid md:grid-cols-3 gap-4">
                      <div className="pixel-card p-4 text-center">
                        <h5 className="font-bold mb-2">铁矿山</h5>
                        <p className="text-2xl font-black text-gold-500 mb-1">
                          ¥1,200/天
                        </p>
                        <p className="text-xs text-gray-500">ROI: 12%</p>
                      </div>
                      <div className="pixel-card p-4 text-center">
                        <h5 className="font-bold mb-2">陨石矿</h5>
                        <p className="text-2xl font-black text-purple-500 mb-1">
                          10 YLD/天
                        </p>
                        <p className="text-xs text-gray-500">ROI: 15%</p>
                      </div>
                      <div className="pixel-card p-4 text-center">
                        <h5 className="font-bold mb-2">森林</h5>
                        <p className="text-2xl font-black text-green-500 mb-1">
                          ¥800/天
                        </p>
                        <p className="text-xs text-gray-500">ROI: 10%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 真实商城 */}
              {currentFeature === 2 && (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-4">
                      <span className="text-gold-500">真实商品交易</span>
                    </h2>
                    <p className="text-gray-400">
                      每一件商品都是真实的，提货单系统保障权益
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        className="pixel-card p-4 hover:border-gold-500 transition-all duration-300"
                        whileHover={{ y: -4 }}
                      >
                        {/* 标签 */}
                        <div className="flex gap-2 mb-3">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-gold-500/20 text-gold-500 font-bold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 商品图片 */}
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">{product.image}</div>
                          <span className="text-xs text-gray-500">{product.category}</span>
                        </div>

                        {/* 商品信息 */}
                        <h4 className="font-bold text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* 价格 */}
                        <div className="flex items-end gap-2 mb-3">
                          <span className="text-xl font-black text-gold-500">
                            ¥{product.price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ¥{product.originalPrice}
                          </span>
                        </div>

                        {/* 提货单信息 */}
                        <div className="space-y-2 text-xs mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-400">月分红</span>
                            <span className="text-green-500 font-bold">
                              {product.monthlyDividend}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">已售/总量</span>
                            <span>
                              {product.soldVouchers}/{product.totalVouchers}
                            </span>
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gold-500 to-yellow-500"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(product.soldVouchers / product.totalVouchers) * 100}%`,
                            }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>

                        <motion.button
                          className="w-full pixel-btn text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowLoginPrompt(true)}
                        >
                          查看详情
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* 商城特色 */}
                  <div className="grid md:grid-cols-4 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🛡️</div>
                      <h5 className="font-bold mb-1">链上存证</h5>
                      <p className="text-xs text-gray-500">每笔交易永久记录</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <h5 className="font-bold mb-1">月度分红</h5>
                      <p className="text-xs text-gray-500">持有即享收益</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🚚</div>
                      <h5 className="font-bold mb-1">保证发货</h5>
                      <p className="text-xs text-gray-500">智能合约保障</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h5 className="font-bold mb-1">品质认证</h5>
                      <p className="text-xs text-gray-500">商家实名审核</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 消费创富 */}
              {currentFeature === 3 && (
                <motion.div
                  key="prosumer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-4">
                      <span className="text-gold-500">消费创富模式</span>
                    </h2>
                    <p className="text-gray-400">
                      从消费者到消费商，开启财富自由之路
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* 收益展示 */}
                    <div className="space-y-6">
                      <div className="pixel-card p-6">
                        <h3 className="text-xl font-bold mb-4">收益预览</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">日常收益</span>
                              <span className="font-bold text-green-500">
                                ¥{earningsData.daily.mining.avg + earningsData.daily.farming.avg + earningsData.daily.rental.avg}/天
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <p className="text-gray-500">挖矿</p>
                                <p className="font-bold">¥{earningsData.daily.mining.avg}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">种植</p>
                                <p className="font-bold">¥{earningsData.daily.farming.avg}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">租金</p>
                                <p className="font-bold">¥{earningsData.daily.rental.avg}</p>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-gray-800" />

                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">月度收益</span>
                              <span className="font-bold text-gold-500">
                                ¥{earningsData.monthly.passive.min.toLocaleString()} - ¥{earningsData.monthly.active.max.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              根据投入和团队规模
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 消费商等级 */}
                      <div className="pixel-card p-6">
                        <h4 className="text-lg font-bold mb-4">成长路径</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">⭐</span>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-bold">小星星</span>
                                <span className="text-sm text-gray-500">10%</span>
                              </div>
                              <div className="text-xs text-gray-400">个人消费500</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🪐</span>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-bold">木星</span>
                                <span className="text-sm text-green-500">18%+3%</span>
                              </div>
                              <div className="text-xs text-gray-400">团队15万</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💙</span>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-bold">水星</span>
                                <span className="text-sm text-gold-500">18%+14%</span>
                              </div>
                              <div className="text-xs text-gray-400">团队3000万</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 收入排行榜 */}
                    <div className="pixel-card p-6">
                      <h3 className="text-xl font-bold mb-4">收入排行榜 TOP3</h3>
                      
                      <div className="space-y-4">
                        {earningsData.topEarners.map((earner, index) => (
                          <motion.div
                            key={index}
                            className={cn(
                              'p-4 rounded-lg',
                              index === 0 ? 'bg-gold-500/20 border border-gold-500' : 'bg-gray-900'
                            )}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </span>
                                <div>
                                  <p className="font-bold">{earner.name}</p>
                                  <p className="text-xs text-gray-500">{earner.level}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-gold-500">
                                  ¥{(earner.monthlyIncome / 10000).toFixed(1)}万
                                </p>
                                <p className="text-xs text-gray-500">月收入</p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              加入{earner.days}天 · 财富自由
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-br from-gold-500/20 to-transparent rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-2">你也可以成为下一个</p>
                        <p className="text-2xl font-black text-gold-500">财富传奇</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </section>

        {/* 底部引导 */}
        <section className="py-12 bg-gradient-to-t from-black to-transparent">
          <Container>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-black mb-4">
                体验时间有限，机会不等人
              </h3>
              <p className="text-gray-400 mb-8">
                现在注册，立即获得价值¥650的新手大礼包
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <p className="font-bold">100 TDB</p>
                  <p className="text-xs text-gray-500">黄金通证</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💎</div>
                  <p className="font-bold">10 YLD</p>
                  <p className="text-xs text-gray-500">陨石积分</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="font-bold">500 TDB</p>
                  <p className="text-xs text-gray-500">任务奖励</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="font-bold">专属客服</p>
                  <p className="text-xs text-gray-500">1对1指导</p>
                </div>
              </div>
              
              <Link href="/register">
                <motion.button
                  className="pixel-btn text-lg px-10 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  立即注册领取礼包
                </motion.button>
              </Link>
            </motion.div>
          </Container>
        </section>
      </div>

      {/* 登录提示弹窗 */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              className="pixel-card p-8 max-w-md w-full bg-[#0A1628]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-black mb-4">
                  游客模式限制
                </h3>
                <p className="text-gray-400 mb-6">
                  该功能需要登录后才能使用
                </p>
                
                <div className="space-y-3 text-left mb-6 text-sm">
                  <p className="text-gray-300">
                    注册后您可以：
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>购买土地，成为数字地主</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>开始挖矿，获得真实收益</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>购买商品，享受分红</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>发展团队，躺赚佣金</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link href="/register" className="flex-1">
                    <motion.button
                      className="w-full pixel-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      立即注册
                    </motion.button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <motion.button
                      className="w-full px-4 py-3 border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      登录账号
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动提示 */}
      <motion.div
        className="fixed bottom-4 right-4 pixel-card p-4 bg-[#0A1628] max-w-xs"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 10 }}
      >
        <p className="text-sm font-bold mb-2">💡 温馨提示</p>
        <p className="text-xs text-gray-400">
          游客模式仅能浏览，注册后解锁全部功能
        </p>
        <Link href="/register">
          <button className="text-xs text-gold-500 hover:underline mt-2">
            立即注册 →
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
