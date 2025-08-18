// src/app/mining/AutoRefreshSystem.tsx
// 自动刷新监控系统 - 完全修复版
// 
// 文件说明：
// 监控挖矿系统状态并自动刷新，支持新算法v2的整点结算监控
// 
// 修复历史：
// - 2025-01-18: 修复 toast.warning 不存在的问题
// - 2025-01-18: 修复 YLD 状态数据处理，确保正确显示 percentage_used
// - 2025-01-18: 优化数据结构处理，兼容 API 返回的 data 字段
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 从 @/hooks/useProduction 获取 YLD 状态数据
// - 调用 /api/v1/production/yld/status/ 接口

'use client'

import { useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { MiningSession, Tool } from '@/types/production'

interface AutoRefreshSystemProps {
  enabled: boolean
  sessions: MiningSession[] | null
  tools: Tool[] | null
  grainStatus: any
  miningSummary: any
  yldStatus: any
  onRefreshSessions?: () => void
  onRefreshTools?: () => void
  onRefreshResources?: () => void
  onRefreshSummary?: () => void
  onRefreshPending?: () => void
  onRefreshYLDStatus?: () => void  // 新增：刷新 YLD 状态
  config?: {
    sessionCheckInterval?: number
    resourceCheckInterval?: number
    grainWarningThreshold?: number
    durabilityWarningThreshold?: number
    enableNotifications?: boolean
    enableAutoCollect?: boolean
    enableHourlySettlementAlert?: boolean
    pendingRewardsThreshold?: number
    yldWarningThreshold?: number  // 新增：YLD 警告阈值
  }
  onGrainLow?: (hours: number) => void
  onToolDamaged?: (tool: Tool) => void
  onSessionComplete?: (session: MiningSession) => void
  onYLDExhausted?: () => void
  onPendingRewardsHigh?: (amount: number) => void
  onHourlySettlement?: () => void
}


/**
 * 获取距离下一个整点的毫秒数
 */
const getMillisecondsToNextHour = (): number => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour.getTime() - now.getTime()
}

/**
 * 判断是否刚过整点（1分钟内）
 */
const isJustPastHour = (): boolean => {
  const minutes = new Date().getMinutes()
  return minutes >= 0 && minutes <= 1
}

/**
 * 格式化数字
 */
const formatNumber = (value: number | undefined | null, decimals: number = 4): string => {
  if (value == null || isNaN(value)) return '0'
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  } else {
    return value.toFixed(decimals)
  }
}

/**
 * 自动刷新监控系统组件
 */
export function AutoRefreshSystem({
  enabled,
  sessions,
  tools,
  grainStatus,
  miningSummary,
  yldStatus,
  onRefreshSessions,
  onRefreshTools,
  onRefreshResources,
  onRefreshSummary,
  onRefreshPending,
  onRefreshYLDStatus,
  config = {},
  onGrainLow,
  onToolDamaged,
  onSessionComplete,
  onYLDExhausted,
  onPendingRewardsHigh,
  onHourlySettlement
}: AutoRefreshSystemProps) {
  const {
    sessionCheckInterval = 30000,
    resourceCheckInterval = 60000,
    grainWarningThreshold = 2,
    durabilityWarningThreshold = 100,
    enableNotifications = true,
    enableAutoCollect = false,
    enableHourlySettlementAlert = true,
    pendingRewardsThreshold = 100,
    yldWarningThreshold = 90  // YLD 使用超过90%时警告
  } = config
  
  // 状态引用
  const lastGrainWarningRef = useRef<number>(0)
  const lastToolWarningRef = useRef<Set<string>>(new Set())
  const lastSessionCompleteRef = useRef<Set<string>>(new Set())
  const lastYLDWarningRef = useRef<number>(0)
  const lastPendingWarningRef = useRef<number>(0)
  const lastHourlySettlementRef = useRef<number>(0)
  const refreshTimersRef = useRef<{
    sessions?: NodeJS.Timeout
    resources?: NodeJS.Timeout
    summary?: NodeJS.Timeout
    yld?: NodeJS.Timeout
    hourly?: NodeJS.Timeout
  }>({})
  
  // 整点结算后的刷新逻辑
  const handleHourlySettlement = useCallback(() => {
    if (!enabled || !enableHourlySettlementAlert) return
    
    const now = Date.now()
    const currentHour = new Date().getHours()
    
    // 确保每小时只触发一次
    if (now - lastHourlySettlementRef.current < 3600000) return
    lastHourlySettlementRef.current = now
    
    console.log('[AutoRefresh] Hourly settlement detected at', new Date().toLocaleTimeString())
    
    // 整点后延迟2秒刷新，确保后端已完成结算
    setTimeout(() => {
      // 刷新所有相关数据
      if (onRefreshSessions) {
        console.log('[AutoRefresh] Refreshing sessions after settlement')
        onRefreshSessions()
      }
      if (onRefreshPending) {
        console.log('[AutoRefresh] Refreshing pending rewards after settlement')
        onRefreshPending()
      }
      if (onRefreshSummary) {
        console.log('[AutoRefresh] Refreshing summary after settlement')
        onRefreshSummary()
      }
      if (onRefreshYLDStatus) {
        console.log('[AutoRefresh] Refreshing YLD status after settlement')
        onRefreshYLDStatus()
      }
      
      // 发送通知
      if (enableNotifications && sessions && sessions.length > 0) {
        toast.success(
          `⏰ 整点结算完成！${currentHour}:00 的收益已记录`,
          {
            duration: 5000,
            position: 'top-center',
            icon: '💎'
          }
        )
      }
      
      // 触发回调
      if (onHourlySettlement) {
        onHourlySettlement()
      }
    }, 2000)
  }, [
    enabled,
    enableHourlySettlementAlert,
    enableNotifications,
    sessions,
    onRefreshSessions,
    onRefreshPending,
    onRefreshSummary,
    onRefreshYLDStatus,
    onHourlySettlement
  ])
  
  // 检查待收取收益
  const checkPendingRewards = useCallback(() => {
    if (!sessions || !enableNotifications) return
    
    // 计算总待收取收益
    const totalPending = sessions.reduce((sum, session) => {
      return sum + (session.pending_output || session.pending_rewards || 0)
    }, 0)
    
    if (totalPending > pendingRewardsThreshold) {
      const now = Date.now()
      // 每10分钟最多提醒一次
      if (now - lastPendingWarningRef.current > 600000) {
        lastPendingWarningRef.current = now
        
        // 修复：使用 toast 配合警告图标
        toast(
          <div>
            <p className="font-bold">💰 待收取收益较高！</p>
            <p className="text-sm">总计: {formatNumber(totalPending)} YLD</p>
            <p className="text-xs">停止挖矿即可收取</p>
          </div>,
          {
            duration: 6000,
            position: 'top-center',
            icon: '⚠️'
          }
        )
        
        if (onPendingRewardsHigh) {
          onPendingRewardsHigh(totalPending)
        }
      }
    }
  }, [sessions, enableNotifications, pendingRewardsThreshold, onPendingRewardsHigh])
  
  // 检查粮食状态
  const checkGrainStatus = useCallback(() => {
    if (!grainStatus || !enableNotifications) return
    
    const hoursRemaining = grainStatus.hours_sustainable || 
                           grainStatus.hours_remaining || 
                           grainStatus.food_sustainability_hours || 0
    
    if (hoursRemaining < grainWarningThreshold && hoursRemaining > 0) {
      const now = Date.now()
      // 动态调整提醒频率
      const reminderInterval = hoursRemaining < 1 ? 180000 : 300000
      
      if (now - lastGrainWarningRef.current > reminderInterval) {
        lastGrainWarningRef.current = now
        
        const urgency = hoursRemaining < 0.5 ? '🚨' : '⚠️'
        toast.error(
          <div>
            <p className="font-bold">{urgency} 粮食即将耗尽！</p>
            <p className="text-sm">剩余: {hoursRemaining.toFixed(1)} 小时</p>
            <p className="text-xs">建议立即补充粮食</p>
          </div>,
          {
            duration: 5000,
            position: 'top-center'
          }
        )
        
        if (onGrainLow) {
          onGrainLow(hoursRemaining)
        }
      }
    }
  }, [grainStatus, grainWarningThreshold, enableNotifications, onGrainLow])
  
  // 检查工具状态
  const checkToolsStatus = useCallback(() => {
    if (!tools || !enableNotifications) return
    
    const lowDurabilityTools: Tool[] = []
    
    tools.forEach(tool => {
      if (!tool.is_in_use) return
      
      const durability = tool.current_durability || 0
      const toolKey = `${tool.tool_id}_${durability}`
      
      if (durability < durabilityWarningThreshold) {
        if (!lastToolWarningRef.current.has(toolKey)) {
          lastToolWarningRef.current.add(toolKey)
          lowDurabilityTools.push(tool)
        }
      } else {
        Array.from(lastToolWarningRef.current).forEach(key => {
          if (key.startsWith(tool.tool_id)) {
            lastToolWarningRef.current.delete(key)
          }
        })
      }
    })
    
    if (lowDurabilityTools.length > 0) {
      const toolList = lowDurabilityTools
        .map(t => `${t.tool_id}(${t.current_durability})`)
        .join(', ')
      
      toast.error(
        <div>
          <p className="font-bold">🔧 工具耐久度低！</p>
          <p className="text-sm">{toolList}</p>
          <p className="text-xs">建议及时修复</p>
        </div>,
        {
          duration: 5000,
          position: 'top-center'
        }
      )
      
      lowDurabilityTools.forEach(tool => {
        if (onToolDamaged) {
          onToolDamaged(tool)
        }
      })
    }
  }, [tools, durabilityWarningThreshold, enableNotifications, onToolDamaged])
  
  // 检查会话状态
  const checkSessionsStatus = useCallback(() => {
    if (!sessions || !enableNotifications) return
    
    sessions.forEach(session => {
      const sessionKey = session.session_id || `session_${session.id}`
      
      const pendingOutput = session.pending_output || session.pending_rewards || 0
      const settledHours = session.settled_hours || session.hours_settled || 0
      
      if (settledHours > 0 && pendingOutput > 0) {
        if (!lastSessionCompleteRef.current.has(sessionKey)) {
          lastSessionCompleteRef.current.add(sessionKey)
          
          if (pendingOutput > 10) {
            toast.success(
              <div>
                <p className="font-bold">💰 会话有待收取收益</p>
                <p className="text-sm">{sessionKey}</p>
                <p className="text-sm">待收取: {formatNumber(pendingOutput)} YLD</p>
                <p className="text-xs">已结算 {settledHours} 小时</p>
              </div>,
              {
                duration: 5000,
                position: 'top-center'
              }
            )
          }
          
          if (onSessionComplete) {
            onSessionComplete(session)
          }
        }
      } else {
        lastSessionCompleteRef.current.delete(sessionKey)
      }
    })
  }, [sessions, enableNotifications, onSessionComplete])
  
  // 检查YLD状态（修复版）
  const checkYLDStatus = useCallback(() => {
    if (!yldStatus || !enableNotifications) return
    
    console.log('[AutoRefresh] Checking YLD status:', yldStatus)
    
    // 处理嵌套的 data 结构
    const statusData = yldStatus.data || yldStatus
    
    // 获取百分比使用率
    let percentageUsed = statusData.percentage_used
    
    // 如果没有 percentage_used，手动计算
    if (percentageUsed == null && statusData.daily_limit && statusData.remaining != null) {
      percentageUsed = ((statusData.daily_limit - statusData.remaining) / statusData.daily_limit * 100)
    }
    
    console.log('[AutoRefresh] YLD percentage used:', percentageUsed)
    
    // 检查是否耗尽
    if (statusData.is_exhausted) {
      const now = Date.now()
      // 每30分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 1800000) {
        lastYLDWarningRef.current = now
        
        toast.error(
          <div>
            <p className="font-bold">🛑 今日YLD产量已耗尽！</p>
            <p className="text-xs">明日0点后恢复</p>
          </div>,
          {
            duration: 5000,
            position: 'top-center'
          }
        )
        
        if (onYLDExhausted) {
          onYLDExhausted()
        }
      }
    } else if (percentageUsed != null && percentageUsed > yldWarningThreshold) {
      const now = Date.now()
      // 每10分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 600000) {
        lastYLDWarningRef.current = now
        
        // 修复：使用 toast 配合警告图标
        toast(
          <div>
            <p className="font-bold">⚠️ YLD产量即将耗尽</p>
            <p className="text-sm">已使用: {percentageUsed.toFixed(1)}%</p>
            <p className="text-sm">剩余: {formatNumber(statusData.remaining, 2)} YLD</p>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
            icon: '⚠️'
          }
        )
      }
    }
    
    // 处理 API 返回的 warning 字段
    if (statusData.warning && enableNotifications) {
      const now = Date.now()
      // 每10分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 600000) {
        lastYLDWarningRef.current = now
        
        toast(
          statusData.warning,
          {
            duration: 5000,
            position: 'top-center',
            icon: '⚠️'
          }
        )
      }
    }
  }, [yldStatus, enableNotifications, yldWarningThreshold, onYLDExhausted])
  
  // 设置整点刷新定时器
  useEffect(() => {
    if (!enabled || !enableHourlySettlementAlert) return
    
    const scheduleNextHourlyCheck = () => {
      const msToNextHour = getMillisecondsToNextHour()
      const delay = msToNextHour + 10000
      
      console.log(`[AutoRefresh] Next hourly check in ${Math.round(delay / 1000)} seconds`)
      
      refreshTimersRef.current.hourly = setTimeout(() => {
        handleHourlySettlement()
        scheduleNextHourlyCheck()
      }, delay)
    }
    
    if (isJustPastHour()) {
      handleHourlySettlement()
    }
    
    scheduleNextHourlyCheck()
    
    return () => {
      if (refreshTimersRef.current.hourly) {
        clearTimeout(refreshTimersRef.current.hourly)
      }
    }
  }, [enabled, enableHourlySettlementAlert, handleHourlySettlement])
  
  // 设置常规定时刷新
  useEffect(() => {
    if (!enabled) {
      Object.values(refreshTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer as NodeJS.Timeout)
      })
      refreshTimersRef.current = {}
      return
    }
    
    const hasActiveSessions = sessions && sessions.length > 0
    
    if (hasActiveSessions) {
      // 会话刷新
      if (onRefreshSessions && !refreshTimersRef.current.sessions) {
        const interval = isJustPastHour() ? 10000 : sessionCheckInterval
        console.log('[AutoRefresh] Starting session refresh timer with interval:', interval)
        
        refreshTimersRef.current.sessions = setInterval(() => {
          console.log('[AutoRefresh] Refreshing sessions')
          onRefreshSessions()
        }, interval)
      }
      
      // 资源刷新
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        console.log('[AutoRefresh] Starting resource refresh timer')
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources')
          onRefreshResources()
        }, resourceCheckInterval)
      }
      
      // YLD 状态刷新（新增）
      if (onRefreshYLDStatus && !refreshTimersRef.current.yld) {
        console.log('[AutoRefresh] Starting YLD status refresh timer')
        refreshTimersRef.current.yld = setInterval(() => {
          console.log('[AutoRefresh] Refreshing YLD status')
          onRefreshYLDStatus()
        }, 60000) // 每分钟刷新一次 YLD 状态
      }
      
      // 汇总刷新
      if (onRefreshSummary && !refreshTimersRef.current.summary) {
        console.log('[AutoRefresh] Starting summary refresh timer')
        refreshTimersRef.current.summary = setInterval(() => {
          const minutes = new Date().getMinutes()
          if (minutes <= 2 || minutes >= 58) {
            console.log('[AutoRefresh] Refreshing summary near hour boundary')
            onRefreshSummary()
          }
        }, 60000)
      }
    } else {
      console.log('[AutoRefresh] No active sessions, reducing refresh frequency')
      
      if (refreshTimersRef.current.sessions) {
        clearInterval(refreshTimersRef.current.sessions)
        delete refreshTimersRef.current.sessions
      }
      if (refreshTimersRef.current.summary) {
        clearInterval(refreshTimersRef.current.summary)
        delete refreshTimersRef.current.summary
      }
      if (refreshTimersRef.current.yld) {
        clearInterval(refreshTimersRef.current.yld)
        delete refreshTimersRef.current.yld
      }
      
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources (idle mode)')
          onRefreshResources()
        }, resourceCheckInterval * 3)
      }
    }
    
    return () => {
      console.log('[AutoRefresh] Cleaning up regular timers')
      Object.entries(refreshTimersRef.current).forEach(([key, timer]) => {
        if (key !== 'hourly' && timer) {
          clearInterval(timer as NodeJS.Timeout)
        }
      })
    }
  }, [
    enabled,
    sessions,
    sessionCheckInterval,
    resourceCheckInterval,
    onRefreshSessions,
    onRefreshResources,
    onRefreshSummary,
    onRefreshYLDStatus
  ])
  
  // 监控状态变化
  useEffect(() => {
    if (!enabled) return
    
    checkGrainStatus()
    checkToolsStatus()
    checkSessionsStatus()
    checkYLDStatus()
    checkPendingRewards()
  }, [
    enabled,
    grainStatus,
    tools,
    sessions,
    yldStatus,
    checkGrainStatus,
    checkToolsStatus,
    checkSessionsStatus,
    checkYLDStatus,
    checkPendingRewards
  ])
  
  // 显示 YLD 状态调试信息
  useEffect(() => {
    if (yldStatus) {
      const statusData = yldStatus.data || yldStatus
      console.log('[AutoRefresh] YLD Status Update:', {
        daily_limit: statusData.daily_limit,
        remaining: statusData.remaining,
        percentage_used: statusData.percentage_used,
        is_exhausted: statusData.is_exhausted,
        warning: statusData.warning
      })
    }
  }, [yldStatus])
  
  return null
}

export default AutoRefreshSystem
