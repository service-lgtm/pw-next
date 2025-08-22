// src/app/mining/AIMiningMode.tsx
// AI智能挖矿模式组件 - 一键托管挖矿
// 
// 文件说明：
// 这是AI智能挖矿的核心组件，提供极简的一键挖矿体验
// 用户只需选择投入比例和策略，AI会自动处理所有复杂决策
// 
// 创建原因：
// - 解决当前挖矿系统过于复杂的问题（需要理解土地、工具、资源等概念）
// - 为休闲玩家提供简单的参与方式
// - 降低新手门槛，提高用户转化率
// 
// 功能特性：
// 1. 三步开始：选择资源比例 → 选择策略 → 一键启动
// 2. AI自动决策：自动选地、配工具、调整策略
// 3. 实时反馈：简化的收益展示
// 4. 智能预警：资源不足时自动提醒
// 
// 关联文件：
// - 被 @/app/ai-mining/page.tsx 使用（AI挖矿页面）
// - 使用 @/hooks/useAIMining（AI挖矿Hook）
// - 使用 @/hooks/useProduction（获取资源数据）
// - 使用 @/components/shared 中的UI组件
// 
// 数据流：
// 1. 获取用户资源 → 2. 用户选择策略 → 3. 调用AI接口 → 4. 显示运行状态

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// AI策略类型定义
export type AIStrategy = 'conservative' | 'balanced' | 'aggressive'

// AI挖矿状态
export interface AIMiningState {
  isRunning: boolean
  strategy: AIStrategy
  resourcePercentage: number
  startTime: string | null
  lastUpdate: string | null
  stats: {
    todayEarnings: number
    totalEarnings: number
    efficiency: number
    sessionsManaged: number
    toolsInUse: number
    landsActive: number
  }
  nextSettlement: {
    time: string
    minutes: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
  }>
}

interface AIMiningModeProps {
  // 资源数据
  resources: {
    wood: number
    iron: number
    stone: number
    food: number
    yld: number
  }
  // 回调函数
  onStart: (strategy: AIStrategy, percentage: number) => Promise<void>
  onStop: () => Promise<void>
  onRefresh?: () => void
  // 状态
  isRunning?: boolean
  loading?: boolean
  // 样式
  className?: string
  compact?: boolean
}

// 策略配置
const STRATEGY_CONFIG = {
  conservative: {
    name: '保守型',
    icon: '😌',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    description: '稳定收益，低资源消耗',
    details: '适合长期挂机，资源消耗最少',
    riskLevel: 1,
    expectedReturn: '8-12%',
    resourceUsage: '低'
  },
  balanced: {
    name: '均衡型',
    icon: '⚖️',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    description: '平衡收益与消耗',
    details: '推荐大部分玩家使用',
    riskLevel: 2,
    expectedReturn: '15-20%',
    resourceUsage: '中'
  },
  aggressive: {
    name: '激进型',
    icon: '🚀',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    description: '最大化短期收益',
    details: '适合资源充足的玩家',
    riskLevel: 3,
    expectedReturn: '25-35%',
    resourceUsage: '高'
  }
}

// 资源投入预设
const RESOURCE_PRESETS = [
  { value: 25, label: '25%', description: '保守投入' },
  { value: 50, label: '50%', description: '标准投入' },
  { value: 75, label: '75%', description: '积极投入' },
  { value: 100, label: '100%', description: '全部投入' }
]

/**
 * AI挖矿模式组件
 */
export function AIMiningMode({
  resources,
  onStart,
  onStop,
  onRefresh,
  isRunning = false,
  loading = false,
  className,
  compact = false
}: AIMiningModeProps) {
  // 状态管理
  const [selectedStrategy, setSelectedStrategy] = useState<AIStrategy>('balanced')
  const [resourcePercentage, setResourcePercentage] = useState(50)
  const [showConfirm, setShowConfirm] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  
  // 模拟数据（实际应从API获取）
  const [aiStats, setAiStats] = useState({
    todayEarnings: 128.5,
    efficiency: 92,
    sessionsManaged: 3,
    nextSettlementMinutes: 45
  })
  
  // 计算投入的资源量
  const investedResources = useMemo(() => {
    return {
      wood: Math.floor(resources.wood * resourcePercentage / 100),
      iron: Math.floor(resources.iron * resourcePercentage / 100),
      stone: Math.floor(resources.stone * resourcePercentage / 100),
      food: Math.floor(resources.food * resourcePercentage / 100),
      yld: +(resources.yld * resourcePercentage / 100).toFixed(4)
    }
  }, [resources, resourcePercentage])
  
  // 计算预期收益（模拟）
  const expectedEarnings = useMemo(() => {
    const baseRate = selectedStrategy === 'conservative' ? 0.1 : 
                     selectedStrategy === 'balanced' ? 0.175 : 0.3
    const totalValue = investedResources.wood * 0.5 + 
                      investedResources.iron * 0.8 + 
                      investedResources.stone * 0.3 + 
                      investedResources.food * 0.2 + 
                      investedResources.yld * 10
    return +(totalValue * baseRate).toFixed(2)
  }, [selectedStrategy, investedResources])
  
  // 启动AI挖矿
  const handleStart = useCallback(async () => {
    setLocalLoading(true)
    try {
      await onStart(selectedStrategy, resourcePercentage)
      toast.success(
        <div>
          <p className="font-bold">AI挖矿已启动！</p>
          <p className="text-sm">策略：{STRATEGY_CONFIG[selectedStrategy].name}</p>
          <p className="text-sm">投入：{resourcePercentage}% 资源</p>
        </div>,
        { duration: 5000, icon: '🤖' }
      )
      setShowConfirm(false)
    } catch (error) {
      console.error('[AIMiningMode] Start failed:', error)
      toast.error('启动失败，请重试')
    } finally {
      setLocalLoading(false)
    }
  }, [selectedStrategy, resourcePercentage, onStart])
  
  // 停止AI挖矿
  const handleStop = useCallback(async () => {
    setLocalLoading(true)
    try {
      await onStop()
      toast.success('AI挖矿已停止，收益已自动结算', { icon: '✅' })
    } catch (error) {
      console.error('[AIMiningMode] Stop failed:', error)
      toast.error('停止失败，请重试')
    } finally {
      setLocalLoading(false)
    }
  }, [onStop])
  
  // 自动刷新状态（模拟）
  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      setAiStats(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + Math.random() * 5,
        efficiency: 85 + Math.random() * 15,
        nextSettlementMinutes: Math.max(0, prev.nextSettlementMinutes - 1)
      }))
    }, 60000) // 每分钟更新
    
    return () => clearInterval(interval)
  }, [isRunning])
  
  // 如果正在运行，显示运行状态
  if (isRunning) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* 运行状态卡片 */}
        <PixelCard className="relative overflow-hidden">
          {/* 动画背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20 animate-pulse" />
          
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">🤖</div>
                <div>
                  <h3 className="font-bold text-lg text-white">AI挖矿运行中</h3>
                  <p className="text-xs text-gray-400">
                    策略：{STRATEGY_CONFIG[selectedStrategy].name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm text-green-400">运行中</span>
              </div>
            </div>
            
            {/* 核心数据 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-800/50 rounded p-3">
                <p className="text-xs text-gray-400">今日收益</p>
                <p className="text-lg font-bold text-green-400">
                  +{aiStats.todayEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-green-400">YLD</p>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <p className="text-xs text-gray-400">运行效率</p>
                <p className="text-lg font-bold text-blue-400">
                  {aiStats.efficiency.toFixed(0)}%
                </p>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${aiStats.efficiency}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <p className="text-xs text-gray-400">管理会话</p>
                <p className="text-lg font-bold text-purple-400">
                  {aiStats.sessionsManaged}
                </p>
                <p className="text-xs text-gray-500">个</p>
              </div>
              <div className="bg-gray-800/50 rounded p-3">
                <p className="text-xs text-gray-400">下次结算</p>
                <p className="text-lg font-bold text-yellow-400">
                  {aiStats.nextSettlementMinutes}
                </p>
                <p className="text-xs text-gray-500">分钟</p>
              </div>
            </div>
            
            {/* AI决策日志（简化版） */}
            <div className="bg-gray-800/30 rounded p-3 mb-4">
              <p className="text-xs text-gray-400 mb-2">AI决策日志</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-green-400">
                  <span>✓</span>
                  <span>优化工具分配，效率提升15%</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <span>→</span>
                  <span>自动切换到高产土地</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <span>⚡</span>
                  <span>检测到YLD即将耗尽，已调整策略</span>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                onClick={handleStop}
                disabled={localLoading}
                className="flex-1"
              >
                {localLoading ? '处理中...' : '停止AI挖矿'}
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={onRefresh}
                disabled={loading}
              >
                刷新
              </PixelButton>
            </div>
          </div>
        </PixelCard>
        
        {/* 提示信息 */}
        <PixelCard className="p-4 bg-blue-900/20 border border-blue-500/30">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">💡</span>
            <div className="text-xs text-gray-300">
              <p className="font-bold text-blue-400 mb-1">AI正在为您工作</p>
              <p>• AI会自动选择最优土地和工具组合</p>
              <p>• 每小时整点自动结算收益</p>
              <p>• 资源不足时会自动调整策略</p>
            </div>
          </div>
        </PixelCard>
      </div>
    )
  }
  
  // 未运行状态 - 配置界面
  return (
    <div className={cn("space-y-4", className)}>
      {/* Step 1: 选择投入比例 */}
      <PixelCard className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">1️⃣</span>
          <h3 className="font-bold text-lg">选择资源投入</h3>
        </div>
        
        {/* 滑块选择 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">投入比例</span>
            <span className="text-lg font-bold text-gold-500">{resourcePercentage}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={resourcePercentage}
            onChange={(e) => setResourcePercentage(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${resourcePercentage}%, #374151 ${resourcePercentage}%, #374151 100%)`
            }}
          />
        </div>
        
        {/* 快捷选择 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {RESOURCE_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => setResourcePercentage(preset.value)}
              className={cn(
                "py-2 px-3 rounded transition-all text-sm",
                resourcePercentage === preset.value
                  ? "bg-gold-500 text-gray-900 font-bold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        {/* 资源预览 */}
        <div className="bg-gray-800/50 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">将投入的资源：</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span>🌲</span>
              <span className="text-green-400">{investedResources.wood}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⛏️</span>
              <span className="text-gray-400">{investedResources.iron}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🪨</span>
              <span className="text-blue-400">{investedResources.stone}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌾</span>
              <span className="text-yellow-400">{investedResources.food}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💎</span>
              <span className="text-purple-400">{investedResources.yld}</span>
            </div>
          </div>
        </div>
      </PixelCard>
      
      {/* Step 2: 选择策略 */}
      <PixelCard className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">2️⃣</span>
          <h3 className="font-bold text-lg">选择挖矿策略</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(STRATEGY_CONFIG) as AIStrategy[]).map(strategy => {
            const config = STRATEGY_CONFIG[strategy]
            const isSelected = selectedStrategy === strategy
            
            return (
              <button
                key={strategy}
                onClick={() => setSelectedStrategy(strategy)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  isSelected
                    ? `${config.bgColor} ${config.borderColor} border-opacity-100 scale-105`
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                )}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-gold-500 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                    已选
                  </div>
                )}
                
                <div className="text-3xl mb-2">{config.icon}</div>
                <h4 className={cn("font-bold mb-1", config.color)}>
                  {config.name}
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  {config.description}
                </p>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">预期收益</span>
                    <span className={config.color}>{config.expectedReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">资源消耗</span>
                    <span className="text-gray-400">{config.resourceUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">风险等级</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            i < config.riskLevel ? config.color.replace('text', 'bg') : "bg-gray-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </PixelCard>
      
      {/* Step 3: 启动 */}
      <PixelCard className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">3️⃣</span>
          <h3 className="font-bold text-lg">启动AI挖矿</h3>
        </div>
        
        {/* 配置摘要 */}
        <div className="bg-gray-800/50 rounded p-4 mb-4">
          <h4 className="text-sm font-bold text-gray-300 mb-3">配置摘要</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">选择策略</span>
              <span className={STRATEGY_CONFIG[selectedStrategy].color}>
                {STRATEGY_CONFIG[selectedStrategy].icon} {STRATEGY_CONFIG[selectedStrategy].name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">资源投入</span>
              <span className="text-gold-500">{resourcePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">预期日收益</span>
              <span className="text-green-400">~{expectedEarnings} YLD</span>
            </div>
          </div>
        </div>
        
        {/* 启动按钮 */}
        <PixelButton
          onClick={() => setShowConfirm(true)}
          disabled={loading || localLoading}
          className="w-full"
          size="lg"
        >
          <span className="flex items-center justify-center gap-2 text-lg">
            <span>🤖</span>
            <span>启动AI智能挖矿</span>
          </span>
        </PixelButton>
        
        {/* 提示 */}
        <p className="text-xs text-gray-500 text-center mt-3">
          AI将自动管理您的挖矿操作，您可以随时停止
        </p>
      </PixelCard>
      
      {/* 确认对话框 */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">确认启动AI挖矿</h3>
              
              <div className="space-y-3 mb-6">
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-300">
                    AI将使用 <span className="text-gold-500 font-bold">{resourcePercentage}%</span> 的资源，
                    采用 <span className={cn("font-bold", STRATEGY_CONFIG[selectedStrategy].color)}>
                      {STRATEGY_CONFIG[selectedStrategy].name}
                    </span> 策略进行挖矿。
                  </p>
                </div>
                
                <div className="text-xs text-gray-400">
                  <p>• AI会自动选择最优土地和工具</p>
                  <p>• 每小时整点自动结算收益</p>
                  <p>• 您可以随时停止并收回资源</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <PixelButton
                  onClick={handleStart}
                  disabled={localLoading}
                  className="flex-1"
                >
                  {localLoading ? '启动中...' : '确认启动'}
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={localLoading}
                >
                  取消
                </PixelButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIMiningMode
