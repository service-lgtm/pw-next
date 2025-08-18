// src/app/mining/AutoRefreshSystem.tsx
// 自动刷新监控系统 - 修复 toast.warning 错误版本
// 
// 文件说明：
// 此文件用于监控挖矿系统状态并自动刷新
// 注意：根据最新需求，挖矿会话页面已不再使用此组件
// 保留此文件仅供其他页面可能需要使用
// 
// 修复历史：
// - 2025-01: 修复 toast.warning 不存在的问题，改用 toast 配合警告图标
// - 2025-01: 标记为已废弃，挖矿会话不再使用此组件
// 
// ⚠️ 注意：此组件已废弃，挖矿会话页面不再使用
// 如果其他页面需要使用，请确保测试所有功能

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
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
  config?: {
    sessionCheckInterval?: number
    resourceCheckInterval?: number
    grainWarningThreshold?: number
    durabilityWarningThreshold?: number
    enableNotifications?: boolean
    enableAutoCollect?: boolean
    enableHourlySettlementAlert?: boolean
    pendingRewardsThreshold?: number
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
const formatNumber = (value: number, decimals: number = 4): string => {
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
 * @deprecated 此组件已废弃，挖矿会话页面不再使用
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
    pendingRewardsThreshold = 100
  } = config
  
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
    hourly?: NodeJS.Timeout
  }>({})
  
  // 整点结算后的刷新逻辑
  const handleHourlySettlement = useCallback(() => {
    if (!enabled || !enableHourlySettlementAlert) return
    
    const now = Date.now()
    const currentHour = new Date().getHours()
    
    if (now - lastHourlySettlementRef.current < 3600000) return
    lastHourlySettlementRef.current = now
    
    console.log('[AutoRefresh] Hourly settlement detected at', new Date().toLocaleTimeString())
    
    setTimeout(() => {
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
    onHourlySettlement
  ])
  
  // 检查待收取收益
  const checkPendingRewards = useCallback(() => {
    if (!sessions || !enableNotifications) return
    
    const totalPending = sessions.reduce((sum, session) => {
      return sum + (session.pending_output || session.pending_rewards || 0)
    }, 0)
    
    if (totalPending > pendingRewardsThreshold) {
      const now = Date.now()
      if (now - lastPendingWarningRef.current > 600000) {
        lastPendingWarningRef.current = now
        
        // 修复：使用 toast 替代 toast.warning
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
  
  // 检查YLD状态
  const checkYLDStatus = useCallback(() => {
    if (!yldStatus || !enableNotifications) return
    
    const percentageUsed = yldStatus.percentage_used || 
                           ((yldStatus.daily_limit - yldStatus.remaining) / yldStatus.daily_limit * 100) || 0
    
    if (yldStatus.is_exhausted) {
      const now = Date.now()
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
    } else if (percentageUsed > 90) {
      const now = Date.now()
      if (now - lastYLDWarningRef.current > 600000) {
        lastYLDWarningRef.current = now
        
        // 修复：使用 toast 替代 toast.warning
        toast(
          <div>
            <p className="font-bold">⚠️ YLD产量即将耗尽</p>
            <p className="text-sm">已使用: {percentageUsed.toFixed(1)}%</p>
            <p className="text-sm">剩余: {formatNumber(yldStatus.remaining || 0, 2)} YLD</p>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
            icon: '⚠️'
          }
        )
      }
    }
  }, [yldStatus, enableNotifications, onYLDExhausted])
  
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
      if (onRefreshSessions && !refreshTimersRef.current.sessions) {
        const interval = isJustPastHour() ? 10000 : sessionCheckInterval
        console.log('[AutoRefresh] Starting session refresh timer with interval:', interval)
        
        refreshTimersRef.current.sessions = setInterval(() => {
          console.log('[AutoRefresh] Refreshing sessions')
          onRefreshSessions()
        }, interval)
      }
      
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        console.log('[AutoRefresh] Starting resource refresh timer')
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources')
          onRefreshResources()
        }, resourceCheckInterval)
      }
      
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
    onRefreshSummary
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
  
  return null
}

export default AutoRefreshSystem
