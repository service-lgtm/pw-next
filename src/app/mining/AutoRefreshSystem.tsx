// src/app/mining/AutoRefreshSystem.tsx
// 自动刷新监控系统 - 修复版
// 
// 功能说明：
// 1. 监控挖矿系统状态并自动刷新
// 2. 修复循环请求问题
// 3. 提供粮食预警、工具损坏提醒等功能
// 4. 智能刷新策略，避免频繁请求
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/hooks/useProduction 中的各种 Hook
// - 使用 @/types/production 中的类型定义
// 
// 修复历史：
// - 2024-12: 修复循环请求问题
// - 2024-12: 添加请求节流和去重

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
  config?: {
    sessionCheckInterval?: number
    resourceCheckInterval?: number
    grainWarningThreshold?: number
    durabilityWarningThreshold?: number
    enableNotifications?: boolean
    enableAutoCollect?: boolean
  }
  onGrainLow?: (hours: number) => void
  onToolDamaged?: (tool: Tool) => void
  onSessionComplete?: (session: MiningSession) => void
  onYLDExhausted?: () => void
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
  config = {},
  onGrainLow,
  onToolDamaged,
  onSessionComplete,
  onYLDExhausted
}: AutoRefreshSystemProps) {
  const {
    sessionCheckInterval = 30000,      // 30秒检查会话
    resourceCheckInterval = 60000,     // 60秒检查资源
    grainWarningThreshold = 2,         // 粮食少于2小时警告
    durabilityWarningThreshold = 100,  // 耐久度少于100警告
    enableNotifications = true,        // 启用通知
    enableAutoCollect = false          // 自动收取
  } = config
  
  // 记录上次检查时间，避免重复通知
  const lastGrainWarningRef = useRef<number>(0)
  const lastToolWarningRef = useRef<Set<string>>(new Set())
  const lastSessionCompleteRef = useRef<Set<string>>(new Set())
  const lastYLDWarningRef = useRef<number>(0)
  const refreshTimersRef = useRef<{
    sessions?: NodeJS.Timeout
    resources?: NodeJS.Timeout
    summary?: NodeJS.Timeout
  }>({})
  
  // 检查粮食状态
  const checkGrainStatus = useCallback(() => {
    if (!grainStatus || !enableNotifications) return
    
    const hoursRemaining = grainStatus.hours_sustainable || grainStatus.hours_remaining || 0
    
    if (hoursRemaining < grainWarningThreshold && hoursRemaining > 0) {
      const now = Date.now()
      // 每5分钟最多提醒一次
      if (now - lastGrainWarningRef.current > 300000) {
        lastGrainWarningRef.current = now
        
        toast.error(`⚠️ 粮食即将耗尽！剩余 ${hoursRemaining.toFixed(1)} 小时`, {
          duration: 5000,
          position: 'top-center'
        })
        
        if (onGrainLow) {
          onGrainLow(hoursRemaining)
        }
      }
    }
  }, [grainStatus, grainWarningThreshold, enableNotifications, onGrainLow])
  
  // 检查工具状态
  const checkToolsStatus = useCallback(() => {
    if (!tools || !enableNotifications) return
    
    tools.forEach(tool => {
      if (tool.current_durability < durabilityWarningThreshold) {
        if (!lastToolWarningRef.current.has(tool.tool_id)) {
          lastToolWarningRef.current.add(tool.tool_id)
          
          toast.error(`🔧 工具 ${tool.tool_id} 耐久度低！剩余 ${tool.current_durability}`, {
            duration: 4000,
            position: 'top-center'
          })
          
          if (onToolDamaged) {
            onToolDamaged(tool)
          }
        }
      } else {
        // 如果工具修复了，从警告列表中移除
        lastToolWarningRef.current.delete(tool.tool_id)
      }
    })
  }, [tools, durabilityWarningThreshold, enableNotifications, onToolDamaged])
  
  // 检查会话状态
  const checkSessionsStatus = useCallback(() => {
    if (!sessions || !enableNotifications) return
    
    sessions.forEach(session => {
      // 检查是否有可收取的产出
      if (session.current_output && session.current_output > 0) {
        if (!lastSessionCompleteRef.current.has(session.session_id)) {
          lastSessionCompleteRef.current.add(session.session_id)
          
          toast.success(`💰 会话 ${session.session_id} 有产出可收取！`, {
            duration: 4000,
            position: 'top-center'
          })
          
          if (onSessionComplete) {
            onSessionComplete(session)
          }
          
          // 如果启用自动收取
          if (enableAutoCollect) {
            // 这里可以触发自动收取逻辑
            console.log('[AutoRefresh] 自动收取功能暂未实现')
          }
        }
      } else {
        lastSessionCompleteRef.current.delete(session.session_id)
      }
    })
  }, [sessions, enableNotifications, enableAutoCollect, onSessionComplete])
  
  // 检查YLD状态
  const checkYLDStatus = useCallback(() => {
    if (!yldStatus || !enableNotifications) return
    
    if (yldStatus.is_exhausted) {
      const now = Date.now()
      // 每10分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 600000) {
        lastYLDWarningRef.current = now
        
        toast.error('🛑 今日YLD产量已耗尽！', {
          duration: 5000,
          position: 'top-center'
        })
        
        if (onYLDExhausted) {
          onYLDExhausted()
        }
      }
    } else if (yldStatus.percentage_used > 90) {
      const now = Date.now()
      // 每5分钟最多提醒一次
      if (now - lastYLDWarningRef.current > 300000) {
        lastYLDWarningRef.current = now
        
        toast.warning(`⚠️ YLD产量即将耗尽！已使用 ${yldStatus.percentage_used.toFixed(1)}%`, {
          duration: 4000,
          position: 'top-center'
        })
      }
    }
  }, [yldStatus, enableNotifications, onYLDExhausted])
  
  // 设置定时刷新 - 修复版，防止循环请求
  useEffect(() => {
    if (!enabled) {
      // 清理所有定时器
      Object.values(refreshTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer)
      })
      refreshTimersRef.current = {}
      return
    }
    
    // 只在有活跃会话时才启动自动刷新
    const hasActiveSessions = sessions && sessions.length > 0
    
    if (hasActiveSessions) {
      // 会话刷新 - 只在有会话时刷新
      if (onRefreshSessions && !refreshTimersRef.current.sessions) {
        console.log('[AutoRefresh] Starting session refresh timer')
        refreshTimersRef.current.sessions = setInterval(() => {
          console.log('[AutoRefresh] Refreshing sessions')
          onRefreshSessions()
        }, sessionCheckInterval)
      }
      
      // 资源刷新 - 降低频率
      if (onRefreshResources && !refreshTimersRef.current.resources) {
        console.log('[AutoRefresh] Starting resource refresh timer')
        refreshTimersRef.current.resources = setInterval(() => {
          console.log('[AutoRefresh] Refreshing resources')
          onRefreshResources()
        }, resourceCheckInterval * 2) // 降低频率
      }
    } else {
      // 没有活跃会话时，停止自动刷新
      console.log('[AutoRefresh] No active sessions, stopping timers')
      Object.values(refreshTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer)
      })
      refreshTimersRef.current = {}
    }
    
    // 汇总刷新 - 完全禁用，避免循环请求
    // 汇总数据应该只在用户操作时刷新，不自动刷新
    
    // 清理函数
    return () => {
      console.log('[AutoRefresh] Cleaning up timers')
      Object.values(refreshTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer)
      })
      refreshTimersRef.current = {}
    }
  }, [
    enabled,
    sessions, // 添加 sessions 依赖
    sessionCheckInterval,
    resourceCheckInterval,
    onRefreshSessions,
    onRefreshResources
    // 移除 onRefreshSummary，不自动刷新汇总
  ])
  
  // 监控状态变化
  useEffect(() => {
    if (!enabled) return
    
    checkGrainStatus()
    checkToolsStatus()
    checkSessionsStatus()
    checkYLDStatus()
  }, [
    enabled,
    grainStatus,
    tools,
    sessions,
    yldStatus,
    checkGrainStatus,
    checkToolsStatus,
    checkSessionsStatus,
    checkYLDStatus
  ])
  
  // 组件不渲染任何内容
  return null
}

export default AutoRefreshSystem
