// src/app/mining/MiningSessions.tsx
// 挖矿会话管理组件 - 新算法v2版本 - 完整修复版
'use client'

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { MiningPreCheck } from './MiningPreCheck'
import { SessionRateHistory } from './SessionRateHistory'
import { cn } from '@/lib/utils'
import type { MiningSession, Tool } from '@/types/production'
import type { Land } from '@/types/assets'
import toast from 'react-hot-toast'
import { useStopAllSessions } from '@/hooks/useProduction'

interface MiningSessionsProps {
  sessions: MiningSession[] | null
  loading: boolean
  userLands: Land[] | null
  tools: Tool[] | null
  onStartMining: (landId: number, toolIds: number[]) => Promise<any>
  onStopSession: (sessionId: number) => Promise<any>
  onCollectOutput: (sessionId: number) => Promise<any>
  onBuyFood?: () => void
  onSynthesizeTool?: () => void
  startMiningLoading?: boolean
  miningSummary?: any
  onRefresh?: () => void
}

// ==================== 常量定义 ====================
const FOOD_CONSUMPTION_RATE = 2
const DURABILITY_CONSUMPTION_RATE = 1
const TAX_RATES = {
  'SELF_MINING': 0.05,
  'RECRUIT_WITH_TOOL': 0.08,
  'RECRUIT_NO_TOOL': 0.07
}

// ==================== 工具函数 ====================
const formatNumber = (value: string | number | null | undefined, decimals: number = 4): string => {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  } else if (num >= 100) {
    return num.toFixed(2)
  } else if (num >= 10) {
    return num.toFixed(3)
  } else if (num >= 1) {
    return num.toFixed(4)
  } else {
    return num.toFixed(Math.min(decimals, 6))
  }
}

const formatDuration = (startTime: string, endTime?: string | null): string => {
  if (!startTime) return '未知'
  
  try {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diff = end.getTime() - start.getTime()
    
    if (diff < 0) return '0分钟'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}天${hours}小时`
    }
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  } catch (error) {
    console.error('[formatDuration] Error:', error)
    return '未知'
  }
}

const getNextSettlementInfo = (): { time: string, minutes: number } => {
  const now = new Date()
  const minutes = now.getMinutes()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  
  return {
    time: nextHour.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    minutes: 60 - minutes
  }
}

const calculateCurrentHourMinutes = (session: any): number => {
  if (!session.started_at) return 0
  
  const now = new Date()
  const startTime = new Date(session.started_at)
  const currentMinutes = now.getMinutes()
  
  if (startTime.getHours() === now.getHours() && 
      startTime.getDate() === now.getDate() &&
      startTime.getMonth() === now.getMonth()) {
    return currentMinutes - startTime.getMinutes()
  }
  
  const carriedMinutes = session.carried_minutes || 0
  return currentMinutes + carriedMinutes
}

// ==================== 挖矿汇总卡片 ====================
const MiningSummaryCard = memo(({ summary, compact = false }: {
  summary: any
  compact?: boolean
}) => {
  if (!summary) return null
  
  const activeSessions = summary.active_sessions || {}
  const resources = summary.resources || {}
  const tools = summary.tools || {}
  const yldStatus = summary.yld_status || {}
  const todayProduction = summary.today_production || {}
  const foodSustainability = summary.food_sustainability_hours || 0
  const recentSettlements = summary.recent_settlements || []
  const currentTime = summary.current_time
  const algorithmVersion = summary.algorithm_version || 'v2'
  
  const sessionsList = activeSessions.sessions || []
  const totalFoodConsumption = activeSessions.total_food_consumption || 0
  const totalPendingRewards = activeSessions.total_pending_rewards || 0
  
  if (compact) {
    return (
      <PixelCard className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold">挖矿概况</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {activeSessions.count || 0} 个会话
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded">
              {algorithmVersion}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
          <div className="text-center">
            <p className="text-gray-500">待收取</p>
            <p className="font-bold text-green-400">
              {formatNumber(totalPendingRewards, 4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">今日产出</p>
            <p className="font-bold text-purple-400">
              {formatNumber(todayProduction.total || 0, 4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">粮食剩余</p>
            <p className="font-bold text-yellow-400">
              {foodSustainability.toFixed(1)}h
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">YLD今日限额</span>
            <span className="text-gray-400">
              {formatNumber(yldStatus.remaining || 0, 0)}/{formatNumber(yldStatus.daily_limit || 208, 0)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                yldStatus.percentage_used >= 90 ? "bg-red-500" :
                yldStatus.percentage_used >= 70 ? "bg-yellow-500" :
                "bg-green-500"
              )}
              style={{ width: `${100 - (yldStatus.percentage_used || 0)}%` }}
            />
          </div>
        </div>
      </PixelCard>
    )
  }
  
  return (
    <PixelCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">挖矿汇总</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {activeSessions.count || 0} 个活跃会话
          </span>
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
            {algorithmVersion}算法
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="bg-green-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">待收取收益</p>
          <p className="text-lg font-bold text-green-400">
            {formatNumber(totalPendingRewards, 4)}
          </p>
          <p className="text-xs text-gray-500">
            {todayProduction.pending?.hours || 0} 小时待结算
          </p>
        </div>
        
        <div className="bg-purple-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">今日产出</p>
          <p className="text-lg font-bold text-purple-400">
            {formatNumber(todayProduction.total || 0, 4)}
          </p>
          <div className="text-xs text-gray-500">
            <p>已发放: {formatNumber(todayProduction.distributed?.amount || 0, 2)}</p>
            <p>待发放: {formatNumber(todayProduction.pending?.amount || 0, 2)}</p>
          </div>
        </div>
        
        <div className="bg-yellow-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">粮食可持续</p>
          <p className="text-lg font-bold text-yellow-400">
            {foodSustainability.toFixed(1)} 小时
          </p>
          <p className="text-xs text-gray-500">
            消耗 {totalFoodConsumption}/小时
          </p>
          <p className="text-xs text-orange-400">
            库存 {formatNumber(resources.food || 0, 0)} 单位
          </p>
        </div>
        
        <div className="bg-blue-900/20 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">工具状态</p>
          <p className="text-sm">
            <span className="text-green-400">{tools.idle || 0} 闲置</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-blue-400">{tools.in_use || 0} 使用中</span>
          </p>
          <p className="text-xs text-gray-500">
            共 {tools.total || 0} 个
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-purple-400">YLD 今日状态</span>
          <span className="text-xs text-gray-400">
            速率: {formatNumber(yldStatus.current_hourly_rate || 0, 2)}/h
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">已使用</span>
              <span className="text-gray-400">
                {formatNumber(yldStatus.daily_limit - yldStatus.remaining, 2)} / {formatNumber(yldStatus.daily_limit || 208, 0)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  yldStatus.percentage_used >= 90 ? "bg-red-500" :
                  yldStatus.percentage_used >= 70 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${yldStatus.percentage_used || 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">剩余</p>
            <p className="text-sm font-bold text-yellow-400">
              {formatNumber(yldStatus.remaining || 0, 2)}
            </p>
          </div>
        </div>
      </div>
      
      {sessionsList.length > 0 && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded mb-3">
          <p className="text-sm font-bold text-blue-400 mb-2">活跃会话详情</p>
          <div className="space-y-2">
            {sessionsList.map((session: any, idx: number) => (
              <div key={idx} className="bg-gray-800/50 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gold-500">{session.session_id}</p>
                    <p className="text-xs text-gray-400">
                      {session.land_name} · {session.resource_type?.toUpperCase() || 'YLD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-400 font-bold">
                      待收 {formatNumber(session.pending_output, 4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      已结算 {session.settled_hours} 小时
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {recentSettlements.length > 0 && (
        <div className="p-3 bg-gray-800/50 rounded mb-3">
          <p className="text-sm font-bold text-gray-300 mb-2">最近结算记录</p>
          <div className="space-y-1">
            {recentSettlements.map((settlement: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{settlement.hour}</span>
                <span className="font-bold text-green-400">
                  {formatNumber(settlement.net_output, 4)} {settlement.resource_type?.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {settlement.tool_count}工具/{settlement.settled_minutes}分钟
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </PixelCard>
  )
})

MiningSummaryCard.displayName = 'MiningSummaryCard'

// ==================== 实时倒计时组件 ====================
const SettlementCountdown = memo(() => {
  const [countdown, setCountdown] = useState(getNextSettlementInfo())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextSettlementInfo())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded-full">
      <span className="text-xs text-purple-400">下次结算</span>
      <span className="text-sm font-bold text-purple-300">{countdown.time}</span>
      <span className="text-xs text-gray-400">({countdown.minutes}分钟)</span>
    </div>
  )
})

SettlementCountdown.displayName = 'SettlementCountdown'

// ==================== 自定义下拉框组件 ====================
const CustomDropdown = memo(({ 
  lands, 
  selectedLand, 
  onSelect,
  error,
  showError 
}: { 
  lands: Land[]
  selectedLand: Land | null
  onSelect: (land: Land | null) => void
  error: string
  showError: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])
  
  const handleSelect = (land: Land | null) => {
    onSelect(land)
    setIsOpen(false)
  }
  
  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2.5 bg-gray-800/70 border rounded-lg",
          "text-left text-white text-sm",
          "focus:outline-none transition-colors",
          "flex items-center justify-between",
          showError && error ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-gold-500"
        )}
      >
        <span className={selectedLand ? "text-white" : "text-gray-400"}>
          {selectedLand ? `${selectedLand.land_id} - ${selectedLand.blueprint?.land_type_display || selectedLand.land_type_display || '未知类型'}` : '-- 请选择土地 --'}
        </span>
        <span className={cn("transition-transform", isOpen ? "rotate-180" : "")}>▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full px-3 py-2 text-left text-sm",
              "hover:bg-gray-700 transition-colors",
              "border-b border-gray-700",
              !selectedLand ? "bg-gray-700 text-gold-400" : "text-gray-400"
            )}
          >
            -- 请选择土地 --
          </button>
          
          {lands.map((land, index) => (
            <button
              key={land.id}
              type="button"
              onClick={() => handleSelect(land)}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm",
                "hover:bg-gray-700 transition-colors",
                "flex flex-col gap-0.5",
                selectedLand?.id === land.id ? "bg-gray-700 text-gold-400" : "text-white",
                index !== lands.length - 1 && "border-b border-gray-700/50"
              )}
            >
              <span className="font-medium">{land.land_id}</span>
              <span className="text-xs text-gray-400">
                {land.blueprint?.land_type_display || land.land_type_display || '未知类型'}
                {land.region_name && ` · ${land.region_name}`}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showError && error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <span>❌</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

CustomDropdown.displayName = 'CustomDropdown'

// ==================== 会话卡片组件（修复版） ====================
const SessionCardV2 = memo(({ 
  session, 
  onStop,
  onViewHistory,
  isMobile = false
}: { 
  session: any
  onStop: () => void
  onViewHistory: () => void
  isMobile?: boolean
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])
  
  // 直接使用API返回的数据 - 重要修复
  const sessionId = session.session_id || `Session-${session.id}`
  const landName = session.land_name || '未知土地'
  const startTime = session.started_at
  const toolCount = session.tool_count || 0
  const foodConsumption = session.food_consumption_rate || 0
  const resourceType = session.resource_type || 'yld'
  const algorithmVersion = session.algorithm_version || 'v2'
  
  // 核心数据 - 使用正确的字段名
  const pendingOutput = session.pending_output || 0
  const settledHours = session.settled_hours || 0
  const totalHoursWorked = session.total_hours_worked || 0
  const currentHourMinutes = session.current_hour_minutes || 0
  const currentHourStatus = session.current_hour_status || `累积中(${currentHourMinutes}/60)`
  const lastSettlementHour = session.last_settlement_hour || null
  
  const nextSettlement = getNextSettlementInfo()
  
  if (isMobile) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-sm text-gold-500">
              {sessionId}
            </p>
            <p className="text-[10px] text-gray-400">
              {landName} · {formatDuration(startTime)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[10px]">
              {algorithmVersion.toUpperCase()}
            </span>
            <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px]">
              挖矿中
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-2 text-[11px]">
          <div>
            <p className="text-gray-500">待收取</p>
            <p className="font-bold text-green-400">{formatNumber(pendingOutput, 4)}</p>
          </div>
          <div>
            <p className="text-gray-500">已结算</p>
            <p className="font-bold text-blue-400">{settledHours}小时</p>
          </div>
          <div>
            <p className="text-gray-500">当前小时</p>
            <p className="font-bold text-yellow-400">{currentHourMinutes}分钟</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          <PixelButton
            size="xs"
            variant="secondary"
            onClick={onStop}
            className="text-[11px]"
          >
            结束挖矿
          </PixelButton>
          <PixelButton
            size="xs"
            variant="secondary"
            onClick={onViewHistory}
            className="text-[11px]"
          >
            历史
          </PixelButton>
        </div>
      </div>
    )
  }
  
  return (
    <PixelCard className="overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">
              {sessionId}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {landName} · {resourceType.toUpperCase()}矿山
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
              {algorithmVersion.toUpperCase()}
            </span>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
              挖矿中
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-purple-400">新算法v2 状态</span>
            <span className="text-xs text-gray-400">整点结算</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">待收取净收益</p>
              <p className="text-lg font-bold text-green-400">{formatNumber(pendingOutput, 6)}</p>
              <p className="text-xs text-gray-500">停止时发放</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">已结算时段</p>
              <p className="text-lg font-bold text-blue-400">{settledHours} 小时</p>
              <p className="text-xs text-gray-500">每小时整点结算</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">当前小时挖矿进度</p>
              <p className="text-sm font-bold text-yellow-400">{currentHourMinutes} / 60 分钟</p>
              <p className="text-xs text-gray-500 mt-1">{currentHourStatus}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">下次结算</p>
              <p className="text-sm font-bold text-yellow-400">{nextSettlement.time}</p>
              <p className="text-xs text-gray-500">{nextSettlement.minutes}分钟后</p>
            </div>
          </div>
          {currentHourMinutes < 60 && (
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${(currentHourMinutes / 60) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                累积中，满60分钟才参与结算
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">挖矿时长</p>
            <p className="font-bold text-blue-400">{formatDuration(startTime)}</p>
            <p className="text-xs text-gray-500">({totalHoursWorked.toFixed(2)}小时)</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">工具数量</p>
            <p className="font-bold text-yellow-400">{toolCount} 个</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">粮食消耗</p>
            <p className="font-bold text-orange-400">{foodConsumption}/小时</p>
          </div>
        </div>
        
        {lastSettlementHour && (
          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <span className="text-xs text-gray-400">最后结算时间</span>
            <span className="text-sm text-gray-300">{lastSettlementHour}</span>
          </div>
        )}
        
        <div className="p-2 bg-red-900/20 border border-red-500/30 rounded">
          {pendingOutput > 0 ? (
            <p className="text-xs text-yellow-400">
              💰 您有 {formatNumber(pendingOutput, 4)} YLD 待收取，停止挖矿即可获得
            </p>
          ) : (
            <p className="text-xs text-red-400">
              ⚠️ 重要：收益在整点结算但不发放，需要停止挖矿才能收取所有待收取收益
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            variant="primary"
            onClick={onStop}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>💰</span>
              <span>结束并收取</span>
            </span>
          </PixelButton>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={onViewHistory}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>📊</span>
              <span>历史</span>
            </span>
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  )
})

SessionCardV2.displayName = 'SessionCardV2'

// ==================== 开始挖矿表单组件 ====================
const StartMiningForm = memo(({
  userLands,
  tools,
  selectedLand,
  selectedTools,
  onLandSelect,
  onToolsSelect,
  onConfirm,
  onCancel,
  loading = false
}: {
  userLands: Land[]
  tools: Tool[]
  selectedLand: Land | null
  selectedTools: number[]
  onLandSelect: (land: Land | null) => void
  onToolsSelect: (toolIds: number[]) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) => {
  const [landError, setLandError] = useState('')
  const [toolError, setToolError] = useState('')
  const [showLandError, setShowLandError] = useState(false)
  const [showToolError, setShowToolError] = useState(false)
  
  const availableTools = useMemo(() => 
    tools.filter(t => t.status === 'normal' && !t.is_in_use && (t.current_durability || 0) > 0),
    [tools]
  )
  
  const handleConfirmClick = () => {
    let hasError = false
    
    if (!selectedLand) {
      setLandError('请选择土地')
      setShowLandError(true)
      hasError = true
    } else {
      setShowLandError(false)
    }
    
    if (selectedTools.length === 0) {
      setToolError('请至少选择一个工具')
      setShowToolError(true)
      hasError = true
    } else {
      setShowToolError(false)
    }
    
    if (!hasError) {
      onConfirm()
    }
  }
  
  const estimatedConsumption = {
    food: selectedTools.length * FOOD_CONSUMPTION_RATE,
    durability: selectedTools.length * DURABILITY_CONSUMPTION_RATE
  }
  
  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
        <div className="flex items-start gap-2">
          <span className="text-purple-400">💎</span>
          <div>
            <p className="text-sm font-bold text-purple-400 mb-1">新算法v2规则</p>
            <ul className="text-xs text-gray-300 space-y-0.5">
              <li>• 每小时整点结算上一小时收益</li>
              <li>• 收益暂存不发放，停止时一次性收取</li>
              <li>• 不足60分钟的时间累积到下小时</li>
              <li>• 停止时当前小时不足60分钟部分作废</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-2">
          <span>📍</span>
          <span>选择土地</span>
        </label>
        <CustomDropdown
          lands={userLands}
          selectedLand={selectedLand}
          onSelect={onLandSelect}
          error={landError}
          showError={showLandError}
        />
      </div>
      
      <div>
        <label className="text-sm font-bold text-gray-300 flex items-center justify-between mb-2">
          <span className="flex items-center gap-2">
            <span>🔧</span>
            <span>选择工具</span>
          </span>
          {selectedTools.length > 0 && (
            <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded">
              已选 {selectedTools.length} 个
            </span>
          )}
        </label>
        
        {availableTools.length > 0 ? (
          <div className="border border-gray-600 rounded-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto bg-gray-800/30">
              {availableTools.map((tool, index) => (
                <label 
                  key={tool.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-gray-700/50",
                    selectedTools.includes(tool.id) && "bg-gray-700/70",
                    index !== 0 && "border-t border-gray-700"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onToolsSelect([...selectedTools, tool.id])
                      } else {
                        onToolsSelect(selectedTools.filter(id => id !== tool.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-gold-500 bg-gray-800 focus:ring-gold-500 focus:ring-offset-0"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tool.tool_id}</p>
                      <p className="text-xs text-gray-400">{tool.tool_type_display}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">耐久度</p>
                      <p className="text-xs">
                        <span className={cn(
                          tool.current_durability < 100 ? "text-red-400" :
                          tool.current_durability < 500 ? "text-yellow-400" :
                          "text-green-400"
                        )}>
                          {tool.current_durability}
                        </span>
                        <span className="text-gray-500">/{tool.max_durability || 1500}</span>
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="p-2 bg-gray-800/50 border-t border-gray-700 flex gap-2">
              <button
                type="button"
                onClick={() => onToolsSelect(availableTools.map(t => t.id))}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                全选
              </button>
              <button
                type="button"
                onClick={() => onToolsSelect([])}
                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded-lg text-center">
            <p className="text-sm text-gray-400">暂无可用工具</p>
            <p className="text-xs text-gray-500 mt-1">请先合成工具或等待工具修复</p>
          </div>
        )}
        
        {showToolError && toolError && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <span>❌</span>
            <span>{toolError}</span>
          </p>
        )}
      </div>
      
      {selectedTools.length > 0 && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
          <p className="text-xs text-blue-400 font-bold mb-2">预计消耗（每小时）</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">🌾 粮食</span>
                <span className="text-sm font-bold text-yellow-400">{estimatedConsumption.food} 单位</span>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">⚙️ 耐久</span>
                <span className="text-sm font-bold text-gray-400">{estimatedConsumption.durability} 点/工具</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        <PixelButton
          className="flex-1"
          onClick={handleConfirmClick}
          disabled={loading}
        >
          {loading ? '处理中...' : '确认开始'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </PixelButton>
      </div>
    </div>
  )
})

StartMiningForm.displayName = 'StartMiningForm'

// ==================== 主组件 ====================
export function MiningSessions({
  sessions,
  loading,
  userLands,
  tools,
  onStartMining,
  onStopSession,
  onCollectOutput,
  onBuyFood,
  onSynthesizeTool,
  startMiningLoading = false,
  miningSummary,
  onRefresh
}: MiningSessionsProps) {
  const [showStartModal, setShowStartModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPreCheck, setShowPreCheck] = useState(false)
  const [showRateHistory, setShowRateHistory] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [confirmAction, setConfirmAction] = useState<'start' | 'stop' | 'stopAll' | null>(null)
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const { stopAll, loading: stopAllLoading } = useStopAllSessions()
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // ==================== 重要修复：使用正确的会话数据 ====================
  const displaySessions = useMemo(() => {
    // 优先使用 miningSummary 中的完整数据
    if (miningSummary?.active_sessions?.sessions && miningSummary.active_sessions.sessions.length > 0) {
      return miningSummary.active_sessions.sessions
    }
    // 降级使用 sessions prop
    return sessions || []
  }, [miningSummary, sessions])
  
  const availableTools = useMemo(() => 
    tools?.filter(t => t.status === 'normal' && !t.is_in_use && (t.current_durability || 0) > 0) || [],
    [tools]
  )
  
  const handleExecuteStart = useCallback(async () => {
    if (!selectedLand || selectedTools.length === 0) return
    
    try {
      const response = await onStartMining(selectedLand.id, selectedTools)
      
      if (response?.data) {
        const data = response.data
        
        toast.success(
          <div>
            <p className="font-bold">挖矿已开始！</p>
            <p className="text-sm">会话ID: {data.session_id}</p>
            <p className="text-sm">算法版本: {data.algorithm_version}</p>
          </div>,
          {
            duration: 8000,
            position: 'top-center',
            icon: '⛏️'
          }
        )
      }
      
      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      console.error('开始挖矿失败:', err)
      toast.error(err?.response?.data?.message || '开始挖矿失败')
    }
  }, [selectedLand, selectedTools, onStartMining, onRefresh])
  
  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return
    
    try {
      const session = displaySessions.find((s: any) => s.session_pk === targetSessionId || s.id === targetSessionId)
      const response = await onStopSession(targetSessionId)
      
      if (response?.data) {
        const data = response.data
        
        toast.success(
          <div>
            <p className="font-bold">挖矿已结束！</p>
            <p className="text-sm">总净收益: {formatNumber(data.total_collected || session?.pending_output || 0, 4)} YLD</p>
          </div>,
          {
            duration: 6000,
            position: 'top-center',
            icon: '💰'
          }
        )
      }
      
      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
      onRefresh?.()
    } catch (err: any) {
      console.error('停止生产失败:', err)
      toast.error(err?.response?.data?.message || '停止生产失败')
    }
  }, [targetSessionId, displaySessions, onStopSession, onRefresh])
  
  const handleStopAll = useCallback(async () => {
    try {
      const result = await stopAll()
      
      if (result?.data) {
        toast.success('批量停止成功！', {
          duration: 5000,
          position: 'top-center',
          icon: '✅'
        })
      }
      
      setShowConfirmModal(false)
      setConfirmAction(null)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('批量停止失败:', error)
    }
  }, [stopAll])
  
  const handleOpenStartModal = useCallback(() => {
    setShowPreCheck(true)
  }, [])
  
  const handlePreCheckProceed = useCallback(() => {
    setShowPreCheck(false)
    setShowStartModal(true)
    setSelectedLand(null)
    setSelectedTools([])
  }, [])
  
  const handleConfirmStart = useCallback(() => {
    if (!selectedLand || selectedTools.length === 0) {
      toast.error('请选择土地和工具')
      return
    }
    
    setConfirmAction('start')
    setShowConfirmModal(true)
  }, [selectedLand, selectedTools])
  
  const handleConfirmStop = useCallback((sessionPk: number) => {
    setTargetSessionId(sessionPk)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }, [])
  
  const handleViewHistory = useCallback((sessionPk: number) => {
    setSelectedSessionId(sessionPk)
    setShowRateHistory(true)
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold">活跃挖矿会话</h3>
          {displaySessions.length > 0 && <SettlementCountdown />}
        </div>
        <div className="flex gap-2">
          {displaySessions.length > 0 && (
            <PixelButton
              onClick={() => {
                setConfirmAction('stopAll')
                setShowConfirmModal(true)
              }}
              variant="secondary"
              size={isMobile ? "xs" : "sm"}
            >
              <span className="flex items-center gap-2">
                <span>⏹️</span>
                <span>全部停止</span>
              </span>
            </PixelButton>
          )}
          <PixelButton
            onClick={handleOpenStartModal}
            disabled={!userLands || userLands.length === 0 || !tools || tools.length === 0}
            size={isMobile ? "xs" : "sm"}
          >
            <span className="flex items-center gap-2">
              <span>⛏️</span>
              <span>开始挖矿</span>
            </span>
          </PixelButton>
        </div>
      </div>
      
      {miningSummary && (
        <MiningSummaryCard summary={miningSummary} compact={isMobile} />
      )}
      
      {loading ? (
        <PixelCard className="text-center py-8">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-gray-400 mt-2">加载中...</p>
        </PixelCard>
      ) : displaySessions.length > 0 ? (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {displaySessions.map((session: any) => (
            <SessionCardV2
              key={session.session_pk || session.id}
              session={session}
              onStop={() => handleConfirmStop(session.session_pk || session.id)}
              onViewHistory={() => handleViewHistory(session.session_pk || session.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <PixelCard className="text-center py-12">
          <div className="text-6xl mb-4">⛏️</div>
          <p className="text-gray-400 mb-2">暂无活跃的挖矿会话</p>
          <p className="text-sm text-gray-500 mb-4">
            {!userLands || userLands.length === 0 
              ? '您需要先拥有土地才能开始挖矿'
              : !tools || tools.length === 0
              ? '您需要先合成工具才能开始挖矿' 
              : '点击"开始挖矿"按钮创建新的挖矿会话'}
          </p>
          {userLands && userLands.length > 0 && tools && tools.length > 0 && (
            <PixelButton onClick={handleOpenStartModal} size="sm">
              开始挖矿
            </PixelButton>
          )}
        </PixelCard>
      )}
      
      {showPreCheck && (
        <PixelModal
          isOpen={showPreCheck}
          onClose={() => setShowPreCheck(false)}
          title="挖矿条件检查"
          size={isMobile ? "small" : "medium"}
        >
          <MiningPreCheck
            onProceed={handlePreCheckProceed}
            onCancel={() => setShowPreCheck(false)}
            onBuyFood={onBuyFood}
            onSynthesizeTool={onSynthesizeTool}
          />
        </PixelModal>
      )}
      
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
        }}
        title="开始自主挖矿"
        size={isMobile ? "small" : "medium"}
      >
        {userLands && tools && (
          <StartMiningForm
            userLands={userLands}
            tools={tools}
            selectedLand={selectedLand}
            selectedTools={selectedTools}
            onLandSelect={setSelectedLand}
            onToolsSelect={setSelectedTools}
            onConfirm={handleConfirmStart}
            onCancel={() => {
              setShowStartModal(false)
              setSelectedLand(null)
              setSelectedTools([])
            }}
            loading={startMiningLoading}
          />
        )}
      </PixelModal>
      
      <PixelModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setTargetSessionId(null)
        }}
        title={
          confirmAction === 'start' ? '确认开始挖矿' : 
          confirmAction === 'stopAll' ? '确认结束所有会话' :
          '确认结束挖矿'
        }
        size="small"
      >
        <div className="space-y-4">
          {confirmAction === 'start' && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⛏️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要开始挖矿吗？
                </p>
              </div>
              
              {selectedLand && (
                <div className="bg-gray-800 rounded p-3 text-xs space-y-1">
                  <p>土地：{selectedLand.land_id}</p>
                  <p>工具数量：{selectedTools.length} 个</p>
                  <p className="text-yellow-400">粮食消耗：{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位/小时</p>
                </div>
              )}
            </>
          )}
          
          {confirmAction === 'stop' && targetSessionId && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束挖矿吗？
                </p>
              </div>
              
              {(() => {
                const session = displaySessions.find((s: any) => 
                  s.session_pk === targetSessionId || s.id === targetSessionId
                )
                if (!session) return null
                
                return (
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <p>会话ID：{session.session_id}</p>
                    <p className="text-green-400 font-bold">
                      待收取净收益：{formatNumber(session.pending_output || 0, 4)} YLD
                    </p>
                    <p className="text-blue-400">
                      已结算：{session.settled_hours || 0} 小时
                    </p>
                  </div>
                )
              })()}
            </>
          )}
          
          {confirmAction === 'stopAll' && (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⏹️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束所有 {displaySessions.length} 个挖矿会话吗？
                </p>
              </div>
            </>
          )}
          
          <div className="flex gap-3">
            <PixelButton
              className="flex-1"
              variant={confirmAction === 'stop' || confirmAction === 'stopAll' ? 'secondary' : 'primary'}
              onClick={
                confirmAction === 'start' ? handleExecuteStart : 
                confirmAction === 'stopAll' ? handleStopAll :
                handleExecuteStop
              }
              disabled={confirmAction === 'stopAll' && stopAllLoading}
            >
              {confirmAction === 'stopAll' && stopAllLoading ? '处理中...' : '确认'}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => {
                setShowConfirmModal(false)
                setConfirmAction(null)
                setTargetSessionId(null)
              }}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
      
      {showRateHistory && selectedSessionId && (
        <PixelModal
          isOpen={showRateHistory}
          onClose={() => {
            setShowRateHistory(false)
            setSelectedSessionId(null)
          }}
          title="产出率历史"
          size={isMobile ? "small" : "large"}
        >
          <SessionRateHistory
            sessionId={selectedSessionId}
            sessionInfo={(() => {
              const session = displaySessions.find((s: any) => 
                s.session_pk === selectedSessionId || s.id === selectedSessionId
              )
              return session ? {
                session_id: session.session_id,
                resource_type: session.resource_type || 'yld',
                land_id: session.land_id
              } : undefined
            })()}
            onClose={() => {
              setShowRateHistory(false)
              setSelectedSessionId(null)
            }}
            compact={isMobile}
          />
        </PixelModal>
      )}
    </div>
  )
}

export default MiningSessions
