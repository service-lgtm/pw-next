// src/app/mining/page.tsx
// 挖矿中心页面 - 生产版本（移除能量UI，清零模拟数据）
// 
// 文件说明：
// 1. 本文件是挖矿中心的主页面组件
// 2. 已移除所有能量相关的UI元素
// 3. 所有数据已清零或标记为待开放状态
// 4. 保留了完整的功能结构，便于后续开发
//
// 关联文件：
// - @/components/shared/PixelCard: 像素风格卡片组件
// - @/components/shared/PixelButton: 像素风格按钮组件
// - @/components/shared/PixelModal: 像素风格模态框组件
// - @/lib/utils: 工具函数（cn用于类名合并）
//
// 注意事项：
// - 所有数据当前为静态展示，实际功能待后端API接入
// - 保留了完整的类型定义和功能结构
// - UI交互逻辑已完整实现，可直接对接真实数据

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'

// ==================== 类型定义 ====================
// 基于平行世界白皮书的资产体系类型定义

// 工具类型定义
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

// 材料类型定义
interface Material {
  type: 'iron' | 'wood' | 'stone' | 'yld' | 'grain' | 'seed'
  amount: number
  icon: string
  name: string
  description?: string
  dailyChange?: number // 日变化量
}

// 矿山类型定义
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

// 用户统计数据类型（已移除能量相关字段）
interface UserStats {
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

// ==================== 主组件 ====================
export default function MiningPage() {
  // ========== 状态管理 ==========
  const [activeTab, setActiveTab] = useState<'myMines' | 'market' | 'hiring'>('myMines')
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [showMiningModal, setShowMiningModal] = useState(false)
  const [showMarketModal, setShowMarketModal] = useState(false)
  const [showSynthesisModal, setShowSynthesisModal] = useState(false)
  const [miningStep, setMiningStep] = useState<'select-tool' | 'confirm'>('select-tool')
  
  // 用户状态 - 数据已清零
  const [userStats, setUserStats] = useState<UserStats>({
    miningPower: 0, // 清零
    dailyIncome: 0, // 清零
    totalAssets: 0  // 清零
  })

  // 工具数据 - 清零/待开放
  const [tools, setTools] = useState<Tool[]>([
    // 暂无工具数据
  ])

  // 材料数据 - 全部清零
  const [materials, setMaterials] = useState<Material[]>([
    { type: 'iron', amount: 0, icon: '🔩', name: '铁矿', dailyChange: 0 },
    { type: 'wood', amount: 0, icon: '🪵', name: '木材', dailyChange: 0 },
    { type: 'stone', amount: 0, icon: '🪨', name: '石材', dailyChange: 0 },
    { type: 'yld', amount: 0, icon: '💎', name: 'YLD', description: '治理代币' },
    { type: 'grain', amount: 0, icon: '🌾', name: '粮食', description: '能量补充（功能待开放）' },
    { type: 'seed', amount: 0, icon: '🌱', name: '种子', description: '农业种植（功能待开放）' },
  ])

  // 我的矿山数据 - 清空
  const [myMines, setMyMines] = useState<Mine[]>([])

  // 招聘市场数据 - 清空
  const [hiringMines, setHiringMines] = useState<Mine[]>([])

  // ========== 功能函数 ==========
  
  // 格式化时间（保留功能，待后续使用）
  const formatTime = (hours: number) => {
    if (hours === Infinity) return '∞'
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}小时${m}分`
  }

  // 计算开采收益（保留功能结构）
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

  // 处理开始挖矿（功能待开放）
  const handleStartMining = (mine: Mine) => {
    alert('挖矿功能即将开放，敬请期待！')
  }

  // 处理工具选择（功能待开放）
  const handleSelectTool = (tool: Tool) => {
    alert('工具选择功能即将开放！')
  }

  // 确认开始挖矿（功能待开放）
  const confirmMining = () => {
    alert('挖矿功能即将开放，敬请期待！')
    setShowMiningModal(false)
  }

  // 停止挖矿（功能待开放）
  const handleStopMining = (mineId: string) => {
    alert('停止挖矿功能即将开放！')
  }

  // ==================== 渲染 ====================
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 顶部状态栏 - 已移除能量相关显示 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 系统状态提示 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-400">⚠️ 系统维护中</span>
                <span className="text-xs text-gray-400">数据同步功能即将开放</span>
              </div>
            </div>
            
            {/* 快速统计 - 数据已清零 */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400">日收益</div>
                <div className="text-sm font-bold text-gray-500">0.00</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">总算力</div>
                <div className="text-sm font-bold text-gray-500">0</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">总资产</div>
                <div className="text-sm font-bold text-gray-500">0.00</div>
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
                <PixelButton 
                  size="xs" 
                  onClick={() => alert('合成功能即将开放！')}
                >
                  合成工具
                </PixelButton>
              </div>
              <div className="space-y-3">
                {/* 无工具提示 */}
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🔨</span>
                  <p className="text-sm">暂无工具</p>
                  <p className="text-xs text-gray-600 mt-1">工具系统即将开放</p>
                </div>
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
                      <p className="font-bold text-lg text-gray-500">0.00</p>
                      <p className="text-xs text-gray-400">{material.name}</p>
                      {material.description && (
                        <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-500 text-center">
                  💡 材料系统正在维护中
                </p>
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
                  <PixelCard className="text-center py-12">
                    <span className="text-6xl block mb-4">🏔️</span>
                    <p className="text-gray-400 mb-4">您还没有矿山</p>
                    <p className="text-sm text-gray-500 mb-4">矿山系统即将开放</p>
                    <PixelButton 
                      onClick={() => setActiveTab('market')}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      前往矿山市场（待开放）
                    </PixelButton>
                  </PixelCard>
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
                    <PixelButton 
                      size="sm" 
                      onClick={() => alert('地图功能即将开放！')}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      查看地图（待开放）
                    </PixelButton>
                  </div>
                  
                  <PixelCard className="text-center py-12">
                    <span className="text-6xl block mb-4">🗺️</span>
                    <p className="text-gray-400 mb-2">矿山市场即将开放</p>
                    <p className="text-sm text-gray-500">
                      届时您可以在这里购买和交易矿山NFT
                    </p>
                  </PixelCard>
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
                  <PixelCard className="text-center py-12">
                    <span className="text-6xl block mb-4">👷</span>
                    <p className="text-gray-400 mb-2">招聘市场即将开放</p>
                    <p className="text-sm text-gray-500">
                      届时您可以雇佣矿工或成为矿工赚取收益
                    </p>
                  </PixelCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8">
          <PixelCard className="p-6 bg-blue-900/20 border-blue-500/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-400 mb-2">系统公告</h3>
                <p className="text-sm text-gray-300">
                  挖矿系统正在进行重大升级，预计将在近期开放。升级后将支持：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400">
                  <li>• NFT矿山所有权认证</li>
                  <li>• 智能合约自动分配收益</li>
                  <li>• 跨链资产转移</li>
                  <li>• 去中心化矿工市场</li>
                </ul>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* ==================== 模态框组件 ==================== */}
      
      {/* 开采确认弹窗 - 保留结构但功能待开放 */}
      <PixelModal
        isOpen={showMiningModal}
        onClose={() => {
          setShowMiningModal(false)
          setSelectedMine(null)
          setSelectedTool(null)
          setMiningStep('select-tool')
        }}
        title="挖矿功能"
        size="medium"
      >
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">🚧</span>
          <p className="text-gray-400 mb-2">功能升级中</p>
          <p className="text-sm text-gray-500">
            挖矿功能正在优化，即将开放
          </p>
        </div>
      </PixelModal>

      {/* 合成弹窗 - 保留结构但功能待开放 */}
      <PixelModal
        isOpen={showSynthesisModal}
        onClose={() => setShowSynthesisModal(false)}
        title="工具合成"
        size="large"
      >
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">🔧</span>
          <p className="text-gray-400 mb-2">合成系统维护中</p>
          <p className="text-sm text-gray-500">
            工具合成功能即将开放，敬请期待
          </p>
        </div>
      </PixelModal>
    </div>
  )
}
