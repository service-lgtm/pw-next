// src/app/mining/MiningSessions.tsx
// 挖矿会话管理组件 - 修复累计产出显示版本
// 
// 修复说明：
// 1. 修正了累计产出的计算逻辑
// 2. 根据实际API响应格式调整字段映射
// 3. 添加实时产出计算功能
// 
// API实际返回字段（从/mining/summary/接口）：
// - session.pending_output: 待收取产出（而不是total_output）
// - session.hours_worked: 已工作小时数
// - session.output_rate: 每小时产出率
// - session.hours_collected: 已收取的小时数
// - session.uncollected_hours: 未收取的小时数
//
// 累计产出计算公式：
// total_output = hours_worked * output_rate
//
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（挖矿主页面）
// - 使用 @/types/production 中的类型定义
// - 使用 @/hooks/useProduction 中的 Hook
// - 调用 @/lib/api/production 中的 API
// - 使用 @/components/shared 中的 UI 组件

'use client'

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { MiningPreCheck } from './MiningPreCheck'
import { SessionRateHistory } from './SessionRateHistory'
import { cn } from '@/lib/utils'
import type { 
  MiningSession, 
  Tool
} from '@/types/production'
import type { Land } from '@/types/assets'
import toast from 'react-hot-toast'
import { useStopAllSessions } from '@/hooks/useProduction'

interface MiningSessionsProps {
  sessions: MiningSession[] | null
  loading: boolean
  userLands: Land[] | null
  tools: Tool[] | null
  onStartMining: (landId: number, toolIds: number[]) => Promise<void>
  onStopSession: (sessionId: number) => Promise<void>
  onCollectOutput: (sessionId: number) => Promise<void>
  onBuyFood?: () => void
  onSynthesizeTool?: () => void
  startMiningLoading?: boolean
}

// ==================== 常量定义 ====================
const FOOD_CONSUMPTION_RATE = 2  // 每工具每小时消耗粮食
const DURABILITY_CONSUMPTION_RATE = 1  // 每工具每小时消耗耐久度
const MIN_COLLECT_HOURS = 1  // 最少收取小时数

// ==================== 工具函数 ====================

/**
 * 计算实时累计产出（毛收益）
 * 根据实际经过的时间和产出率计算
 * 注意：total_output 字段只在停止时更新，活跃会话需要实时计算
 */
const calculateTotalOutput = (session: any): number => {
  // 获取开始时间
  const startedAt = session.started_at
  if (!startedAt) return 0
  
  try {
    // 计算已经过去的时间（小时）
    const now = new Date()
    const startTime = new Date(startedAt)
    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    
    // 如果时间为负数（时间错误），返回0
    if (hoursElapsed < 0) return 0
    
    // 获取产出率
    const outputRate = session.output_rate || 0
    const rate = typeof outputRate === 'string' ? parseFloat(outputRate) : outputRate
    
    // 计算累计毛产出 = 产出率 × 经过的时间
    const grossOutput = rate * hoursElapsed
    
    // 返回毛产出（未扣税）
    return grossOutput
  } catch (error) {
    console.error('[calculateTotalOutput] Error:', error)
    
    // 如果计算失败，尝试使用备用方案
    const hoursWorked = session.hours_worked || session.total_hours || 0
    const outputRate = session.output_rate || 0
    
    const hours = typeof hoursWorked === 'string' ? parseFloat(hoursWorked) : hoursWorked
    const rate = typeof outputRate === 'string' ? parseFloat(outputRate) : outputRate
    
    return hours * rate
  }
}

/**
 * 计算净产出（扣税后）
 */
const calculateNetOutput = (session: any): number => {
  const grossOutput = calculateTotalOutput(session)
  const taxRate = getTaxRate(session)
  return grossOutput * (1 - taxRate)
}

/**
 * 获取会话开始时间
 */
const getSessionStartTime = (session: any): string => {
  return session.started_at || ''
}

/**
 * 获取会话工具数量
 */
const getSessionToolCount = (session: any): number => {
  // 优先使用 tool_count
  if (session.tool_count !== undefined) return session.tool_count
  
  // 然后检查 metadata
  if (session.metadata?.tool_count) return session.metadata.tool_count
  if (session.metadata?.tool_ids && Array.isArray(session.metadata.tool_ids)) {
    return session.metadata.tool_ids.length
  }
  
  return 0
}

/**
 * 获取会话粮食消耗
 */
const getSessionFoodConsumption = (session: any): number => {
  // 根据工具数量计算
  const toolCount = getSessionToolCount(session)
  return toolCount * FOOD_CONSUMPTION_RATE
}

/**
 * 获取土地信息
 */
const getLandInfo = (session: any): any => {
  return session.land || session.land_info || {}
}

/**
 * 获取会话状态
 */
const getSessionStatus = (session: any): string => {
  return session.status || 'active'
}

/**
 * 获取会话状态显示
 */
const getSessionStatusDisplay = (session: any): string => {
  return session.status_display || (session.status === 'active' ? '进行中' : '已结束')
}

/**
 * 获取资源类型
 */
const getResourceType = (session: any): string => {
  return session.resource_type || 'yld'
}

/**
 * 获取产出率
 */
const getOutputRate = (session: any): number => {
  const rate = session.output_rate || '0'
  return typeof rate === 'string' ? parseFloat(rate) : rate
}

/**
 * 获取税率
 */
const getTaxRate = (session: any): number => {
  const rate = session.metadata?.tax_rate ?? session.tax_rate ?? 0.05
  return typeof rate === 'string' ? parseFloat(rate) : rate
}

/**
 * 获取挖矿类型
 */
const getMiningType = (session: any): string => {
  return session.metadata?.mining_type || 'SELF_MINING'
}

/**
 * 获取工具耐久度
 */
const getToolDurability = (tool: Tool): number => {
  return tool.current_durability || 0
}

/**
 * 检查工具是否可用
 */
const isToolAvailable = (tool: Tool): boolean => {
  return tool.status === 'normal' && !tool.is_in_use && (tool.current_durability || 0) > 0
}

/**
 * 格式化持续时间
 */
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

/**
 * 格式化数字
 */
const formatNumber = (value: string | number | null | undefined, decimals: number = 4): string => {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  // 处理大数字，避免溢出
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
    // 小于1的数字，显示更多小数位
    return num.toFixed(Math.min(decimals, 6))
  }
}

/**
 * 计算可收取的小时数
 */
const calculateCollectableHours = (session: any): number => {
  // 使用 uncollected_hours 字段（如果存在）
  if (session.uncollected_hours !== undefined) {
    return Math.floor(session.uncollected_hours)
  }
  
  // 否则根据开始时间计算
  const startTime = getSessionStartTime(session)
  if (!startTime) return 0
  
  try {
    const start = new Date(startTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return Math.max(0, hours)
  } catch (error) {
    return 0
  }
}

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

// ==================== 会话卡片组件 ====================

/**
 * 移动端会话卡片
 */
const MobileSessionCard = memo(({ 
  session, 
  onCollect, 
  onStop,
  onViewHistory 
}: { 
  session: any
  onCollect: () => void
  onStop: () => void
  onViewHistory: () => void
}) => {
  // 使用状态来定期更新累计产出（每10秒更新一次）
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 10000) // 每10秒更新
    
    return () => clearInterval(interval)
  }, [])
  
  const landInfo = getLandInfo(session)
  const totalOutput = calculateTotalOutput(session)
  const netOutput = calculateNetOutput(session)
  const startTime = getSessionStartTime(session)
  const toolCount = getSessionToolCount(session)
  const foodConsumption = getSessionFoodConsumption(session)
  const outputRate = getOutputRate(session)
  const resourceType = getResourceType(session)
  const status = getSessionStatus(session)
  const statusDisplay = getSessionStatusDisplay(session)
  const taxRate = getTaxRate(session)
  
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm text-gold-500">
            {landInfo.land_id || `会话#${session.id}`}
          </p>
          <p className="text-[10px] text-gray-400">
            {landInfo.blueprint?.land_type_display || '未知类型'} 
            · {formatDuration(startTime)}
          </p>
        </div>
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[10px]",
          status === 'active' ? "bg-green-500/20 text-green-400" : 
          status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
          "bg-gray-500/20 text-gray-400"
        )}>
          {statusDisplay}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2 text-[11px]">
        <div>
          <p className="text-gray-500">毛产出</p>
          <p className="font-bold text-purple-400">{formatNumber(totalOutput, 4)}</p>
        </div>
        <div>
          <p className="text-gray-500">净产出</p>
          <p className="font-bold text-green-400">{formatNumber(netOutput, 4)}</p>
        </div>
        <div>
          <p className="text-gray-500">速率</p>
          <p className="font-bold text-yellow-400">{formatNumber(outputRate, 4)}/h</p>
        </div>
      </div>
      
      {/* 显示当前累计产出提示 */}
      <div className="flex items-center justify-between p-1.5 bg-blue-500/10 rounded text-[11px] mb-2">
        <span className="text-blue-400">实时累计（税率{(taxRate * 100).toFixed(0)}%）</span>
        <span className="font-bold text-blue-400">
          净收益: {formatNumber(netOutput, 4)} {resourceType.toUpperCase()}
        </span>
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
})

MobileSessionCard.displayName = 'MobileSessionCard'

/**
 * 桌面端会话卡片
 */
const DesktopSessionCard = memo(({ 
  session, 
  onCollect, 
  onStop,
  onViewHistory 
}: { 
  session: any
  onCollect: () => void
  onStop: () => void
  onViewHistory: () => void
}) => {
  // 使用状态来定期更新累计产出（每10秒更新一次）
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 10000) // 每10秒更新
    
    return () => clearInterval(interval)
  }, [])
  
  const landInfo = getLandInfo(session)
  const totalOutput = calculateTotalOutput(session)
  const netOutput = calculateNetOutput(session)
  const startTime = getSessionStartTime(session)
  const toolCount = getSessionToolCount(session)
  const foodConsumption = getSessionFoodConsumption(session)
  const outputRate = getOutputRate(session)
  const resourceType = getResourceType(session)
  const status = getSessionStatus(session)
  const statusDisplay = getSessionStatusDisplay(session)
  const taxRate = getTaxRate(session)
  const miningDuration = formatDuration(startTime)
  
  // 计算实际经过的小时数
  const hoursElapsed = startTime ? (Date.now() - new Date(startTime).getTime()) / (1000 * 60 * 60) : 0
  
  return (
    <PixelCard className="overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">
              {landInfo.land_id || `会话 #${session.id}`}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {landInfo.blueprint?.land_type_display || '未知类型'} 
              · {landInfo.region_name || '未知区域'}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs",
            status === 'active' ? "bg-green-500/20 text-green-400" :
            status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
            "bg-gray-500/20 text-gray-400"
          )}>
            {statusDisplay}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 产出信息 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">毛产出（未扣税）</p>
            <p className="font-bold text-purple-400 text-lg">{formatNumber(totalOutput, 6)}</p>
            <p className="text-xs text-gray-500">{resourceType.toUpperCase()}</p>
          </div>
          <div className="bg-green-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">净产出（扣税后）</p>
            <p className="font-bold text-green-400 text-lg">{formatNumber(netOutput, 6)}</p>
            <p className="text-xs text-gray-500">税率 {(taxRate * 100).toFixed(0)}%</p>
          </div>
        </div>
        
        {/* 详细信息 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">挖矿时长</p>
            <p className="font-bold text-blue-400">{miningDuration}</p>
            <p className="text-xs text-gray-500">({formatNumber(hoursElapsed, 2)}小时)</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">产出速率</p>
            <p className="font-bold text-yellow-400">{formatNumber(outputRate, 4)}/h</p>
            <p className="text-xs text-gray-500">{toolCount} 个工具</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">税费扣除</p>
            <p className="font-bold text-red-400">
              -{formatNumber(totalOutput * taxRate, 4)}
            </p>
            <p className="text-xs text-gray-500">{(taxRate * 100).toFixed(0)}% 税率</p>
          </div>
        </div>
        
        {/* 资源消耗 */}
        {foodConsumption > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
            <span className="text-xs text-yellow-400">🌾 粮食消耗</span>
            <span className="text-sm font-bold text-yellow-400">{foodConsumption}/小时</span>
          </div>
        )}
        
        {/* 累计产出提示 */}
        <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
          <span className="text-xs text-blue-400">💎 实时净收益</span>
          <span className="text-sm font-bold text-blue-400">
            {formatNumber(netOutput, 6)} {resourceType.toUpperCase()}
          </span>
        </div>
        
        {/* 调试信息（开发环境） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2 bg-gray-900/50 rounded text-xs text-gray-500">
            <p>调试信息：</p>
            <p>started_at: {session.started_at}</p>
            <p>实际经过: {formatNumber(hoursElapsed, 4)} 小时</p>
            <p>output_rate: {session.output_rate}</p>
            <p>毛产出: {formatNumber(totalOutput, 6)}</p>
            <p>净产出: {formatNumber(netOutput, 6)}</p>
            <p>total_output字段: {session.total_output || '0'}</p>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            variant="primary"
            onClick={onStop}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>💰</span>
              <span>结束挖矿</span>
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

DesktopSessionCard.displayName = 'DesktopSessionCard'

// ==================== 主组件 ====================

/**
 * 挖矿会话管理组件
 */
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
  startMiningLoading = false
}: MiningSessionsProps) {
  // 状态管理
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
  
  // 批量停止功能
  const { stopAll, loading: stopAllLoading } = useStopAllSessions()
  
  // 表单验证状态
  const [landError, setLandError] = useState('')
  const [toolsError, setToolsError] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  
  // 资源预检查状态
  const [resourceWarning, setResourceWarning] = useState('')
  
  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 重置错误状态
  useEffect(() => {
    if (selectedLand) setLandError('')
    if (selectedTools.length > 0) setToolsError('')
  }, [selectedLand, selectedTools])
  
  // 可用工具
  const availableTools = useMemo(() => 
    tools?.filter(t => isToolAvailable(t)) || [],
    [tools]
  )
  
  // 统计数据 - 使用实时计算
  const { totalOutput, totalNetOutput, totalHourlyOutput } = useMemo(() => {
    if (!sessions) return { totalOutput: 0, totalNetOutput: 0, totalHourlyOutput: 0 }
    
    const total = sessions.reduce((sum, session) => {
      const output = calculateTotalOutput(session)
      return sum + output
    }, 0)
    
    const netTotal = sessions.reduce((sum, session) => {
      const netOutput = calculateNetOutput(session)
      return sum + netOutput
    }, 0)
    
    const hourly = sessions.reduce((sum, session) => sum + getOutputRate(session), 0)
    
    return { totalOutput: total, totalNetOutput: netTotal, totalHourlyOutput: hourly }
  }, [sessions])
  
  // 添加定时器来刷新数据
  useEffect(() => {
    if (!sessions || sessions.length === 0) return
    
    // 每30秒刷新一次累计产出显示
    const refreshInterval = setInterval(() => {
      // 强制组件重新渲染以更新时间相关的计算
      setIsMobile(prev => prev)
    }, 30000)
    
    return () => clearInterval(refreshInterval)
  }, [sessions])
  
  // ==================== 事件处理函数 ====================
  
  /**
   * 打开开始挖矿模态框
   */
  const handleOpenStartModal = useCallback(() => {
    setShowPreCheck(true)
  }, [])
  
  /**
   * 预检查通过后继续
   */
  const handlePreCheckProceed = useCallback(() => {
    setShowPreCheck(false)
    setShowStartModal(true)
    setSelectedLand(null)
    setSelectedTools([])
    setShowErrors(false)
    setLandError('')
    setToolsError('')
    setResourceWarning('')
  }, [])
  
  /**
   * 验证表单
   */
  const validateForm = useCallback(() => {
    let isValid = true
    
    if (!selectedLand) {
      setLandError('请选择一块土地')
      isValid = false
    }
    
    if (selectedTools.length === 0) {
      setToolsError('请至少选择一个工具')
      isValid = false
    }
    
    return isValid
  }, [selectedLand, selectedTools])
  
  /**
   * 确认开始挖矿
   */
  const handleConfirmStart = useCallback(() => {
    setShowErrors(true)
    
    if (!validateForm()) {
      const errors = []
      if (!selectedLand) errors.push('土地')
      if (selectedTools.length === 0) errors.push('工具')
      
      toast.error(`请选择${errors.join('和')}后再开始挖矿`, {
        duration: 3000,
        position: 'top-center',
        icon: '⚠️'
      })
      return
    }
    
    // 资源预检查
    let warning = ''
    
    // 检查工具耐久度
    const selectedToolObjects = availableTools.filter(t => selectedTools.includes(t.id))
    const lowDurabilityTools = selectedToolObjects.filter(t => getToolDurability(t) < 100)
    
    if (lowDurabilityTools.length > 0) {
      warning = `有 ${lowDurabilityTools.length} 个工具耐久度低于100，可能很快需要维修`
    }
    
    setResourceWarning(warning)
    setConfirmAction('start')
    setShowConfirmModal(true)
  }, [selectedLand, selectedTools, validateForm, availableTools])
  
  /**
   * 执行开始挖矿
   */
  const handleExecuteStart = useCallback(async () => {
    if (!selectedLand || selectedTools.length === 0) return
    
    try {
      await onStartMining(selectedLand.id, selectedTools)
      
      toast.success('挖矿已开始！', {
        duration: 3000,
        position: 'top-center',
        icon: '⛏️'
      })
      
      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
      setShowErrors(false)
    } catch (err: any) {
      console.error('开始挖矿失败:', err)
      
      let errorMessage = '开始挖矿失败'
      let errorIcon = '❌'
      let bgColor = '#dc2626'
      
      const errorDetail = err?.response?.data?.message || err?.response?.data?.detail || err?.message
      
      if (errorDetail) {
        if (errorDetail.includes('粮食不足') || errorDetail.includes('food')) {
          errorMessage = '粮食储备不足，请先补充粮食'
          errorIcon = '🌾'
          bgColor = '#f59e0b'
          
          const data = err?.response?.data?.data
          if (data?.current_food !== undefined && data?.food_needed !== undefined) {
            errorMessage = `粮食不足！当前：${data.current_food}，需要：${data.food_needed}`
          }
        }
        else if (errorDetail.includes('工具已被使用') || errorDetail.includes('in use')) {
          errorMessage = '选中的工具已在使用中，请选择其他工具'
          errorIcon = '🔧'
        }
        else if (errorDetail.includes('土地') && errorDetail.includes('占用')) {
          errorMessage = '该土地已被占用，请选择其他土地'
          errorIcon = '📍'
        }
        else {
          errorMessage = errorDetail
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
        icon: errorIcon,
        style: {
          background: bgColor,
          color: '#fff',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 20px'
        }
      })
      
      if (errorMessage.includes('粮食') || errorMessage.includes('工具已被使用')) {
        setShowConfirmModal(false)
        setConfirmAction(null)
      }
    }
  }, [selectedLand, selectedTools, onStartMining])
  
  /**
   * 确认停止会话
   */
  const handleConfirmStop = useCallback((sessionId: number) => {
    setTargetSessionId(sessionId)
    setConfirmAction('stop')
    setShowConfirmModal(true)
  }, [])
  
  /**
   * 执行停止会话（包含自动结算）
   */
  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return
    
    try {
      await onStopSession(targetSessionId)
      
      toast.success('挖矿已结束，产出已自动收取！', {
        duration: 3000,
        position: 'top-center',
        icon: '💰'
      })
      
      setShowConfirmModal(false)
      setTargetSessionId(null)
      setConfirmAction(null)
    } catch (err: any) {
      console.error('停止生产失败:', err)
      
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.detail || 
                          err?.message || 
                          '停止生产失败'
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '❌'
      })
    }
  }, [targetSessionId, onStopSession])
  
  /**
   * 批量停止所有会话
   */
  const handleStopAll = useCallback(async () => {
    try {
      const result = await stopAll()
      
      setShowConfirmModal(false)
      setConfirmAction(null)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('批量停止失败:', error)
    }
  }, [stopAll])
  
  /**
   * 收取产出
   */
  const handleCollectOutput = useCallback(async (sessionId: number) => {
    try {
      await onCollectOutput(sessionId)
      
      toast.success('收取成功！', {
        duration: 3000,
        position: 'top-center',
        icon: '💰'
      })
    } catch (err: any) {
      console.error('收取失败:', err)
      
      let errorMessage = '收取产出失败'
      let errorIcon = '❌'
      
      const errorDetail = err?.response?.data?.message || 
                         err?.response?.data?.detail || 
                         err?.message
      
      if (errorDetail) {
        if (errorDetail.includes('1小时') || errorDetail.includes('满1小时')) {
          const data = err?.response?.data?.data
          if (data?.minutes_to_wait) {
            errorMessage = `需要挖矿满1小时才能收取，还需等待 ${data.minutes_to_wait} 分钟`
          } else {
            errorMessage = '需要挖矿满1小时才能收取'
          }
          errorIcon = '⏰'
        }
        else if (errorDetail.includes('没有可收取') || errorDetail.includes('no output')) {
          errorMessage = '当前没有可收取的产出'
          errorIcon = '📦'
        }
        else if (errorDetail.includes('会话已结束') || errorDetail.includes('ended')) {
          errorMessage = '该挖矿会话已结束'
          errorIcon = '⏹️'
        }
        else {
          errorMessage = errorDetail
        }
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: errorIcon
      })
    }
  }, [onCollectOutput])
  
  /**
   * 查看产出率历史
   */
  const handleViewHistory = useCallback((sessionId: number) => {
    setSelectedSessionId(sessionId)
    setShowRateHistory(true)
  }, [])
  
  // ==================== 渲染 ====================
  
  return (
    <div className="space-y-4">
      {/* 标题栏和统计 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold">活跃挖矿会话</h3>
          {sessions && sessions.length > 0 && (
            <div className="flex gap-4 mt-1">
              <p className="text-sm text-gray-400">共 {sessions.length} 个</p>
              <p className="text-sm text-purple-400">毛产出: {formatNumber(totalOutput, 4)}</p>
              <p className="text-sm text-green-400">净收益: {formatNumber(totalNetOutput, 4)}</p>
              <p className="text-sm text-yellow-400">速率: {formatNumber(totalHourlyOutput, 4)}/h</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {sessions && sessions.length > 0 && (
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
      
      {/* 会话列表 */}
      {loading ? (
        <PixelCard className="text-center py-8">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-gray-400 mt-2">加载中...</p>
        </PixelCard>
      ) : sessions && sessions.length > 0 ? (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {sessions.map((session) => (
            isMobile ? (
              <MobileSessionCard
                key={session.id}
                session={session}
                onCollect={() => handleCollectOutput(session.id)}
                onStop={() => handleConfirmStop(session.id)}
                onViewHistory={() => handleViewHistory(session.id)}
              />
            ) : (
              <DesktopSessionCard
                key={session.id}
                session={session}
                onCollect={() => handleCollectOutput(session.id)}
                onStop={() => handleConfirmStop(session.id)}
                onViewHistory={() => handleViewHistory(session.id)}
              />
            )
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
      
      {/* 挖矿预检查模态框 */}
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
      
      {/* 产出率历史模态框 */}
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
            sessionInfo={sessions?.find(s => s.id === selectedSessionId) ? {
              session_id: sessions.find(s => s.id === selectedSessionId)!.session_id,
              resource_type: getResourceType(sessions.find(s => s.id === selectedSessionId)!),
              land_id: getLandInfo(sessions.find(s => s.id === selectedSessionId)!).land_id
            } : undefined}
            onClose={() => {
              setShowRateHistory(false)
              setSelectedSessionId(null)
            }}
            compact={isMobile}
          />
        </PixelModal>
      )}
      
      {/* 开始挖矿模态框 - 保持原有代码不变 */}
      <PixelModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          setSelectedLand(null)
          setSelectedTools([])
          setShowErrors(false)
        }}
        title="开始自主挖矿"
        size={isMobile ? "small" : "medium"}
      >
        <div className="space-y-4">
          {/* 重要提示 */}
          <div className="p-3 bg-red-900/20 border border-red-500/40 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-400 font-bold mb-2">重要提示</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• 挖矿开始后，<span className="text-red-400 font-bold">1小时内停止将按完整1小时扣除</span></li>
                  <li>• 每个工具每小时消耗 {FOOD_CONSUMPTION_RATE} 单位粮食</li>
                  <li>• 每个工具每小时消耗 {DURABILITY_CONSUMPTION_RATE} 点耐久度</li>
                  <li>• 请确保有足够的粮食储备再开始挖矿</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 选择土地 */}
          <div>
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-2">
              <span>📍</span>
              <span>选择土地</span>
            </label>
            {userLands && userLands.length > 0 ? (
              <CustomDropdown
                lands={userLands}
                selectedLand={selectedLand}
                onSelect={setSelectedLand}
                error={landError}
                showError={showErrors}
              />
            ) : (
              <p className="text-sm text-gray-400 p-3 bg-gray-800/50 rounded-lg text-center">
                您还没有土地，请先购买土地
              </p>
            )}
          </div>
          
          {/* 选择工具 */}
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
              <>
                <div className={cn(
                  "border rounded-lg overflow-hidden",
                  showErrors && toolsError ? "border-red-500" : "border-gray-600"
                )}>
                  <div className="max-h-48 overflow-y-auto bg-gray-800/30">
                    {availableTools.map((tool, index) => (
                      <label 
                        key={tool.id} 
                        className={cn(
                          "flex items-center gap-3 p-3 cursor-pointer transition-all",
                          "hover:bg-gray-700/50",
                          selectedTools.includes(tool.id) ? "bg-gray-700/70" : "",
                          index !== 0 && "border-t border-gray-700"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(tool.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTools([...selectedTools, tool.id])
                            } else {
                              setSelectedTools(selectedTools.filter(id => id !== tool.id))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-600 text-gold-500"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{tool.tool_id}</p>
                            <p className="text-xs text-gray-400">{tool.tool_type_display}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">耐久度</div>
                            <div className="text-xs">
                              <span className={cn(
                                getToolDurability(tool) < 100 ? "text-red-400" :
                                getToolDurability(tool) < 500 ? "text-yellow-400" :
                                "text-green-400"
                              )}>
                                {getToolDurability(tool)}
                              </span>
                              <span className="text-gray-500">/{tool.max_durability || 1500}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="p-2 bg-gray-800/50 border-t border-gray-700">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTools(availableTools.map(t => t.id))}
                        className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        全选
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTools([])}
                        className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                </div>
                {showErrors && toolsError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span>❌</span>
                    <span>{toolsError}</span>
                  </p>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                <p className="text-sm text-gray-400">暂无可用工具</p>
                <p className="text-xs text-gray-500 mt-1">
                  请先在"合成系统"中制作工具
                </p>
              </div>
            )}
          </div>
          
          {/* 预计消耗 */}
          {selectedLand && selectedTools.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400 font-bold mb-3 flex items-center gap-2">
                <span>📊</span>
                <span>预计消耗（每小时）</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">⚙️ 耐久</span>
                    <span className="text-sm font-bold text-yellow-400">
                      {selectedTools.length * DURABILITY_CONSUMPTION_RATE} 点/工具
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">🌾 粮食</span>
                    <span className="text-sm font-bold text-yellow-400">
                      {selectedTools.length * FOOD_CONSUMPTION_RATE} 单位
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 实际消耗根据土地类型和工具效率会有所不同
              </p>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <PixelButton
              className="flex-1"
              onClick={handleConfirmStart}
              disabled={startMiningLoading}
            >
              {startMiningLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>开始中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✅</span>
                  <span>确认开始</span>
                </span>
              )}
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={() => {
                setShowStartModal(false)
                setSelectedLand(null)
                setSelectedTools([])
                setShowErrors(false)
              }}
            >
              取消
            </PixelButton>
          </div>
        </div>
      </PixelModal>
      
      {/* 确认对话框 - 保持原有代码不变 */}
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
          {confirmAction === 'start' ? (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要开始挖矿吗？
                </p>
                <p className="text-xs text-red-400 font-bold">
                  开始后1小时内停止将扣除完整1小时的资源
                </p>
              </div>
              
              {/* 资源警告 */}
              {resourceWarning && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">⚠️</span>
                    <p className="text-xs text-yellow-400 flex-1">
                      {resourceWarning}
                    </p>
                  </div>
                </div>
              )}
              
              {/* 挖矿信息 */}
              <div className="bg-gray-800 rounded p-3 text-xs">
                <p className="text-gray-400 mb-2">挖矿信息：</p>
                <div className="space-y-1">
                  <p>土地：{selectedLand?.land_id}</p>
                  <p>类型：{selectedLand?.blueprint?.land_type_display || selectedLand?.land_type_display || '未知'}</p>
                  <p>工具数量：{selectedTools.length} 个</p>
                  <p>预计粮食消耗：{selectedTools.length * FOOD_CONSUMPTION_RATE} 单位/小时</p>
                  <p>预计耐久消耗：{selectedTools.length * DURABILITY_CONSUMPTION_RATE} 点/小时</p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-yellow-400">
                    💡 建议准备至少 {selectedTools.length * FOOD_CONSUMPTION_RATE * 2} 单位粮食（2小时用量）
                  </p>
                </div>
              </div>
            </>
          ) : confirmAction === 'stopAll' ? (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束所有挖矿会话吗？
                </p>
                <p className="text-xs text-green-400">
                  将结束 {sessions?.length || 0} 个会话并自动收取所有产出
                </p>
              </div>
              
              {/* 批量结束说明 */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                <p className="text-xs text-blue-400">
                  💡 批量结束将：
                </p>
                <ul className="text-xs text-gray-300 mt-1 space-y-1">
                  <li>• 自动收取所有会话的累计产出</li>
                  <li>• 释放所有正在使用的工具</li>
                  <li>• 停止所有粮食消耗</li>
                  <li>• 不足1小时的会话仍按1小时扣除资源</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要结束挖矿吗？
                </p>
                <p className="text-xs text-green-400">
                  结束后将自动收取所有累计产出
                </p>
              </div>
              
              {/* 结束挖矿说明 */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                <p className="text-xs text-blue-400">
                  💡 结束挖矿将：
                </p>
                <ul className="text-xs text-gray-300 mt-1 space-y-1">
                  <li>• 自动收取所有累计产出到您的账户</li>
                  <li>• 释放正在使用的工具</li>
                  <li>• 停止粮食消耗</li>
                  <li>• 注意：不足1小时仍按1小时扣除资源</li>
                </ul>
              </div>
              
              {/* 会话信息 */}
              {targetSessionId && sessions && (
                (() => {
                  const session = sessions.find(s => s.id === targetSessionId)
                  if (!session) return null
                  
                  const startTime = getSessionStartTime(session)
                  const duration = formatDuration(startTime)
                  const totalOutput = calculateTotalOutput(session)
                  const netOutput = calculateNetOutput(session)
                  const resourceType = getResourceType(session)
                  const landInfo = getLandInfo(session)
                  
                  return (
                    <div className="bg-gray-800 rounded p-3 text-xs">
                      <p className="text-gray-400 mb-2">会话信息：</p>
                      <div className="space-y-1">
                        <p>土地：{landInfo.land_id || '未知'}</p>
                        <p>运行时长：{duration}</p>
                        <p className="text-purple-400">
                          毛产出：{formatNumber(totalOutput, 4)} {resourceType.toUpperCase()}
                        </p>
                        <p className="text-green-400 font-bold">
                          将收取净收益：{formatNumber(netOutput, 4)} {resourceType.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )
                })()
              )}
            </>
          )}
          
          {/* 按钮 */}
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
              {confirmAction === 'stopAll' && stopAllLoading ? (
                '处理中...'
              ) : (
                `确认${confirmAction === 'start' ? '开始' : '结束'}`
              )}
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
    </div>
  )
}

export default MiningSessions
