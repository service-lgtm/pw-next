// src/app/mining/MiningSessions.tsx
// 挖矿会话管理组件 - 生产级完整版本
// 
// 功能说明：
// 1. 管理用户的挖矿会话（开始、停止、收取）
// 2. 支持自主挖矿、带工具打工、无工具打工
// 3. 完善的错误处理和用户提示
// 4. 兼容多种API响应格式
// 5. 移动端和桌面端自适应
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用（挖矿主页面）
// - 使用 @/types/production 中的类型定义
// - 使用 @/hooks/useProduction 中的 Hook
// - 调用 @/lib/api/production 中的 API
// - 使用 @/components/shared 中的 UI 组件
// - 后端接口：/production/sessions/, /production/mining/self/start/ 等
//
// 更新历史：
// - 2024-12: 完善错误处理，添加详细的错误提示
// - 2024-12: 处理字段兼容性问题
// - 2024-12: 优化移动端交互体验

'use client'

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import { PixelCard } from '@/components/shared/PixelCard'
import { PixelButton } from '@/components/shared/PixelButton'
import { PixelModal } from '@/components/shared/PixelModal'
import { cn } from '@/lib/utils'
import type { 
  MiningSession, 
  Tool,
  getSessionTotalOutput,
  getSessionStartTime,
  getSessionToolCount,
  getSessionFoodConsumption,
  getToolDurability,
  isToolAvailable
} from '@/types/production'
import type { Land } from '@/types/assets'
import toast from 'react-hot-toast'

// 导入辅助函数
import {
  getSessionTotalOutput as getTotalOutput,
  getSessionStartTime as getStartTime,
  getSessionToolCount as getToolCount,
  getSessionFoodConsumption as getFoodConsumption,
  getToolDurability as getDurability,
  isToolAvailable as checkToolAvailable
} from '@/types/production'

interface MiningSessionsProps {
  sessions: MiningSession[] | null
  loading: boolean
  userLands: Land[] | null
  tools: Tool[] | null
  onStartMining: (landId: number, toolIds: number[]) => Promise<void>
  onStopSession: (sessionId: number) => Promise<void>
  onCollectOutput: (sessionId: number) => Promise<void>
  startMiningLoading?: boolean
}

// ==================== 常量定义 ====================
const FOOD_CONSUMPTION_RATE = 2  // 每工具每小时消耗粮食
const DURABILITY_CONSUMPTION_RATE = 1  // 每工具每小时消耗耐久度
const MIN_COLLECT_HOURS = 1  // 最少收取小时数

// ==================== 工具函数 ====================

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
  return num.toFixed(decimals)
}

/**
 * 计算可收取的小时数
 */
const calculateCollectableHours = (startTime: string): number => {
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
  
  // 点击外部关闭
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
  onStop 
}: { 
  session: MiningSession
  onCollect: () => void
  onStop: () => void
}) => {
  const totalOutput = getTotalOutput(session)
  const startTime = getStartTime(session)
  const toolCount = getToolCount(session)
  const foodConsumption = getFoodConsumption(session)
  const collectableHours = calculateCollectableHours(startTime)
  const canCollect = collectableHours >= MIN_COLLECT_HOURS || (session.current_output && session.current_output > 0)
  
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm text-gold-500">
            {session.land_info?.land_id || `会话#${session.id}`}
          </p>
          <p className="text-[10px] text-gray-400">
            {session.land_info?.region_name || session.land_info?.region || '未知区域'} 
            · {formatDuration(startTime)}
          </p>
        </div>
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[10px]",
          session.status === 'active' ? "bg-green-500/20 text-green-400" : 
          session.status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
          "bg-gray-500/20 text-gray-400"
        )}>
          {session.status_display || '生产中'}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2 text-[11px]">
        <div>
          <p className="text-gray-500">累计</p>
          <p className="font-bold text-purple-400">{formatNumber(totalOutput, 2)}</p>
        </div>
        <div>
          <p className="text-gray-500">速率</p>
          <p className="font-bold text-green-400">{formatNumber(session.output_rate, 1)}/h</p>
        </div>
        <div>
          <p className="text-gray-500">工具</p>
          <p className="font-bold text-yellow-400">{toolCount}个</p>
        </div>
      </div>
      
      {canCollect && (
        <div className="flex items-center justify-between p-1.5 bg-gold-500/10 rounded text-[11px] mb-2">
          <span className="text-gold-400">可收取</span>
          <span className="font-bold text-gold-400">
            {session.current_output ? formatNumber(session.current_output, 2) : `${collectableHours}小时产出`}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-1.5">
        <PixelButton
          size="xs"
          onClick={onCollect}
          disabled={!canCollect}
          className="text-[11px]"
        >
          收取
        </PixelButton>
        <PixelButton
          size="xs"
          variant="secondary"
          onClick={onStop}
          className="text-[11px]"
        >
          停止
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
  onStop 
}: { 
  session: MiningSession
  onCollect: () => void
  onStop: () => void
}) => {
  const totalOutput = getTotalOutput(session)
  const startTime = getStartTime(session)
  const toolCount = getToolCount(session)
  const foodConsumption = getFoodConsumption(session)
  const collectableHours = calculateCollectableHours(startTime)
  const canCollect = collectableHours >= MIN_COLLECT_HOURS || (session.current_output && session.current_output > 0)
  
  const taxRate = session.metadata?.tax_rate ?? session.tax_rate ?? 0.05
  const miningDuration = formatDuration(startTime)
  
  return (
    <PixelCard className="overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-gold-500">
              {session.land_info?.land_id || `会话 #${session.id}`}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {session.land_info?.land_type_display || session.land_info?.land_type || '未知类型'} 
              · {session.land_info?.region_name || session.land_info?.region || '未知区域'}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs",
            session.status === 'active' ? "bg-green-500/20 text-green-400" :
            session.status === 'paused' ? "bg-yellow-500/20 text-yellow-400" :
            "bg-gray-500/20 text-gray-400"
          )}>
            {session.status_display || (session.status === 'active' ? '生产中' : '已结束')}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 产出信息 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">累计产出</p>
            <p className="font-bold text-purple-400 text-lg">{formatNumber(totalOutput)}</p>
            <p className="text-xs text-gray-500">{session.resource_type || 'YLD'}</p>
          </div>
          <div className="bg-green-900/20 rounded p-2">
            <p className="text-gray-400 text-xs">产出速率</p>
            <p className="font-bold text-green-400 text-lg">{formatNumber(session.output_rate, 2)}</p>
            <p className="text-xs text-gray-500">每小时</p>
          </div>
        </div>
        
        {/* 详细信息 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">挖矿时长</p>
            <p className="font-bold text-blue-400">{miningDuration}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">工具数量</p>
            <p className="font-bold text-yellow-400">{toolCount} 个</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">税率</p>
            <p className="font-bold text-red-400">
              {typeof taxRate === 'number' ? (taxRate * 100).toFixed(0) : parseFloat(taxRate) * 100}%
            </p>
          </div>
        </div>
        
        {/* 资源消耗 */}
        {foodConsumption > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
            <span className="text-xs text-yellow-400">🌾 粮食消耗</span>
            <span className="text-sm font-bold text-yellow-400">{foodConsumption}/小时</span>
          </div>
        )}
        
        {/* 可收取提示 */}
        {canCollect && (
          <div className="flex items-center justify-between p-2 bg-gold-500/10 rounded">
            <span className="text-xs text-gold-400">💰 可收取</span>
            <span className="text-sm font-bold text-gold-400">
              {session.current_output ? 
                `${formatNumber(session.current_output)} ${session.resource_type || 'YLD'}` : 
                `${collectableHours} 小时产出`}
            </span>
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            size="sm"
            onClick={onCollect}
            className="w-full"
            disabled={!canCollect}
          >
            <span className="flex items-center justify-center gap-1">
              <span>📦</span>
              <span>收取产出</span>
            </span>
          </PixelButton>
          <PixelButton
            size="sm"
            variant="secondary"
            onClick={onStop}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-1">
              <span>⏹️</span>
              <span>停止生产</span>
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
  startMiningLoading = false
}: MiningSessionsProps) {
  // 状态管理
  const [showStartModal, setShowStartModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [confirmAction, setConfirmAction] = useState<'start' | 'stop' | null>(null)
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
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
    tools?.filter(t => checkToolAvailable(t)) || [],
    [tools]
  )
  
  // 统计数据
  const { totalOutput, totalHourlyOutput } = useMemo(() => {
    if (!sessions) return { totalOutput: 0, totalHourlyOutput: 0 }
    
    const total = sessions.reduce((sum, session) => sum + getTotalOutput(session), 0)
    const hourly = sessions.reduce((sum, session) => {
      const rate = parseFloat(session.output_rate || '0')
      return sum + rate
    }, 0)
    
    return { totalOutput: total, totalHourlyOutput: hourly }
  }, [sessions])
  
  // ==================== 事件处理函数 ====================
  
  /**
   * 打开开始挖矿模态框
   */
  const handleOpenStartModal = useCallback(() => {
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
    const lowDurabilityTools = selectedToolObjects.filter(t => getDurability(t) < 100)
    
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
      
      // 成功提示
      toast.success('挖矿已开始！', {
        duration: 3000,
        position: 'top-center',
        icon: '⛏️'
      })
      
      // 关闭模态框并重置状态
      setShowStartModal(false)
      setShowConfirmModal(false)
      setSelectedLand(null)
      setSelectedTools([])
      setConfirmAction(null)
      setShowErrors(false)
    } catch (err: any) {
      console.error('开始挖矿失败:', err)
      
      // 解析错误信息
      let errorMessage = '开始挖矿失败'
      let errorIcon = '❌'
      let bgColor = '#dc2626'
      
      // 根据错误类型显示不同提示
      const errorDetail = err?.response?.data?.message || err?.response?.data?.detail || err?.message
      
      if (errorDetail) {
        // 粮食不足
        if (errorDetail.includes('粮食不足') || errorDetail.includes('food')) {
          errorMessage = '粮食储备不足，请先补充粮食'
          errorIcon = '🌾'
          bgColor = '#f59e0b'
          
          // 如果有具体数量信息
          const data = err?.response?.data?.data
          if (data?.current_food !== undefined && data?.food_needed !== undefined) {
            errorMessage = `粮食不足！当前：${data.current_food}，需要：${data.food_needed}`
          }
        }
        // 工具已被使用
        else if (errorDetail.includes('工具已被使用') || errorDetail.includes('in use')) {
          errorMessage = '选中的工具已在使用中，请选择其他工具'
          errorIcon = '🔧'
        }
        // 土地已被占用
        else if (errorDetail.includes('土地') && errorDetail.includes('占用')) {
          errorMessage = '该土地已被占用，请选择其他土地'
          errorIcon = '📍'
        }
        // 其他错误
        else {
          errorMessage = errorDetail
        }
      }
      
      // 显示错误提示
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
      
      // 如果是关键错误，关闭确认对话框
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
   * 执行停止会话
   */
  const handleExecuteStop = useCallback(async () => {
    if (!targetSessionId) return
    
    try {
      await onStopSession(targetSessionId)
      
      toast.success('生产已停止', {
        duration: 3000,
        position: 'top-center',
        icon: '⏹️'
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
      
      // 解析错误信息
      let errorMessage = '收取产出失败'
      let errorIcon = '❌'
      
      const errorDetail = err?.response?.data?.message || 
                         err?.response?.data?.detail || 
                         err?.message
      
      if (errorDetail) {
        // 时间不足
        if (errorDetail.includes('1小时') || errorDetail.includes('满1小时')) {
          const data = err?.response?.data?.data
          if (data?.minutes_to_wait) {
            errorMessage = `需要挖矿满1小时才能收取，还需等待 ${data.minutes_to_wait} 分钟`
          } else {
            errorMessage = '需要挖矿满1小时才能收取'
          }
          errorIcon = '⏰'
        }
        // 没有可收取的产出
        else if (errorDetail.includes('没有可收取') || errorDetail.includes('no output')) {
          errorMessage = '当前没有可收取的产出'
          errorIcon = '📦'
        }
        // 会话已结束
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
              <p className="text-sm text-purple-400">累计: {formatNumber(totalOutput, 2)}</p>
              <p className="text-sm text-green-400">速率: {formatNumber(totalHourlyOutput, 1)}/h</p>
            </div>
          )}
        </div>
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
              />
            ) : (
              <DesktopSessionCard
                key={session.id}
                session={session}
                onCollect={() => handleCollectOutput(session.id)}
                onStop={() => handleConfirmStop(session.id)}
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
      
      {/* 开始挖矿模态框 */}
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
                                getDurability(tool) < 100 ? "text-red-400" :
                                getDurability(tool) < 500 ? "text-yellow-400" :
                                "text-green-400"
                              )}>
                                {getDurability(tool)}
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
      
      {/* 确认对话框 */}
      <PixelModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setTargetSessionId(null)
        }}
        title={confirmAction === 'start' ? '确认开始挖矿' : '确认停止生产'}
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
          ) : (
            <>
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🛑</div>
                <p className="text-sm text-gray-300 mb-2">
                  您确定要停止这个生产会话吗？
                </p>
                <p className="text-xs text-yellow-400">
                  停止后可以收取累计的产出
                </p>
              </div>
              
              {/* 停止警告 */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <p className="text-xs text-yellow-400">
                  ⚠️ 如果挖矿时间不足1小时，仍会扣除1小时的耐久和粮食
                </p>
              </div>
              
              {/* 会话信息 */}
              {targetSessionId && sessions && (
                (() => {
                  const session = sessions.find(s => s.id === targetSessionId)
                  if (!session) return null
                  
                  const startTime = getStartTime(session)
                  const duration = formatDuration(startTime)
                  const totalOutput = getTotalOutput(session)
                  
                  return (
                    <div className="bg-gray-800 rounded p-3 text-xs">
                      <p className="text-gray-400 mb-2">会话信息：</p>
                      <div className="space-y-1">
                        <p>土地：{session.land_info?.land_id || '未知'}</p>
                        <p>运行时长：{duration}</p>
                        <p>累计产出：{formatNumber(totalOutput, 2)} {session.resource_type || 'YLD'}</p>
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
              variant={confirmAction === 'stop' ? 'secondary' : 'primary'}
              onClick={confirmAction === 'start' ? handleExecuteStart : handleExecuteStop}
            >
              确认{confirmAction === 'start' ? '开始' : '停止'}
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
