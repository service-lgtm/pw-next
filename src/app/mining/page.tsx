// src/app/mining/page.tsx
// 挖矿中心页面 - 基于平行世界白皮书优化版本

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'

// 类型定义 - 基于白皮书的资产体系
interface Tool {
  id: string
  name: string
  type: 'pickaxe' | 'axe' | 'hoe' | 'drill'
  nftId: string // NFT唯一标识
  durability: number // 当前耐久度
  maxDurability: number // 最大耐久度
  efficiency: number // 开采效率加成
  level: number // 工具等级
  icon: string
  status: 'idle' | 'mining' | 'repairing'
}

interface Material {
  type: 'iron' | 'wood' | 'stone' | 'yld' | 'grain' | 'seed'
  amount: number
  icon: string
  name: string
  description?: string
  dailyChange?: number // 日变化量
}

interface Mine {
  id: string
  nftId: string // NFT编号
  name: string
  type: 'iron' | 'stone' | 'forest' | 'meteor' | 'farmland'
  owner: string // 矿主昵称
  coordinates: { x: number; y: number } // 地理坐标
  area: number // 面积(m²)
  totalReserves: number // 总储量
  currentReserves: number // 当前储量
  dailyOutput: number // 日产量
  miningSpeed: number // 开采速度/小时
  status: 'idle' | 'mining' | 'hiring' | 'resting'
  requiredTool?: string // 所需工具类型
  energyCost: number // 能量消耗
  taxRate: number // 税率
  icon: string
  // 开采相关
  miningProgress?: number
  miningStartTime?: Date
  estimatedEndTime?: Date
  currentMiners?: number // 当前矿工数
  maxMiners?: number // 最大矿工数
  // 招聘相关
  hiringInfo?: {
    reward: number // 报酬百分比
    toolRequired: boolean
    expiresAt: Date
  }
}

interface MiningSession {
  mineId: string
  toolId: string
  startTime: Date
  estimatedDuration: number // 小时
  estimatedOutput: number
  energyCost: number
  tax: number
}

interface UserStats {
  energy: number
  maxEnergy: number
  grainConsumptionRate: number // 粮食消耗速率/小时
  currentGrainReserves: number
  miningPower: number // 总算力
  dailyIncome: number // 日收益
  totalAssets: number // 总资产价值
}

// 合成配方 - 基于白皮书的合成系统
const SYNTHESIS_RECIPES = {
  pickaxe: { iron: 70, wood: 30, yld: 0.08, successRate: 0.8 },
  axe: { iron: 60, wood: 40, yld: 0.08, successRate: 0.8 },
  hoe: { iron: 50, wood: 50, yld: 0.08, successRate: 0.8 },
  brick: { stone: 80, wood: 20, yld: 0.08, successRate: 0.95 }
}

export default function MiningPage() {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring'>('myMines')
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [showMarketModal, setShowMarketModal] = useState(false)
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [miningStep, setMiningStep] = useState<'select-tool' | 'confirm'>('select-tool')
  
  // 用户状态
  const [userStats, setUserStats] = useState<UserStats>({
    energy: 80,
    maxEnergy: 100,
    grainConsumptionRate: 100,
    currentGrainReserves: 450,
    miningPower: 2456,
    dailyIncome: 1234.56,
    totalAssets: 98765.43
  })

  // 工具数据 - 基于NFT标准
  const [tools, setTools] = useState<Tool[]>([
    { 
      id: '1', 
      name: '精铁镐', 
      type: 'pickaxe', 
      nftId: '#1234...5678',
      durability: 85, 
      maxDurability: 100, 
      efficiency: 120, 
      level: 3,
      icon: '⛏️',
      status: 'idle'
    },
    { 
      id: '2', 
      name: '合金斧', 
      type: 'axe', 
      nftId: '#2345...6789',
      durability: 92, 
      maxDurability: 100, 
      efficiency: 115, 
      level: 2,
      icon: '🪓',
      status: 'idle'
    },
    { 
      id: '3', 
      name: '强化锄', 
      type: 'hoe', 
      nftId: '#3456...7890',
      durability: 78, 
      maxDurability: 100, 
      efficiency: 110, 
      level: 2,
      icon: '🔨',
      status: 'idle'
    },
  ])

  // 材料数据
  const [materials, setMaterials] = useState<Material[]>([
    { type: 'iron', amount: 12345.12, icon: '🔩', name: '铁矿', dailyChange: 234.5 },
    { type: 'wood', amount: 12345.12, icon: '🪵', name: '木材', dailyChange: -123.4 },
    { type: 'stone', amount: 12345.12, icon: '🪨', name: '石材', dailyChange: 567.8 },
    { type: 'yld', amount: 123.45, icon: '💎', name: 'YLD', description: '治理代币' },
    { type: 'grain', amount: 450, icon: '🌾', name: '粮食', description: '能量补充' },
    { type: 'seed', amount: 25, icon: '🌱', name: '种子', description: '农业种植' },
  ])

  // 我的矿山数据
  const [myMines, setMyMines] = useState<Mine[]>([
    { 
      id: '1', 
      nftId: '#1234...5678',
      name: '铁矿山', 
      type: 'iron', 
      owner: '我的矿山',
      coordinates: { x: 121.4737, y: 31.2304 },
      area: 1000,
      totalReserves: 123456,
      currentReserves: 123456,
      dailyOutput: 1234.56,
      miningSpeed: 123.45,
      status: 'idle',
      requiredTool: 'pickaxe',
      energyCost: 20,
      taxRate: 5,
      icon: '⛏️',
      maxMiners: 5,
      currentMiners: 0
    },
    { 
      id: '2', 
      nftId: '#2345...6789',
      name: '陨石矿山', 
      type: 'meteor', 
      owner: '我的矿山',
      coordinates: { x: 121.5737, y: 31.3304 },
      area: 1000,
      totalReserves: 10000,
      currentReserves: 10000,
      dailyOutput: 10,
      miningSpeed: 2,
      status: 'mining',
      requiredTool: 'hoe',
      energyCost: 30,
      taxRate: 5,
      icon: '💎',
      maxMiners: 1,
      currentMiners: 1,
      miningProgress: 65,
      miningStartTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
    },
  ])

  // 招聘市场数据
  const [hiringMines, setHiringMines] = useState<Mine[]>([
    {
      id: '3',
      nftId: '#3456...7890',
      name: '优质铁矿',
      type: 'iron',
      owner: '矿主张三',
      coordinates: { x: 121.6737, y: 31.4304 },
      area: 2000,
      totalReserves: 234567,
      currentReserves: 200000,
      dailyOutput: 2345.67,
      miningSpeed: 234.56,
      status: 'hiring',
      requiredTool: 'pickaxe',
      energyCost: 25,
      taxRate: 3,
      icon: '⛏️',
      maxMiners: 10,
      currentMiners: 3,
      hiringInfo: {
        reward: 10,
        toolRequired: true,
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000)
      }
    }
  ])

  // 计算剩余能量时间
  const calculateEnergyTime = () => {
    if (userStats.grainConsumptionRate === 0) return Infinity
    return userStats.currentGrainReserves / userStats.grainConsumptionRate
  }

  // 格式化时间
  const formatTime = (hours: number) => {
    if (hours === Infinity) return '∞'
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}小时${m}分`
  }

  // 计算开采收益
  const calculateMiningReward = (mine: Mine, duration: number) => {
    const baseOutput = mine.miningSpeed * duration
    const efficiency = selectedTool ? selectedTool.efficiency / 100 : 1
    const grossOutput = baseOutput * efficiency
    const tax = grossOutput * (mine.taxRate / 100)
    return {
      gross: grossOutput,
      tax: tax,
      net: grossOutput - tax
    }
  }

  // 处理开始挖矿
  const handleStartMining = (mine: Mine) => {
    setSelectedMine(mine)
    setMiningStep('select-tool')
    setShowMiningModal(true)
  }

  // 处理工具选择
  const handleSelectTool = (tool: Tool) => {
    if (tool.durability <= 0) {
      alert('工具耐久度不足，请先修复！')
      return
    }
    setSelectedTool(tool)
    setMiningStep('confirm')
  }

  // 确认开始挖矿
  const confirmMining = () => {
    if (!selectedMine || !selectedTool) return

    // 检查能量
    if (userStats.energy < selectedMine.energyCost) {
      alert('能量不足！请补充粮食')
      return
    }

    // 更新矿山状态
    setMyMines(prev => prev.map(m => 
      m.id === selectedMine.id 
        ? { 
            ...m, 
            status: 'mining' as const, 
            miningProgress: 0,
            miningStartTime: new Date(),
            estimatedEndTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
            currentMiners: 1
          }
        : m
    ))

    // 消耗能量
    setUserStats(prev => ({
      ...prev,
      energy: Math.max(0, prev.energy - selectedMine.energyCost)
    }))

    // 更新工具状态
    setTools(prev => prev.map(t => 
      t.id === selectedTool.id
        ? { ...t, durability: t.durability - 1, status: 'mining' as const }
        : t
    ))

    setShowMiningModal(false)
    setSelectedMine(null)
    setSelectedTool(null)
  }

  // 停止挖矿
  const handleStopMining = (mineId: string) => {
    const mine = myMines.find(m => m.id === mineId)
    if (!mine || !mine.miningStartTime) return

    // 计算已挖矿时间和产出
    const duration = (Date.now() - mine.miningStartTime.getTime()) / (1000 * 60 * 60)
    const reward = calculateMiningReward(mine, duration)

    // 更新材料
    if (mine.type === 'meteor') {
      setMaterials(prev => prev.map(m => 
        m.type === 'yld' ? { ...m, amount: m.amount + reward.net } : m
      ))
    } else {
      const materialType = mine.type === 'forest' ? 'wood' : mine.type
      setMaterials(prev => prev.map(m => 
        m.type === materialType ? { ...m, amount: m.amount + reward.net } : m
      ))
    }

    // 重置矿山状态
    setMyMines(prev => prev.map(m => 
      m.id === mineId 
        ? { 
            ...m, 
            status: 'idle' as const, 
            miningProgress: undefined,
            miningStartTime: undefined,
            estimatedEndTime: undefined,
            currentMiners: 0
          }
        : m
    ))

    // 重置工具状态
    setTools(prev => prev.map(t => 
      t.status === 'mining' ? { ...t, status: 'idle' as const } : t
    ))

    alert(`挖矿完成！获得 ${reward.net.toFixed(2)} ${mine.type === 'meteor' ? 'YLD' : '矿产'}`)
  }

  // 模拟挖矿进度更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMyMines(prev => prev.map(mine => {
        if (mine.status === 'mining' && mine.miningStartTime && mine.estimatedEndTime) {
          const now = Date.now()
          const start = mine.miningStartTime.getTime()
          const end = mine.estimatedEndTime.getTime()
          const progress = Math.min(100, ((now - start) / (end - start)) * 100)
          
          if (progress >= 100) {
            handleStopMining(mine.id)
            return mine
          }
          
          return { ...mine, miningProgress: progress }
        }
        return mine
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部状态栏 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 能量状态 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">能量值</span>
                <div className="w-32 h-6 bg-gray-700 rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${userStats.energy}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {userStats.energy}%
                  </span>
                </div>
              </div>
              
              {/* 粮食储备 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">粮食储备</span>
                <span className="text-sm font-bold text-yellow-400">{userStats.currentGrainReserves}</span>
                <span className="text-xs text-gray-500">
                  (-{userStats.grainConsumptionRate}/h)
                </span>
              </div>
              
              {/* 剩余时间 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">剩余时间</span>
                <span className={cn(
                  "text-sm font-bold",
                  calculateEnergyTime() < 5 ? "text-red-400" : "text-green-400"
                )}>
                  {formatTime(calculateEnergyTime())}
                </span>
              </div>
            </div>
            
            {/* 快速统计 */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400">日收益</div>
                <div className="text-sm font-bold text-gold-500">{userStats.dailyIncome}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">总算力</div>
                <div className="text-sm font-bold text-blue-400">{userStats.miningPower}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">总资产</div>
                <div className="text-sm font-bold text-purple-400">{userStats.totalAssets}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('myMines')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'myMines' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            我的矿山
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'market' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            矿山市场
          </button>
          <button
            onClick={() => setActiveTab('hiring')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold transition-all",
              activeTab === 'hiring' 
                ? "bg-green-500 text-white" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            招聘市场
          </button>
        </div>

        {/* 内容区域 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧 - 工具和材料 */}
          <div className="col-span-4 space-y-6">
            {/* 我的工具 */}
            <PixelCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">我的工具</h3>
                <PixelButton size="xs" onClick={() => setShowSynthesisModal(true)}>
                  合成工具
                </PixelButton>
              </div>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <motion.div 
                    key={tool.id} 
                    className={cn(
                      "p-3 bg-gray-800 rounded-lg",
                      tool.status === 'mining' && "ring-2 ring-green-500"
                    )}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tool.icon}</span>
                        <div>
                          <p className="font-bold text-sm">
                            {tool.name} 
                            <span className="text-xs text-gray-400 ml-2">Lv.{tool.level}</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            NFT {tool.nftId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">耐久度</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                tool.durability > 50 ? "bg-green-500" : 
                                tool.durability > 20 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${(tool.durability / tool.maxDurability) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{tool.durability}%</span>
                        </div>
                        <p className="text-xs text-green-400 mt-1">
                          效率 +{tool.efficiency - 100}%
                        </p>
                      </div>
                    </div>
                    {tool.status === 'mining' && (
                      <div className="mt-2 text-xs text-green-400 text-center">
                        使用中...
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </PixelCard>

            {/* 我的材料 */}
            <PixelCard>
              <h3 className="font-bold mb-4">我的材料</h3>
              <div className="grid grid-cols-2 gap-3">
                {materials.map((material) => (
                  <div key={material.type} className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <span className="text-3xl block mb-1">{material.icon}</span>
                      <p className="font-bold text-lg">{material.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{material.name}</p>
                      {material.dailyChange && (
                        <p className={cn(
                          "text-xs mt-1",
                          material.dailyChange > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {material.dailyChange > 0 ? '+' : ''}{material.dailyChange.toFixed(2)}/天
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PixelCard>
          </div>

          {/* 右侧 - 矿山列表 */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {/* 我的矿山 */}
              {activeTab === 'myMines' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {myMines.length > 0 ? (
                    myMines.map((mine) => (
                      <PixelCard key={mine.id} className="relative overflow-hidden">
                        {mine.status === 'mining' && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
                            <motion.div
                              className="h-full bg-green-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${mine.miningProgress}%` }}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4 p-4">
                          <span className="text-5xl">{mine.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-lg">{mine.name}</h4>
                                <p className="text-sm text-gray-400">
                                  NFT {mine.nftId} | 坐标 ({mine.coordinates.x.toFixed(4)}, {mine.coordinates.y.toFixed(4)})
                                </p>
                                <p className="text-sm text-gray-400">
                                  面积：{mine.area}m² | 税率：{mine.taxRate}%
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-xs font-bold",
                                  mine.status === 'idle' && "bg-gray-700 text-gray-400",
                                  mine.status === 'mining' && "bg-green-500/20 text-green-400",
                                  mine.status === 'hiring' && "bg-blue-500/20 text-blue-400"
                                )}>
                                  {mine.status === 'idle' && '闲置'}
                                  {mine.status === 'mining' && '开采中'}
                                  {mine.status === 'hiring' && '招聘中'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">储量</span>
                                <p className="font-bold">{mine.currentReserves}/{mine.totalReserves}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">日产量</span>
                                <p className="font-bold text-yellow-400">{mine.dailyOutput}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">开采速度</span>
                                <p className="font-bold">{mine.miningSpeed}/小时</p>
                              </div>
                            </div>
                            
                            {mine.status === 'mining' && mine.estimatedEndTime && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-400">预计完成时间</span>
                                  <span className="text-green-400">
                                    {new Date(mine.estimatedEndTime).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <PixelButton 
                                    size="sm" 
                                    variant="secondary"
                                    className="flex-1 text-orange-400"
                                  >
                                    加速 (消耗道具)
                                  </PixelButton>
                                  <PixelButton 
                                    size="sm" 
                                    variant="secondary"
                                    className="flex-1 text-red-400"
                                    onClick={() => handleStopMining(mine.id)}
                                  >
                                    停止开采
                                  </PixelButton>
                                </div>
                              </div>
                            )}
                            
                            {mine.status === 'idle' && (
                              <div className="mt-4 flex gap-2">
                                <PixelButton 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleStartMining(mine)}
                                >
                                  开始开采
                                </PixelButton>
                                <PixelButton 
                                  size="sm" 
                                  variant="secondary"
                                  className="flex-1"
                                >
                                  发布招聘
                                </PixelButton>
                              </div>
                            )}
                          </div>
                        </div>
                      </PixelCard>
                    ))
                  ) : (
                    <PixelCard className="text-center py-12">
                      <span className="text-6xl block mb-4">🏔️</span>
                      <p className="text-gray-400 mb-4">您还没有矿山</p>
                      <PixelButton onClick={() => setActiveTab('market')}>
                        前往矿山市场
                      </PixelButton>
                    </PixelCard>
                  )}
                </motion.div>
              )}

              {/* 矿山市场 */}
              {activeTab === 'market' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">可购买矿山</h3>
                    <PixelButton size="sm" onClick={() => setShowMarketModal(true)}>
                      查看地图
                    </PixelButton>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'iron', name: '优质铁矿', reserves: 500000, price: 12345.67 },
                      { type: 'stone', name: '大型石矿', reserves: 800000, price: 23456.78 },
                      { type: 'forest', name: '原始森林', reserves: 300000, price: 34567.89 },
                      { type: 'meteor', name: '陨石矿脉', reserves: 10000, price: 98765.43 },
                    ].map((item, index) => (
                      <PixelCard key={index} className="p-4 hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">
                            {item.type === 'iron' && '⛏️'}
                            {item.type === 'stone' && '🪨'}
                            {item.type === 'forest' && '🌲'}
                            {item.type === 'meteor' && '💎'}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-xs text-gray-400">储量: {item.reserves.toLocaleString()}</p>
                            <p className="text-sm text-gold-500 font-bold mt-1">
                              {item.price} TDB
                            </p>
                          </div>
                          <PixelButton size="xs">
                            查看详情
                          </PixelButton>
                        </div>
                      </PixelCard>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 招聘市场 */}
              {activeTab === 'hiring' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {hiringMines.map((mine) => (
                    <PixelCard key={mine.id}>
                      <div className="flex items-start gap-4 p-4">
                        <span className="text-5xl">{mine.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-lg">{mine.name}</h4>
                              <p className="text-sm text-gray-400">
                                矿主：{mine.owner} | NFT {mine.nftId}
                              </p>
                              <p className="text-sm text-gray-400">
                                坐标 ({mine.coordinates.x.toFixed(4)}, {mine.coordinates.y.toFixed(4)})
                              </p>
                            </div>
                            {mine.hiringInfo && (
                              <div className="text-right">
                                <p className="text-xs text-gray-400">截止时间</p>
                                <p className="text-sm text-orange-400">
                                  {new Date(mine.hiringInfo.expiresAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">储量</span>
                              <p className="font-bold">{mine.currentReserves}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">日产量</span>
                              <p className="font-bold text-yellow-400">{mine.dailyOutput}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">报酬比例</span>
                              <p className="font-bold text-green-400">
                                {mine.hiringInfo?.reward}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">矿工数</span>
                              <p className="font-bold">
                                {mine.currentMiners}/{mine.maxMiners}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <PixelButton size="sm" className="flex-1">
                              {mine.hiringInfo?.toolRequired ? '带工具打工' : '无工具打工'}
                            </PixelButton>
                            <PixelButton size="sm" variant="secondary">
                              查看详情
                            </PixelButton>
                          </div>
                        </div>
                      </div>
                    </PixelCard>
                  ))}
                  
                  {hiringMines.length === 0 && (
                    <PixelCard className="text-center py-12">
                      <span className="text-6xl block mb-4">👷</span>
                      <p className="text-gray-400">暂无招聘信息</p>
                    </PixelCard>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 开采确认弹窗 */}
      <PixelModal
        isOpen={showMiningModal}
        onClose={() => {
          setShowMiningModal(false)
          setSelectedMine(null)
          setSelectedTool(null)
          setMiningStep('select-tool')
        }}
        title={miningStep === 'select-tool' ? '选择开采工具' : '确认开采信息'}
        size="medium"
      >
        {miningStep === 'select-tool' && selectedMine && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <span className="text-4xl">{selectedMine.icon}</span>
              <h3 className="font-bold mt-2">{selectedMine.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                请选择 {selectedMine.requiredTool === 'pickaxe' ? '镐头' : 
                       selectedMine.requiredTool === 'axe' ? '斧头' : '锄头'} 类工具
              </p>
            </div>
            
            <div className="space-y-3">
              {tools.filter(t => t.type === selectedMine.requiredTool && t.status === 'idle').map((tool) => (
                <motion.div
                  key={tool.id}
                  className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectTool(tool)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <p className="font-bold">{tool.name} Lv.{tool.level}</p>
                        <p className="text-xs text-gray-400">
                          耐久度: {tool.durability}% | 效率: +{tool.efficiency - 100}%
                        </p>
                      </div>
                    </div>
                    <PixelButton size="xs">
                      选择
                    </PixelButton>
                  </div>
                </motion.div>
              ))}
              
              {tools.filter(t => t.type === selectedMine.requiredTool && t.status === 'idle').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>没有可用的{selectedMine.requiredTool === 'pickaxe' ? '镐头' : 
                              selectedMine.requiredTool === 'axe' ? '斧头' : '锄头'}</p>
                  <PixelButton size="sm" className="mt-4" onClick={() => setShowSynthesisModal(true)}>
                    前往合成
                  </PixelButton>
                </div>
              )}
            </div>
          </div>
        )}
        
        {miningStep === 'confirm' && selectedMine && selectedTool && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-3">开采详情</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">矿山</span>
                  <span>{selectedMine.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">工具</span>
                  <span>{selectedTool.name} (效率 +{selectedTool.efficiency - 100}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">开采时长</span>
                  <span>5小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">基础产出</span>
                  <span>{(selectedMine.miningSpeed * 5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">效率加成</span>
                  <span className="text-green-400">
                    +{((selectedMine.miningSpeed * 5 * (selectedTool.efficiency / 100 - 1))).toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-400">预计总产出</span>
                  <span className="font-bold text-yellow-400">
                    {calculateMiningReward(selectedMine, 5).gross.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">税收 ({selectedMine.taxRate}%)</span>
                  <span className="text-red-400">
                    -{calculateMiningReward(selectedMine, 5).tax.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-gray-700 my-2" />
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">预计净收益</span>
                  <span className="font-bold text-gold-500">
                    {calculateMiningReward(selectedMine, 5).net.toFixed(2)} 
                    {selectedMine.type === 'meteor' ? ' YLD' : ` ${selectedMine.type}`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-sm text-orange-400">
                ⚠️ 开采将消耗 {selectedMine.energyCost}% 能量和 1 点工具耐久度
              </p>
            </div>
            
            <div className="flex gap-3">
              <PixelButton 
                className="flex-1"
                onClick={confirmMining}
                disabled={userStats.energy < selectedMine.energyCost}
              >
                确认开采
              </PixelButton>
              <PixelButton 
                variant="secondary" 
                className="flex-1"
                onClick={() => setMiningStep('select-tool')}
              >
                返回
              </PixelButton>
            </div>
            
            {userStats.energy < selectedMine.energyCost && (
              <p className="text-center text-red-400 text-sm">
                能量不足，需要 {selectedMine.energyCost}% 能量
              </p>
            )}
          </div>
        )}
      </PixelModal>

      {/* 合成弹窗 */}
      <PixelModal
        isOpen={showSynthesisModal}
        onClose={() => setShowSynthesisModal(false)}
        title="工具合成"
        size="large"
      >
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(SYNTHESIS_RECIPES).map(([type, recipe]) => (
            <PixelCard key={type} className="p-4">
              <div className="text-center mb-3">
                <span className="text-4xl">
                  {type === 'pickaxe' && '⛏️'}
                  {type === 'axe' && '🪓'}
                  {type === 'hoe' && '🔨'}
                  {type === 'brick' && '🧱'}
                </span>
                <h4 className="font-bold mt-2">
                  {type === 'pickaxe' && '镐头'}
                  {type === 'axe' && '斧头'}
                  {type === 'hoe' && '锄头'}
                  {type === 'brick' && '砖块'}
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">铁矿</span>
                  <span>{recipe.iron || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">木材</span>
                  <span>{recipe.wood || 0}%</span>
                </div>
                {recipe.stone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">石材</span>
                    <span>{recipe.stone}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">YLD</span>
                  <span>{recipe.yld}</span>
                </div>
                <div className="h-px bg-gray-700" />
                <div className="flex justify-between">
                  <span className="text-gray-400">成功率</span>
                  <span className="text-green-400">{(recipe.successRate * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <PixelButton size="sm" className="w-full mt-3">
                合成
              </PixelButton>
            </PixelCard>
          ))}
        </div>
      </PixelModal>
    </div>
  )
}
