// src/hooks/useProduction.ts
// 挖矿生产系统 Hook - 增强生产版本
//
// 文件说明：
// 1. 本文件提供挖矿生产相关的数据获取和操作 Hook
// 2. 新增：YLD状态监控、挖矿预检查、产出率历史、批量操作等功能
// 3. 自动处理加载状态、错误处理和数据缓存
// 4. 支持新的资源统计接口 /production/resources/stats/
// 5. 修复粮食显示问题（grain vs food 字段映射）
//
// 关联文件：
// - src/lib/api/production.ts: 生产系统 API 接口
// - src/types/production.ts: 生产系统类型定义
// - src/app/mining/page.tsx: 挖矿页面使用这些 Hook
// - src/app/mining/MiningSessions.tsx: 挖矿会话管理组件
// - backend/production/views.py: 后端视图
//
// 更新历史：
// - 2024-12: 新增YLD系统状态、挖矿预检查、产出率历史等Hook

import { useState, useEffect, useCallback, useRef } from 'react'
import { productionApi, formatResourceBalance, formatResourceStatsToBalance } from '@/lib/api/production'
import { ApiError } from '@/lib/api'
import type {
  MiningSession,
  Tool,
  ResourceBalance,
  StartSelfMiningRequest,
  StartHiredMiningWithToolRequest,
  StartHiredMiningWithoutToolRequest,
  SynthesizeToolRequest,
  getSessionTotalOutput
} from '@/types/production'
import toast from 'react-hot-toast'

// ==================== 工具函数 ====================

/**
 * 安全的数字解析
 */
function safeParseFloat(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? defaultValue : num
}

/**
 * 格式化错误消息
 */
function formatErrorMessage(error: any): string {
  // 检查是否有详细的错误数据
  if (error?.response?.data?.data) {
    const data = error.response.data.data
    
    // 粮食不足的详细提示
    if (data.current_food !== undefined && data.food_needed !== undefined) {
      return `粮食不足！当前：${data.current_food}，需要：${data.food_needed}（缺少：${data.shortage || data.food_needed - data.current_food}）`
    }
    
    // 时间不足的详细提示
    if (data.minutes_to_wait !== undefined) {
      return `需要等待 ${data.minutes_to_wait} 分钟才能收取`
    }
  }
  
  // 返回通用错误消息
  return error?.response?.data?.message || 
         error?.response?.data?.detail || 
         error?.message || 
         '操作失败'
}

// ==================== 新增：YLD系统状态 ====================

interface UseYLDStatusOptions {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useYLDStatus(options?: UseYLDStatusOptions) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    enabled = true,
    autoRefresh = true,
    refreshInterval = 60000 // 1分钟
  } = options || {}

  const fetchStatus = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useYLDStatus] 获取YLD系统状态...')
      const response = await productionApi.yld.getSystemStatus()
      
      if (response.success && response.data) {
        console.log('[useYLDStatus] 获取成功:', response.data)
        setStatus(response.data)
        
        // 如果YLD即将耗尽，显示警告
        if (response.data.percentage_used > 90) {
          toast(`⚠️ YLD今日产量已使用 ${response.data.percentage_used.toFixed(1)}%`, {
            duration: 5000,
            style: {
              background: '#f59e0b',
              color: '#fff'
            }
          })
        }
      }
    } catch (err: any) {
      console.error('[useYLDStatus] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchStatus()
    
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(fetchStatus, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchStatus, autoRefresh, enabled, refreshInterval])

  return { 
    status, 
    loading, 
    error, 
    refetch: fetchStatus 
  }
}

// ==================== 新增：挖矿预检查 ====================

export function useMiningPreCheck() {
  const [checkResult, setCheckResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performCheck = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMiningPreCheck] 执行挖矿前检查...')
      const response = await productionApi.mining.preCheck()
      
      if (response.success && response.data) {
        console.log('[useMiningPreCheck] 检查结果:', response.data)
        setCheckResult(response.data)
        
        // 显示警告信息
        if (response.data.warnings && response.data.warnings.length > 0) {
          response.data.warnings.forEach((warning: string) => {
            toast(warning, { icon: '⚠️', duration: 4000 })
          })
        }
        
        // 显示错误信息
        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.forEach((error: string) => {
            toast.error(error, { duration: 5000 })
          })
        }
        
        return response.data
      }
    } catch (err: any) {
      console.error('[useMiningPreCheck] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setCheckResult(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    checkResult, 
    loading, 
    error, 
    performCheck 
  }
}

// ==================== 新增：产出率历史 ====================

export function useSessionRateHistory(sessionId: number | null, options?: { enabled?: boolean }) {
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchHistory = useCallback(async () => {
    if (!enabled || !sessionId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useSessionRateHistory] 获取产出率历史，会话ID:', sessionId)
      const response = await productionApi.mining.getSessionRateHistory(sessionId)
      
      if (response.success && response.data) {
        console.log('[useSessionRateHistory] 获取成功:', response.data)
        setHistory(response.data)
      }
    } catch (err: any) {
      console.error('[useSessionRateHistory] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setHistory(null)
    } finally {
      setLoading(false)
    }
  }, [sessionId, enabled])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { 
    history, 
    loading, 
    error, 
    refetch: fetchHistory 
  }
}

// ==================== 新增：批量停止所有会话 ====================

export function useStopAllSessions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stopAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useStopAllSessions] 停止所有会话...')
      const response = await productionApi.mining.stopAllSessions()
      
      if (response.success) {
        const data = response.data
        toast.success(`成功停止 ${data.stopped_count} 个会话`, {
          duration: 3000,
          icon: '⏹️'
        })
        
        if (data.total_collected > 0) {
          setTimeout(() => {
            toast.success(`共收取产出: ${data.total_collected}`, {
              duration: 4000,
              icon: '💰'
            })
          }, 1000)
        }
        
        return data
      } else {
        throw new Error(response.message || '批量停止失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    stopAll, 
    loading, 
    error 
  }
}

// ==================== 新增：YLD耗尽处理 ====================

export function useHandleYLDExhausted() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExhausted = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useHandleYLDExhausted] 处理YLD耗尽...')
      const response = await productionApi.yld.handleExhausted()
      
      if (response.success) {
        const data = response.data
        toast.success(data.message || 'YLD产量已耗尽，所有会话已停止', {
          duration: 5000,
          icon: '🛑'
        })
        
        if (data.total_settled > 0) {
          setTimeout(() => {
            toast(`共结算 ${data.sessions_stopped} 个会话，产出 ${data.total_settled} YLD`, {
              duration: 4000,
              icon: '💰'
            })
          }, 1000)
        }
        
        return data
      } else {
        throw new Error(response.message || '处理失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    handleExhausted, 
    loading, 
    error 
  }
}

// ==================== 新增：挖矿汇总信息 ====================

interface UseMiningSummaryOptions {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useMiningSummary(options?: UseMiningSummaryOptions) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    enabled = true,
    autoRefresh = true,
    refreshInterval = 30000 // 30秒
  } = options || {}

  const fetchSummary = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMiningSummary] 获取挖矿汇总...')
      
      // 先尝试调用汇总接口
      try {
        const response = await productionApi.mining.getSummary()
        
        if (response.success && response.data) {
          console.log('[useMiningSummary] 获取成功:', response.data)
          setSummary(response.data)
          
          // 检查粮食警告
          if (response.data.food_sustainability_hours < 2) {
            toast(`⚠️ 粮食仅可维持 ${response.data.food_sustainability_hours.toFixed(1)} 小时`, {
              icon: '🌾',
              duration: 5000,
              style: {
                background: '#f59e0b',
                color: '#fff'
              }
            })
          }
          return
        }
      } catch (apiError: any) {
        // 如果汇总接口不存在，使用备用方案
        console.log('[useMiningSummary] 汇总接口不可用，使用备用数据')
        
        // 构造模拟数据或使用其他接口组合
        const mockSummary = {
          active_sessions: {
            count: 0,
            sessions: [],
            total_hourly_output: 0,
            total_food_consumption: 0
          },
          resources: {
            iron: 0,
            stone: 0,
            wood: 0,
            food: 0,
            brick: 0,
            yld: 0
          },
          tools: {
            total: 0,
            in_use: 0,
            idle: 0,
            damaged: 0
          },
          food_sustainability_hours: 0,
          today_production: {
            total_output: 0,
            collection_count: 0
          },
          yld_status: {
            daily_limit: 208,
            remaining: 208,
            percentage_used: 0,
            is_exhausted: false
          }
        }
        
        setSummary(mockSummary)
      }
    } catch (err: any) {
      console.error('[useMiningSummary] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      
      // 设置默认数据避免页面崩溃
      setSummary({
        active_sessions: { count: 0, sessions: [], total_hourly_output: 0, total_food_consumption: 0 },
        resources: { iron: 0, stone: 0, wood: 0, food: 0, brick: 0, yld: 0 },
        tools: { total: 0, in_use: 0, idle: 0, damaged: 0 },
        food_sustainability_hours: 0,
        today_production: { total_output: 0, collection_count: 0 },
        yld_status: { daily_limit: 208, remaining: 208, percentage_used: 0, is_exhausted: false }
      })
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchSummary()
    
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(fetchSummary, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchSummary, autoRefresh, enabled, refreshInterval])

  return { 
    summary, 
    loading, 
    error, 
    refetch: fetchSummary 
  }
}

// ==================== 获取挖矿会话（保留原有） ====================

interface UseMiningSessionsOptions {
  status?: 'active' | 'paused' | 'completed'
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useMiningSessions(options?: UseMiningSessionsOptions) {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const { 
    status, 
    enabled = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30秒
  } = options || {}

  const fetchSessions = useCallback(async () => {
    if (!enabled) {
      setSessions([])
      setLoading(false)
      return
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMiningSessions] 获取挖矿会话...')
      
      const response = await productionApi.mining.getMySessions({
        status,
        is_active: status === 'active',
        page_size: 50
      })
      
      // 处理会话数据，确保字段兼容性
      const processedSessions = (response.results || []).map(session => ({
        ...session,
        // 统一输出字段
        total_output: session.total_output || session.accumulated_output,
        accumulated_output: session.accumulated_output || session.total_output,
        // 统一时间字段
        started_at: session.started_at || session.start_time,
        ended_at: session.ended_at || session.end_time,
        // 确保元数据存在
        metadata: session.metadata || {}
      }))
      
      setSessions(processedSessions)
      setStats(response.stats || response.active_stats || null)
      
      console.log(`[useMiningSessions] 获取成功，会话数：${processedSessions.length}`)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[useMiningSessions] 请求被取消')
        return
      }
      
      console.error('[useMiningSessions] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setSessions([])
      
      // 只对非预期错误显示提示
      if (!errorMsg.includes('没有') && !errorMsg.includes('不存在')) {
        toast.error(errorMsg, { duration: 4000 })
      }
    } finally {
      setLoading(false)
    }
  }, [status, enabled])

  useEffect(() => {
    fetchSessions()
    
    // 自动刷新
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(fetchSessions, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSessions, autoRefresh, enabled, refreshInterval])

  return { 
    sessions, 
    loading, 
    error, 
    stats, 
    refetch: fetchSessions 
  }
}

// ==================== 获取工具（保留原有） ====================

interface UseMyToolsOptions {
  tool_type?: 'pickaxe' | 'axe' | 'hoe'
  status?: 'normal' | 'damaged' | 'repairing'
  is_in_use?: boolean
  enabled?: boolean
}

export function useMyTools(options?: UseMyToolsOptions) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  const { tool_type, status, is_in_use, enabled = true } = options || {}

  const fetchTools = useCallback(async () => {
    if (!enabled) {
      setTools([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMyTools] 获取工具列表...')
      
      const response = await productionApi.tools.getMyTools({
        tool_type,
        status,
        is_in_use,
        page_size: 100,
        ordering: '-created_at'
      })
      
      // 处理工具数据，确保字段兼容性
      const processedTools = (response.results || []).map(tool => ({
        ...tool,
        // 统一耐久度字段
        current_durability: tool.current_durability ?? tool.durability ?? 0,
        durability: tool.durability ?? tool.current_durability ?? 0,
        // 确保状态字段
        is_in_use: tool.is_in_use ?? (tool.status === 'working')
      }))
      
      setTools(processedTools)
      setStats(response.stats || null)
      
      console.log(`[useMyTools] 获取成功，工具数：${processedTools.length}`)
    } catch (err: any) {
      console.error('[useMyTools] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setTools([])
    } finally {
      setLoading(false)
    }
  }, [tool_type, status, is_in_use, enabled])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  return { 
    tools, 
    loading, 
    error, 
    stats, 
    refetch: fetchTools 
  }
}

// ==================== 获取资源（保留原有并修复） ====================

interface UseMyResourcesOptions {
  enabled?: boolean
  useStats?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useMyResources(options?: UseMyResourcesOptions) {
  const [resources, setResources] = useState<ResourceBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any>(null)

  const { 
    enabled = true, 
    useStats = true,
    autoRefresh = false,
    refreshInterval = 60000 // 1分钟
  } = options || {}

  const fetchResources = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // 优先尝试使用新的统计接口
      if (useStats) {
        try {
          console.log('[useMyResources] 尝试使用统计接口...')
          const statsResponse = await productionApi.resources.getResourceStats()
          
          if (statsResponse.success && statsResponse.data) {
            const data = statsResponse.data
            setRawData(data)
            
            // 从统计数据中提取资源余额
            const balance: ResourceBalance = {
              wood: 0,
              iron: 0,
              stone: 0,
              yld: 0,
              grain: 0,  // 粮食
              seed: 0,
              brick: 0
            }
            
            // 处理资源数据
            if (data.resources) {
              Object.entries(data.resources).forEach(([key, resource]: [string, any]) => {
                const amount = safeParseFloat(resource.available ?? resource.amount)
                
                // 特别处理粮食字段（food/grain）
                if (key === 'food' || key === 'grain') {
                  balance.grain = amount
                  balance.food = amount  // 同时设置 food 字段保持兼容
                  console.log(`[useMyResources] 粮食数量: ${amount} (原始key: ${key})`)
                } else if (key in balance) {
                  balance[key as keyof ResourceBalance] = amount
                }
              })
            }
            
            // 如果没有找到粮食数据，尝试从钱包或其他地方查找
            if (balance.grain === 0 && data.wallet) {
              // 这里可以添加其他逻辑
              console.log('[useMyResources] 粮食数据未找到，检查wallet:', data.wallet)
            }
            
            console.log('[useMyResources] 资源余额:', balance)
            setResources(balance)
            return
          }
        } catch (statsError) {
          console.log('[useMyResources] 统计接口失败，尝试旧接口:', statsError)
        }
      }
      
      // 回退到旧接口
      console.log('[useMyResources] 使用旧接口...')
      const response = await productionApi.resources.getMyResources()
      
      if (response.results) {
        const balance: ResourceBalance = {
          wood: 0,
          iron: 0,
          stone: 0,
          yld: 0,
          grain: 0,
          seed: 0,
          brick: 0
        }
        
        response.results.forEach(resource => {
          const amount = safeParseFloat(resource.available_amount || resource.amount)
          
          // 处理粮食字段映射
          if (resource.resource_type === 'food' || resource.resource_type === 'grain') {
            balance.grain = amount
            balance.food = amount
            console.log(`[useMyResources] 粮食数量(旧接口): ${amount} (类型: ${resource.resource_type})`)
          } else if (resource.resource_type in balance) {
            balance[resource.resource_type as keyof ResourceBalance] = amount
          }
        })
        
        console.log('[useMyResources] 资源余额(旧接口):', balance)
        setResources(balance)
        setRawData(response)
      }
    } catch (err: any) {
      console.error('[useMyResources] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      
      // 设置默认值避免显示问题
      setResources({
        wood: 0,
        iron: 0,
        stone: 0,
        yld: 0,
        grain: 0,
        seed: 0,
        brick: 0
      })
    } finally {
      setLoading(false)
    }
  }, [enabled, useStats])

  useEffect(() => {
    fetchResources()
    
    // 自动刷新
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(fetchResources, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchResources, autoRefresh, enabled, refreshInterval])

  return { 
    resources, 
    loading, 
    error, 
    rawData,
    refetch: fetchResources 
  }
}

// ==================== 获取资源统计（保留原有） ====================

interface UseResourceStatsOptions {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useResourceStats(options?: UseResourceStatsOptions) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    enabled = true,
    autoRefresh = false,
    refreshInterval = 30000
  } = options || {}

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useResourceStats] 获取资源统计...')
      const response = await productionApi.resources.getResourceStats()
      
      if (response.success && response.data) {
        const data = response.data
        
        // 特别处理粮食字段
        if (data.resources) {
          // 如果有 food 字段但没有 grain 字段，创建映射
          if (data.resources.food && !data.resources.grain) {
            data.resources.grain = data.resources.food
          }
          // 如果有 grain 字段但没有 food 字段，创建映射
          else if (data.resources.grain && !data.resources.food) {
            data.resources.food = data.resources.grain
          }
        }
        
        console.log('[useResourceStats] 获取成功，资源统计:', data)
        setStats(data)
      }
    } catch (err: any) {
      console.error('[useResourceStats] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchStats()
    
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(fetchStats, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchStats, autoRefresh, enabled, refreshInterval])

  return { 
    stats, 
    loading, 
    error, 
    refetch: fetchStats 
  }
}

// ==================== 获取用户土地（保留原有） ====================

interface UseUserLandsOptions {
  enabled?: boolean
}

export function useUserLands(options?: UseUserLandsOptions) {
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchLands = useCallback(async () => {
    if (!enabled) {
      setLands([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useUserLands] 获取用户土地...')
      
      const response = await productionApi.lands.getUserLands()
      
      if (response.success && response.data) {
        setLands(response.data.results || [])
        console.log(`[useUserLands] 获取成功，土地数：${response.data.results?.length || 0}`)
      } else {
        setLands([])
      }
    } catch (err: any) {
      console.error('[useUserLands] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setLands([])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchLands()
  }, [fetchLands])

  return { 
    lands, 
    loading, 
    error, 
    refetch: fetchLands 
  }
}

// ==================== 开始自主挖矿（保留原有） ====================

export function useStartSelfMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startMining = useCallback(async (data: StartSelfMiningRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      // 前端验证
      if (!data.land_id) {
        throw new Error('请选择土地')
      }
      
      if (!data.tool_ids || data.tool_ids.length === 0) {
        throw new Error('请至少选择一个工具')
      }
      
      console.log('[useStartSelfMining] 开始挖矿:', data)
      
      const response = await productionApi.mining.startSelfMining(data)
      
      if (response.success) {
        // 成功提示
        toast.success(response.message || '开始挖矿成功！', {
          duration: 3000,
          icon: '⛏️'
        })
        
        // 如果有警告信息，延迟显示
        if (response.data?.warning) {
          setTimeout(() => {
            toast(response.data.warning, { 
              icon: '⚠️',
              duration: 5000 
            })
          }, 1000)
        }
        
        return response.data?.session || response.data
      } else {
        throw new Error(response.message || '开始挖矿失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      
      // 特殊处理粮食不足
      if (message.includes('粮食')) {
        toast.error(message, {
          duration: 5000,
          icon: '🌾',
          style: {
            background: '#f59e0b',
            color: '#fff'
          }
        })
      } else {
        toast.error(message)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    startMining, 
    loading, 
    error 
  }
}

// ==================== 合成工具（保留原有） ====================

export function useSynthesizeTool() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const synthesize = useCallback(async (data: SynthesizeToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      // 验证
      if (!data.tool_type) {
        throw new Error('请选择工具类型')
      }
      
      if (!data.quantity || data.quantity < 1) {
        throw new Error('请输入正确的数量')
      }
      
      if (data.quantity > 10) {
        throw new Error('一次最多合成10个')
      }
      
      console.log('[useSynthesizeTool] 合成工具:', data)
      
      const response = await productionApi.synthesis.synthesizeTool(data)
      
      if (response.success) {
        const toolName = response.data?.tool_display || data.tool_type
        toast.success(`成功合成 ${data.quantity} 个${toolName}！`, {
          duration: 3000,
          icon: '🔨'
        })
        return response.data
      } else {
        throw new Error(response.message || '合成失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    synthesize, 
    loading, 
    error 
  }
}

// ==================== 停止生产（保留原有） ====================

export function useStopProduction() {
  const [loading, setLoading] = useState(false)

  const stopProduction = useCallback(async (sessionId: number) => {
    try {
      setLoading(true)
      
      console.log('[useStopProduction] 停止生产，会话ID:', sessionId)
      
      const response = await productionApi.mining.stopProduction({
        session_id: sessionId
      })
      
      if (response.success) {
        toast.success('已停止生产', { icon: '⏹️' })
        
        // 如果有额外信息，显示
        if (response.data?.total_output) {
          setTimeout(() => {
            toast.success(`本次共产出: ${response.data.total_output}`, {
              duration: 4000,
              icon: '💰'
            })
          }, 1000)
        }
        
        // 如果有警告，显示
        if (response.data?.warnings?.length) {
          response.data.warnings.forEach((warning: string, index: number) => {
            setTimeout(() => {
              toast(warning, { icon: '⚠️', duration: 5000 })
            }, 2000 + index * 500)
          })
        }
        
        return response.data
      } else {
        throw new Error(response.message || '停止失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    stopProduction, 
    loading 
  }
}

// ==================== 收取产出（保留原有） ====================

export function useCollectOutput() {
  const [loading, setLoading] = useState(false)

  const collectOutput = useCallback(async (sessionId: number) => {
    try {
      setLoading(true)
      
      console.log('[useCollectOutput] 收取产出，会话ID:', sessionId)
      
      const response = await productionApi.mining.collectOutput({
        session_id: sessionId
      })
      
      if (response.success) {
        const data = response.data
        const amount = data?.net_output || data?.collected_amount || 0
        const resourceType = data?.resource_type || 'YLD'
        
        toast.success(`成功收取 ${amount} ${resourceType}！`, {
          duration: 3000,
          icon: '💰'
        })
        
        return data
      } else {
        throw new Error(response.message || '收取失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      
      // 特殊处理时间不足的错误
      if (message.includes('1小时') || message.includes('等待')) {
        toast.error(message, {
          duration: 5000,
          icon: '⏰'
        })
      } else {
        toast.error(message)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    collectOutput, 
    loading 
  }
}

// ==================== 检查粮食状态（保留原有） ====================

interface UseGrainStatusOptions {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useGrainStatus(options?: UseGrainStatusOptions) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    enabled = true, 
    autoRefresh = true, 
    refreshInterval = 5 * 60 * 1000  // 5分钟
  } = options || {}

  const checkStatus = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useGrainStatus] 检查粮食状态...')
      
      const response = await productionApi.stats.checkFoodStatus()
      
      if (response.success && response.data) {
        const data = response.data
        console.log('[useGrainStatus] 粮食状态:', data)
        
        setStatus(data)
        
        // 如果粮食不足，显示警告
        if (data.warning && data.hours_sustainable < 2) {
          toast(
            `粮食储备不足！仅可维持 ${data.hours_sustainable.toFixed(1)} 小时`, 
            { 
              icon: '⚠️',
              duration: 5000,
              style: {
                background: '#f59e0b',
                color: '#fff'
              }
            }
          )
        }
      }
    } catch (err: any) {
      console.error('[useGrainStatus] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    checkStatus()
    
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh && enabled) {
      intervalId = setInterval(checkStatus, refreshInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [checkStatus, autoRefresh, enabled, refreshInterval])

  return { 
    status, 
    loading, 
    error, 
    refetch: checkStatus 
  }
}

// ==================== 获取生产统计（保留原有） ====================

interface UseProductionStatsOptions {
  enabled?: boolean
}

export function useProductionStats(options?: UseProductionStatsOptions) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useProductionStats] 获取生产统计...')
      
      const response = await productionApi.stats.getProductionStats()
      
      if (response.success) {
        console.log('[useProductionStats] 获取成功:', response.data)
        setStats(response.data)
      }
    } catch (err: any) {
      console.error('[useProductionStats] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { 
    stats, 
    loading, 
    error, 
    refetch: fetchStats 
  }
}

// ==================== 获取可用土地（保留原有） ====================

interface UseAvailableLandsOptions {
  ownership?: 'mine' | 'others' | 'all'
  land_type?: string
  has_tools?: boolean
  enabled?: boolean
}

export function useAvailableLands(options?: UseAvailableLandsOptions) {
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const { ownership = 'all', land_type, has_tools, enabled = true } = options || {}

  const fetchLands = useCallback(async () => {
    if (!enabled) {
      setLands([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useAvailableLands] 获取可用土地...')
      
      const response = await productionApi.lands.getAvailableLands({
        ownership,
        land_type,
        has_tools,
        page_size: 100
      })
      
      if (response.success && response.data) {
        setLands(response.data.results || [])
        setPagination({
          count: response.data.count,
          total_pages: response.data.total_pages,
          current_page: response.data.current_page,
          page_size: response.data.page_size
        })
        console.log(`[useAvailableLands] 获取成功，土地数：${response.data.results?.length || 0}`)
      } else {
        setLands([])
      }
    } catch (err: any) {
      console.error('[useAvailableLands] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setLands([])
    } finally {
      setLoading(false)
    }
  }, [ownership, land_type, has_tools, enabled])

  useEffect(() => {
    fetchLands()
  }, [fetchLands])

  return { 
    lands, 
    loading, 
    error, 
    pagination,
    refetch: fetchLands 
  }
}

// ==================== 获取土地挖矿详情（保留原有） ====================

export function useLandMiningInfo(landId: number | null, options?: { enabled?: boolean }) {
  const [landInfo, setLandInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchLandInfo = useCallback(async () => {
    if (!enabled || !landId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('[useLandMiningInfo] 获取土地挖矿详情，ID:', landId)
      
      const response = await productionApi.lands.getLandMiningInfo(landId)
      
      if (response.success && response.data) {
        console.log('[useLandMiningInfo] 获取成功:', response.data)
        setLandInfo(response.data)
      } else {
        setLandInfo(null)
      }
    } catch (err: any) {
      console.error('[useLandMiningInfo] Error:', err)
      const errorMsg = formatErrorMessage(err)
      setError(errorMsg)
      setLandInfo(null)
    } finally {
      setLoading(false)
    }
  }, [landId, enabled])

  useEffect(() => {
    fetchLandInfo()
  }, [fetchLandInfo])

  return { 
    landInfo, 
    loading, 
    error, 
    refetch: fetchLandInfo 
  }
}

// ==================== 带工具打工（保留原有） ====================

export function useStartHiredMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startWithTools = useCallback(async (data: StartHiredMiningWithToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useStartHiredMining] 带工具打工:', data)
      
      const response = await productionApi.hiring.startWithTools(data)
      
      if (response.success) {
        toast.success('开始带工具打工', { icon: '🔧' })
        return response.data?.session || response.data
      } else {
        throw new Error(response.message || '开始打工失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startWithoutTools = useCallback(async (data: StartHiredMiningWithoutToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useStartHiredMining] 无工具打工:', data)
      
      const response = await productionApi.hiring.startWithoutTools(data)
      
      if (response.success) {
        toast.success('开始无工具打工', { icon: '👷' })
        return response.data?.session || response.data
      } else {
        throw new Error(response.message || '开始打工失败')
      }
    } catch (err: any) {
      const message = formatErrorMessage(err)
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { 
    startWithTools, 
    startWithoutTools, 
    loading, 
    error 
  }
}
