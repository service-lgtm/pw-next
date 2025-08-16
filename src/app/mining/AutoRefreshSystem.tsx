// src/app/mining/AutoRefreshSystem.tsx
// 自动刷新监控系统 - 新算法v2优化版
// 
// 功能说明：
// 1. 监控挖矿系统状态并自动刷新
// 2. 支持新算法v2的整点结算监控
// 3. 智能刷新策略（整点后自动更新）
// 4. 提供粮食预警、工具损坏提醒、待收取收益提醒等功能
// 
// 更新内容：
// - 添加整点后自动刷新逻辑
// - 支持 pending_output 监控
// - 优化刷新时机和频率
// - 添加更多新算法v2相关的提醒

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
  onRefreshPending?: () => void  // 新增：刷新待收取收益
  config?: {
    sessionCheckInterval?: number
    resourceCheckInterval?: number
    grainWarningThreshold?: number
    durabilityWarningThreshold?: number
    enableNotifications?: boolean
    enableAutoCollect?: boolean
    enableHourlySettlementAlert?: boolean  // 新增：整点结算提醒
    pendingRewardsThreshold?: number      // 新增：待收取收益阈值
  }
  onGrainLow?: (hours: number) => void
  onToolDamaged?: (tool: Tool) => void
  onSessionComplete?: (session: MiningSession) => void
  onYLDExhausted?: () => void
  onPendingRewardsHigh?: (amount: number) => void  // 新增：待收取收益过高回调
  onHourlySettlement?: () => void                  // 新增：整点结算回调
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
 * 自动刷新监控系统组件 - 新算法v2优化版
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
    sessionCheckInterval = 30000,           // 30秒检查会话
    resourceCheckInterval = 60000,          // 60秒检查资源
    grainWarningThreshold = 2,              // 粮食少于2小时警告
    durabilityWarningThreshold = 100,       // 耐久度少于100警告
    enableNotifications = true,             // 启用通知
    enableAutoCollect = false,              // 自动收取
    enableHourlySettlementAlert = true,     // 整点结算提醒
    pendingRewardsThreshold = 100           // 待收取收益超过100警告
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
    
    // 整点后延迟1-2秒刷新，确保后端已完成结算
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
    onHourlySettlement
  ])
  
  // 检查待收取收益（新算法v2）
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
        
        toast.warning(
          <div>
            <p className="font-bold">💰 待收取收益较高！</p>
            <p className="text-sm">总计: {formatNumber(totalPending)} YLD</p>
            <p className="text-xs">停止挖矿即可收取</p>
          </div>,
          {
            duration: 6000,
            position: 'top-center'
          }
        )
        
        if (onPendingRewardsHigh) {
          onPendingRewardsHigh(totalPending)
        }
      }
    }
  }, [sessions, enableNotifications, pendingRewardsThreshold, onPendingRewardsHigh])
  
  // 检查粮食状态（优化版）
  const checkGrainStatus = useCallback(() => {
    if (!grainStatus || !enableNotifications) return
    
    const hoursRemaining = grainStatus.hours_sustainable || 
                           grainStatus.hours_remaining || 
                           grainStatus.food_sustainability_hours || 0
    
    if (hoursRemaining < grainWarningThreshold && hoursRemaining > 0) {
      const now = Date.now()
      // 动态调整提醒频率：粮食越少，提醒越频繁
      const reminderInterval = hoursRemaining < 1 ? 180000 : 300000 // 3分钟或5分钟
      
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
  
  // 检查工具状态（优化版）
  const checkToolsStatus = useCallback(() => {
    if (!tools || !enableNotifications) return
    
    const lowDurabilityTools: Tool[] = []
    
    tools.forEach(tool => {
      // 只检查正在使用的工具
      if (!tool.is_in_use) return
      
      const durability = tool.current_durability || 0
      const toolKey = `${tool.tool_id}_${durability}`
      
      if (durability < durabilityWarningThreshold) {
        if (!lastToolWarningRef.current.has(toolKey)) {
          lastToolWarningRef.current.add(toolKey)
          lowDurabilityTools.push(tool)
        }
      } else {
        // 清理旧的警告记录
        Array.from(lastToolWarningRef.current).forEach(key => {
          if (key.startsWith(tool.tool_id)) {
            lastToolWarningRef.current.delete(key)
          }
        })
      }
    })
    
    // 批量提醒
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
  
  // 检查会话状态（适配新算法v2）
  const checkSessionsStatus = useCallback(() => {
    if (!sessions || !enableNotifications) return
    
    sessions.forEach(session => {
      const sessionKey = session.session_id || `session_${session.id}`
      
      // 新算法v2：检查待收取收益
      const pendingOutput = session.pending_output || session.pending_rewards || 0
      const settledHours = session.settled_hours || session.hours_settled || 0
      
      // 如果有已结算的小时数且待收取收益大于0
      if (settledHours > 0 && pendingOutput > 0) {
        if (!lastSessionCompleteRef.current.has(sessionKey)) {
          lastSessionCompleteRef.current.add(sessionKey)
          
          // 只在待收取收益较大时提醒
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
  
  // 检查YLD状态（优化版）
  const checkYLDStatus = useCallback(() => {
    if (!yldStatus || !enableNotifications) return
    
    const percentageUsed = yldStatus.percentage_used || 
                           ((yldStatus.daily_limit - yldStatus.remaining) / yldStatus.daily_limit * 100) || 0
    
    if (yldStatus.is_exhausted) {
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
    } else if (percentageUsed > 90) {
      const now = Date.now()
      // 每10分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 600000) {
        lastYLDWarningRef.current = now
        
        toast.warning(
          <div>
            <p className="font-bold">⚠️ YLD产量即将耗尽</p>
            <p className="text-sm">已使用: {percentageUsed.toFixed(1)}%</p>
            <p className="text-sm">剩余: {formatNumber(yldStatus.remaining || 0, 2)} YLD</p>
          </div>,
          {
            duration: 5000,
            position: 'top-center'
          }
        )
      }
    }
  }, [yldStatus, enableNotifications, onYLDExhausted])
  
  // 设置整点刷新定时器
  useEffect(() => {
    if (!enabled || !enableHourlySettlementAlert) return
    
    // 计算到下一个整点的时间
    const scheduleNextHourlyCheck = () => {
      const msToNextHour = getMillisecondsToNextHour()
      
      // 在整点后10秒触发，确保后端已完成结算
      const delay = msToNextHour + 10000
      
      console.log(`[AutoRefresh] Next hourly check in ${Math.round(delay / 1000)} seconds`)
      
      refreshTimersRef.current.hourly = setTimeout(() => {
        handleHourlySettlement()
        // 递归设置下一个小时的检查
        scheduleNextHourlyCheck()
      }, delay)
    }
    
    // 如果刚过整点，立即触发一次
    if (isJustPastHour()) {
      handleHourlySettlement()
    }
    
    // 开始调度
    scheduleNextHourlyCheck()
    
    return () => {
      if (refreshTimersRef.current.hourly) {
        clearTimeout(refreshTimersRef.current.hourly)
      }
    }
  }, [enabled, enableHourlySettlementAlert, handleHourlySettlement])
  
  // 设置常规定时刷新（优化版）
  useEffect(() => {
    if (!enabled) {
      // 清理所有定时器
      Object.values(refreshTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer as NodeJS.Timeout)
      })
      refreshTimersRef.current = {}
      return
    }
    
    const hasActiveSessions = sessions && sessions.length > 0
    
    if (hasActiveSessions) {
      // 会话刷新 - 动态调整频率
      if (onRefreshSessions && !refreshTimersRef.current.sessions) {
        const interval = isJustPastHour() ? 10000 : sessionCheckInterval // 整点后加快刷新
        console.log('[AutoRefresh] Starting session refresh timer with interval:', interval)
        
        refreshTimersRef.current.sessions = setInterval(() => {
          console.log('[AutoRefresh] Refreshing sessions')
          onRefreshSessions()
        }, interval)
      }
      
      // 资源刷新 - 只在有会话时刷新
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        console.log('[AutoRefresh] Starting resource refresh timer')
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources')
          onRefreshResources()
        }, resourceCheckInterval)
      }
      
      // 汇总刷新 - 降低频率，避免过多请求
      if (onRefreshSummary && !refreshTimersRef.current.summary) {
        console.log('[AutoRefresh] Starting summary refresh timer')
        refreshTimersRef.current.summary = setInterval(() => {
          // 只在整点附近刷新汇总
          const minutes = new Date().getMinutes()
          if (minutes <= 2 || minutes >= 58) {
            console.log('[AutoRefresh] Refreshing summary near hour boundary')
            onRefreshSummary()
          }
        }, 60000) // 每分钟检查一次是否需要刷新
      }
    } else {
      // 没有活跃会话时，停止大部分自动刷新
      console.log('[AutoRefresh] No active sessions, reducing refresh frequency')
      
      // 清理会话和汇总刷新
      if (refreshTimersRef.current.sessions) {
        clearInterval(refreshTimersRef.current.sessions)
        delete refreshTimersRef.current.sessions
      }
      if (refreshTimersRef.current.summary) {
        clearInterval(refreshTimersRef.current.summary)
        delete refreshTimersRef.current.summary
      }
      
      // 保持资源刷新，但降低频率
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources (idle mode)')
          onRefreshResources()
        }, resourceCheckInterval * 3) // 空闲时3倍间隔
      }
    }
    
    // 清理函数
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
    
    // 执行各项检查
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
  
  // 组件不渲染任何内容
  return null
}

export default AutoRefreshSystem
