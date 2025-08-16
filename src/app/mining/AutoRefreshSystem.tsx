// src/app/mining/AutoRefreshSystem.tsx
// 自动刷新监控系统 - 生产级版本
// 
// 功能说明：
// 1. 监控粮食消耗状态
// 2. 检查工具耐久度
// 3. 检测会话完成状态
// 4. 自动刷新数据
// 5. 发送通知提醒
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 使用 @/hooks/useProduction 中的各种 Hook
// - 使用 react-hot-toast 进行通知
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12: 创建自动刷新监控系统

'use client'

import { useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { safeFormatResource, safeFormatYLD } from '@/utils/formatters'

interface AutoRefreshSystemProps {
  // 数据和状态
  enabled?: boolean
  sessions?: any[]
  tools?: any[]
  grainStatus?: any
  miningSummary?: any
  yldStatus?: any
  
  // 刷新函数
  onRefreshSessions?: () => void
  onRefreshTools?: () => void
  onRefreshResources?: () => void
  onRefreshSummary?: () => void
  
  // 配置
  config?: {
    sessionCheckInterval?: number      // 会话检查间隔（默认30秒）
    resourceCheckInterval?: number     // 资源检查间隔（默认60秒）
    grainWarningThreshold?: number    // 粮食警告阈值（默认2小时）
    durabilityWarningThreshold?: number // 耐久度警告阈值（默认100）
    enableNotifications?: boolean      // 是否启用通知（默认true）
    enableAutoCollect?: boolean       // 是否自动收取（默认false）
  }
  
  // 回调
  onGrainLow?: (hours: number) => void
  onToolDamaged?: (tool: any) => void
  onSessionComplete?: (session: any) => void
  onYLDExhausted?: () => void
}

/**
 * 自动刷新监控系统
 */
export function AutoRefreshSystem({
  enabled = true,
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
  // 配置参数
  const {
    sessionCheckInterval = 30000,     // 30秒
    resourceCheckInterval = 60000,    // 60秒
    grainWarningThreshold = 2,        // 2小时
    durabilityWarningThreshold = 100, // 100耐久度
    enableNotifications = true,
    enableAutoCollect = false
  } = config
  
  // 记录上次通知时间，避免重复通知
  const lastNotifications = useRef<{
    grainWarning?: number
    yldWarning?: number
    toolWarnings: Set<number>
    sessionCompletes: Set<number>
  }>({
    toolWarnings: new Set(),
    sessionCompletes: new Set()
  })
  
  // 定时器引用
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const resourceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 检查粮食状态
  const checkGrainStatus = useCallback(() => {
    if (!grainStatus || !enableNotifications) return
    
    const hoursRemaining = grainStatus.hours_remaining || grainStatus.hours_sustainable || 0
    
    // 粮食不足警告
    if (hoursRemaining < grainWarningThreshold) {
      const now = Date.now()
      const lastWarning = lastNotifications.current.grainWarning || 0
      
      // 每5分钟最多通知一次
      if (now - lastWarning > 5 * 60 * 1000) {
        lastNotifications.current.grainWarning = now
        
        if (hoursRemaining <= 0) {
          toast.error('⚠️ 粮食已耗尽！挖矿即将停止', {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#dc2626',
              color: '#fff',
              fontWeight: 'bold'
            }
          })
        } else if (hoursRemaining < 1) {
          toast.error(`🌾 粮食即将耗尽！仅剩 ${safeFormatResource(hoursRemaining * 60, 0)} 分钟`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#f59e0b',
              color: '#fff'
            }
          })
        } else {
          toast.warning(`🌾 粮食储备不足，仅可维持 ${safeFormatResource(hoursRemaining, 1)} 小时`, {
            duration: 4000,
            position: 'top-center'
          })
        }
        
        // 触发回调
        if (onGrainLow) {
          onGrainLow(hoursRemaining)
        }
      }
    }
  }, [grainStatus, grainWarningThreshold, enableNotifications, onGrainLow])
  
  // 检查工具状态
  const checkToolStatus = useCallback(() => {
    if (!tools || !Array.isArray(tools) || !enableNotifications) return
    
    tools.forEach(tool => {
      const durability = tool.current_durability ?? tool.durability ?? 0
      
      // 检查耐久度低的工具
      if (durability < durabilityWarningThreshold && durability > 0) {
        if (!lastNotifications.current.toolWarnings.has(tool.id)) {
          lastNotifications.current.toolWarnings.add(tool.id)
          
          toast.warning(`🔧 工具 ${tool.tool_id} 耐久度低（${durability}/${tool.max_durability || 1500}）`, {
            duration: 4000,
            position: 'top-right'
          })
          
          // 触发回调
          if (onToolDamaged) {
            onToolDamaged(tool)
          }
        }
      } else if (durability >= durabilityWarningThreshold) {
        // 如果耐久度恢复，移除警告记录
        lastNotifications.current.toolWarnings.delete(tool.id)
      }
      
      // 检查损坏的工具
      if (tool.status === 'damaged' && !lastNotifications.current.toolWarnings.has(-tool.id)) {
        lastNotifications.current.toolWarnings.add(-tool.id)
        
        toast.error(`❌ 工具 ${tool.tool_id} 已损坏，需要维修`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#dc2626',
            color: '#fff'
          }
        })
      }
    })
  }, [tools, durabilityWarningThreshold, enableNotifications, onToolDamaged])
  
  // 检查会话状态
  const checkSessionStatus = useCallback(() => {
    if (!sessions || !Array.isArray(sessions)) return
    
    sessions.forEach(session => {
      // 计算可收取的小时数
      const startTime = session.started_at || session.start_time
      if (!startTime) return
      
      try {
        const start = new Date(startTime)
        const now = new Date()
        const hoursWorked = (now.getTime() - start.getTime()) / (1000 * 60 * 60)
        const collectableHours = Math.floor(hoursWorked)
        
        // 检查是否有可收取的产出
        if (collectableHours >= 1 && !lastNotifications.current.sessionCompletes.has(session.id)) {
          lastNotifications.current.sessionCompletes.add(session.id)
          
          if (enableNotifications) {
            const outputAmount = collectableHours * parseFloat(session.output_rate || '0')
            toast.success(`💰 会话 ${session.session_id} 有 ${safeFormatYLD(outputAmount, 2)} 可收取`, {
              duration: 5000,
              position: 'top-center',
              action: {
                label: '收取',
                onClick: () => {
                  // 这里可以添加收取逻辑
                  console.log('收取产出:', session.id)
                }
              }
            })
          }
          
          // 触发回调
          if (onSessionComplete) {
            onSessionComplete(session)
          }
        }
      } catch (error) {
        console.error('[AutoRefresh] 检查会话状态失败:', error)
      }
    })
  }, [sessions, enableNotifications, onSessionComplete])
  
  // 检查YLD状态
  const checkYLDStatus = useCallback(() => {
    if (!yldStatus || !enableNotifications) return
    
    // YLD即将耗尽警告
    if (yldStatus.percentage_used >= 90) {
      const now = Date.now()
      const lastWarning = lastNotifications.current.yldWarning || 0
      
      // 每10分钟最多通知一次
      if (now - lastWarning > 10 * 60 * 1000) {
        lastNotifications.current.yldWarning = now
        
        if (yldStatus.is_exhausted) {
          toast.error('🛑 YLD今日产量已耗尽，所有YLD挖矿会话已停止', {
            duration: 6000,
            position: 'top-center',
            style: {
              background: '#dc2626',
              color: '#fff',
              fontWeight: 'bold'
            }
          })
          
          // 触发回调
          if (onYLDExhausted) {
            onYLDExhausted()
          }
        } else if (yldStatus.percentage_used >= 95) {
          toast.error(`⚠️ YLD产量即将耗尽！仅剩 ${safeFormatYLD(yldStatus.remaining, 2)} YLD`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#f59e0b',
              color: '#fff'
            }
          })
        } else {
          toast.warning(`💎 YLD产量已使用 ${yldStatus.percentage_used.toFixed(1)}%`, {
            duration: 4000,
            position: 'top-center'
          })
        }
      }
    }
  }, [yldStatus, enableNotifications, onYLDExhausted])
  
  // 执行所有检查
  const performAllChecks = useCallback(() => {
    console.log('[AutoRefresh] 执行状态检查...')
    
    // 检查各项状态
    checkGrainStatus()
    checkToolStatus()
    checkSessionStatus()
    checkYLDStatus()
    
    // 触发数据刷新
    if (onRefreshSummary) {
      onRefreshSummary()
    }
  }, [checkGrainStatus, checkToolStatus, checkSessionStatus, checkYLDStatus, onRefreshSummary])
  
  // 设置定时器
  useEffect(() => {
    if (!enabled) {
      // 清理定时器
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
        sessionTimerRef.current = null
      }
      if (resourceTimerRef.current) {
        clearInterval(resourceTimerRef.current)
        resourceTimerRef.current = null
      }
      return
    }
    
    // 立即执行一次检查
    performAllChecks()
    
    // 设置会话检查定时器
    sessionTimerRef.current = setInterval(() => {
      checkSessionStatus()
      if (onRefreshSessions) {
        onRefreshSessions()
      }
    }, sessionCheckInterval)
    
    // 设置资源检查定时器
    resourceTimerRef.current = setInterval(() => {
      checkGrainStatus()
      checkToolStatus()
      checkYLDStatus()
      if (onRefreshResources) {
        onRefreshResources()
      }
    }, resourceCheckInterval)
    
    // 清理函数
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
      if (resourceTimerRef.current) {
        clearInterval(resourceTimerRef.current)
      }
    }
  }, [
    enabled,
    sessionCheckInterval,
    resourceCheckInterval,
    checkSessionStatus,
    checkGrainStatus,
    checkToolStatus,
    checkYLDStatus,
    onRefreshSessions,
    onRefreshResources,
    performAllChecks
  ])
  
  // 监听页面可见性变化
  useEffect(() => {
    if (!enabled) return
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，立即执行一次检查
        console.log('[AutoRefresh] 页面变为可见，执行检查')
        performAllChecks()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, performAllChecks])
  
  // 不渲染任何UI，只执行监控逻辑
  return null
}

export default AutoRefreshSystem
