'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// 体验引导步骤
const experienceSteps = [
  {
    id: 'welcome',
    title: '欢迎来到平行世界',
    description: '一个真实价值的数字世界',
    icon: '🌍',
  },
  {
    id: 'land',
    title: '查看土地资产',
    description: '每块土地都有真实坐标',
    icon: '🏞️',
  },
  {
    id: 'mining',
    title: '体验挖矿系统',
    description: '付出劳动，收获财富',
    icon: '⛏️',
  },
  {
    id: 'market',
    title: '浏览真实商品',
    description: '虚拟世界，实体经济',
    icon: '🛍️',
  },
  {
    id: 'earn',
    title: '了解收益模式',
    description: '多种方式赚取收益',
    icon: '💰',
  },
]

// 模拟数据
const mockLands = [
  {
    id: 1,
    type: 'city',
    location: '北京·朝阳区',
    price: 15888,
    income: '1200/月',
    status: 'available',
    coordinates: '116.4074, 39.9042',
  },
  {
    id: 2,
    type: 'farm',
    location: '黑龙江·五常',
    price: 6888,
    income: '500/月',
    status: 'sold',
    coordinates: '127.1448, 45.5408',
  },
  {
    id: 3,
    type: 'mine',
    location: '山西·大同',
    price: 28888,
    income: '3000/月',
    status: 'available',
    coordinates: '113.2953, 40.0903',
  },
]

const mockProducts = [
  {
    id: 1,
    name: '贵州茅台',
    price: 2499,
    monthlyDividend: '8%',
    image: '🍾',
    sold: 856,
  },
  {
    id: 2,
    name: '新疆和田玉',
    price: 8888,
    monthlyDividend: '10%',
    image: '💎',
    sold: 187,
  },
  {
    id: 3,
    name: '普洱茶饼',
    price: 999,
    monthlyDividend: '6%',
    image: '🍵',
    sold: 1654,
  },
]

export default function ExperiencePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTab, setSelectedTab] = useState<'land' | 'mining' | 'market' | 'earn'>('land')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const [miningProgress, setMiningProgress] = useState(0)
  const [isMining, setIsMining] = useState(false)

  // 自动引导
  useEffect(() => {
    if (currentStep < experienceSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // 模拟挖矿
  useEffect(() => {
    if (isMining && miningProgress < 100) {
      const timer = setTimeout(() => {
        setMiningProgress(prev => Math.min(prev + 20, 100))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (miningProgress >= 100) {
      setIsMining(false)
      setShowRegisterPrompt(true)
    }
  }, [isMining, miningProgress])

  const handleAction = () => {
    setShowRegisterPrompt(true)
  }

  const landTypeConfig = {
    city: { icon: '🏙️', color: '#FFD700', name: '城市地块' },
    farm: { icon: '🌾', color: '#00D4AA', name: '农业用地' },
    mine: { icon: '⛰️', color: '#8B4513', name: '矿山土地' },
  }

  return (
    <div className="min-h-screen bg-[#0F0F1E] relative">
      {/* 背景效果 */}
      <div className="fixed inset-0 pixel-grid opacity-10" />
      
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F1E]/95 backdrop-blur border-b-4 border-gold-500">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <span className="font-black text-gold-500">平行世界</span>
              <span className="text-xs px-2 py-1 bg-gold-500/20 text-gold-500 font-bold">
                游客模式
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden md:block">
                体验进度：{currentStep + 1}/{experienceSteps.length}
              </span>
              <motion.button
                className="pixel-btn text-sm px-4 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/register')}
              >
                立即注册
              </motion.button>
            </div>
          </div>
        </Container>
      </div>

      {/* 引导提示 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pixel-card p-4 bg-[#0A1628]/95 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{experienceSteps[currentStep].icon}</span>
              <div>
                <h3 className="font-bold">{experienceSteps[currentStep].title}</h3>
                <p className="text-xs text-gray-400">{experienceSteps[currentStep].description}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 主内容区 */}
      <Container className="pt-32 pb-20">
        {/* 标签页切换 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'land', label: '土地资产', icon: '🏞️' },
            { id: 'mining', label: '挖矿体验', icon: '⛏️' },
            { id: 'market', label: '商品市场', icon: '🛍️' },
            { id: 'earn', label: '收益预览', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={cn(
                'px-6 py-3 font-bold transition-all duration-200',
                'border-2',
                selectedTab === tab.id
                  ? 'bg-gold-500 text-black border-gold-500'
                  : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容展示区 */}
        <AnimatePresence mode="wait">
          {/* 土地资产 */}
          {selectedTab === 'land' && (
            <motion.div
              key="land"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black text-center mb-8">
                <span className="text-gold-500">热门地块</span>
                <span className="text-sm block mt-2 text-gray-400 font-normal">
                  真实坐标，永久产权
                </span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {mockLands.map((land) => {
                  const config = landTypeConfig[land.type as keyof typeof landTypeConfig]
                  return (
                    <motion.div
                      key={land.id}
                      className="pixel-card p-6 relative"
                      whileHover={{ y: -4 }}
                    >
                      {land.status === 'sold' && (
                        <div className="absolute top-4 right-4 px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold">
                          已售
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">{config.icon}</div>
                        <h3 className="font-bold" style={{ color: config.color }}>
                          {config.name}
                        </h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">位置</span>
                          <span className="font-bold">{land.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">坐标</span>
                          <span className="text-xs">{land.coordinates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">价格</span>
                          <span className="font-bold text-gold-500">¥{land.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">月收益</span>
                          <span className="text-green-500">¥{land.income}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        className="w-full mt-4 pixel-btn text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAction}
                        disabled={land.status === 'sold'}
                      >
                        {land.status === 'sold' ? '已售出' : '立即购买'}
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* 挖矿体验 */}
          {selectedTab === 'mining' && (
            <motion.div
              key="mining"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-black text-center mb-8">
                <span className="text-gold-500">挖矿体验</span>
                <span className="text-sm block mt-2 text-gray-400 font-normal">
                  点击镐头开始挖矿
                </span>
              </h2>

              <div className="pixel-card p-8">
                <div className="text-center">
                  {!isMining && miningProgress === 0 ? (
                    <motion.div
                      className="text-8xl mb-6 inline-block cursor-pointer"
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      onClick={() => setIsMining(true)}
                    >
                      ⛏️
                    </motion.div>
                  ) : isMining ? (
                    <motion.div
                      className="text-8xl mb-6 inline-block"
                      animate={{ rotate: [-10, 10, -10] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ⛏️
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-8xl mb-6 inline-block"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      💎
                    </motion.div>
                  )}
                  
                  {isMining && (
                    <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-2">挖矿进度</div>
                      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gold-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${miningProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{miningProgress}%</div>
                    </div>
                  )}
                  
                  {miningProgress >= 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="text-4xl">🎉</div>
                      <div className="text-lg font-bold text-gold-500">恭喜获得！</div>
                      <div className="p-4 bg-gold-500/10 rounded">
                        <p className="text-2xl font-bold">120 铁矿石</p>
                        <p className="text-sm text-gray-400">价值 ¥36</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {!isMining && miningProgress === 0 && (
                    <>
                      <h3 className="text-lg font-bold mb-4">免费体验挖矿</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        真实游戏中需要5小时完成，这里加速展示
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl mb-1">⛏️</div>
                          <p className="text-xs text-gray-500">工具免费</p>
                        </div>
                        <div>
                          <div className="text-2xl mb-1">⚡</div>
                          <p className="text-xs text-gray-500">消耗20能量</p>
                        </div>
                        <div>
                          <div className="text-2xl mb-1">💰</div>
                          <p className="text-xs text-gray-500">保底收益</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 商品市场 */}
          {selectedTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black text-center mb-8">
                <span className="text-gold-500">热销商品</span>
                <span className="text-sm block mt-2 text-gray-400 font-normal">
                  真实商品，提货单分红
                </span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="pixel-card p-6"
                    whileHover={{ y: -4 }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{product.image}</div>
                      <h3 className="font-bold">{product.name}</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">价格</span>
                        <span className="font-bold text-gold-500">¥{product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">月分红</span>
                        <span className="text-green-500 font-bold">{product.monthlyDividend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">已售</span>
                        <span>{product.sold}件</span>
                      </div>
                    </div>
                    
                    <motion.button
                      className="w-full pixel-btn text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAction}
                    >
                      查看详情
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 收益预览 */}
          {selectedTab === 'earn' && (
            <motion.div
              key="earn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-2xl font-black text-center mb-8">
                <span className="text-gold-500">收益预览</span>
                <span className="text-sm block mt-2 text-gray-400 font-normal">
                  多种方式，稳定收益
                </span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div className="pixel-card p-6" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-lg font-bold mb-4 text-gold-500">日常收益</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⛏️</span>
                        <span>挖矿收益</span>
                      </div>
                      <span className="font-bold text-green-500">¥100-300/天</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🌾</span>
                        <span>种植收益</span>
                      </div>
                      <span className="font-bold text-green-500">¥50-150/天</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏠</span>
                        <span>租金收益</span>
                      </div>
                      <span className="font-bold text-green-500">¥200-500/天</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="pixel-card p-6" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-lg font-bold mb-4 text-gold-500">被动收益</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        <span>推荐奖励</span>
                      </div>
                      <span className="font-bold text-green-500">10-18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <span>团队分红</span>
                      </div>
                      <span className="font-bold text-green-500">3-14%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📜</span>
                        <span>提货单分红</span>
                      </div>
                      <span className="font-bold text-green-500">5-10%/月</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="mt-8 p-6 bg-gradient-to-br from-gold-500/20 to-transparent rounded-lg text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-xl font-bold mb-4">预估月收益</h4>
                <div className="text-4xl font-black text-gold-500 mb-2">
                  ¥15,000 - ¥50,000
                </div>
                <p className="text-sm text-gray-400">
                  根据投入和经营策略不同
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* 注册提示弹窗 */}
      <AnimatePresence>
        {showRegisterPrompt && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRegisterPrompt(false)}
          >
            <motion.div
              className="pixel-card p-8 max-w-md w-full bg-[#0A1628]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-black mb-4">
                  注册解锁全部功能
                </h3>
                <p className="text-gray-400 mb-6">
                  游客模式仅能浏览，注册后即可：
                </p>
                
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>获得100 TDB + 10 YLD新手礼包</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>购买土地，开始挖矿</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>开店经营，获得分红</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <span>发展团队，躺赚收益</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    className="flex-1 pixel-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/register')}
                  >
                    立即注册
                  </motion.button>
                  <motion.button
                    className="flex-1 px-4 py-3 border-2 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRegisterPrompt(false)}
                  >
                    继续浏览
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部提示 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent">
        <Container>
          <div className="py-4 text-center">
            <p className="text-sm text-gray-400 mb-2">
              您正在以游客身份体验，部分功能受限
            </p>
            <motion.button
              className="text-gold-500 font-bold hover:underline"
              onClick={() => router.push('/register')}
            >
              注册领取¥650新手礼包 →
            </motion.button>
          </div>
        </Container>
      </div>
    </div>
  )
}
