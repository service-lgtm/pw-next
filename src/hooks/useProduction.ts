// src/hooks/useProduction.ts
// 生产系统 Hooks - 修复分页问题完整版
//
// 修复说明：
// 1. 修复了所有 "Cannot read properties of undefined" 错误
// 2. 修复分页问题：将默认 page_size 从 20 改为 200
// 3. 正确处理两种不同的 API 响应格式
// 4. 添加分页检测和警告
//
// 修改历史：
// - 2025-01-30: 修复分页问题，确保获取所有工具和土地数据
//
// 关联文件：
// - src/lib/api/production.ts: API 调用
// - src/types/production.ts: 类型定义
// - src/app/mining/page.tsx: 主页面使用
// - src/app/mining/MiningSessions.tsx: 会话管理使用

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { productionApi } from '@/lib/api/production'
import toast from 'react-hot-toast'
import type {
  Tool,
  UserResource,
  MiningSession,
  StartSelfMiningRequest,
  SynthesizeToolRequest,
  CollectOutputRequest,
  StopProductionRequest,
  ResourceBalance
} from '@/types/production'
import type { Land } from '@/types/assets'

// ==================== 工具管理（修复分页） ====================

export function useMyTools(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 30000 } = options || {}
  
  const [tools, setTools] = useState<Tool[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchTools = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useMyTools] Fetching tools with page_size: 200')
      
      // 初始请求
      let allTools: Tool[] = []
      let currentPage = 1
      let hasNext = true
      let totalStats = null
      
      // 循环获取所有页面
      while (hasNext && currentPage <= 10) { // 最多获取10页，防止无限循环
        console.log(`[useMyTools] Fetching page ${currentPage}`)
        
        const response = await productionApi.tools.getMyTools({
          page: currentPage,
          page_size: 200  // 尝试200，但后端可能限制为20
        })
        
        console.log(`[useMyTools] Page ${currentPage} response:`, {
          count: response?.count,
          resultsLength: response?.results?.length,
          next: response?.next
        })
        
        if (response?.results) {
          allTools = [...allTools, ...response.results]
          totalStats = response.stats // 使用最新的统计信息
          hasNext = !!response.next
          currentPage++
        } else {
          hasNext = false
        }
      }
      
      setTools(allTools)
      setStats(totalStats)
      
      console.log(`[useMyTools] 成功获取所有工具:`, {
        总数: totalStats?.total_count || allTools.length,
        实际获取: allTools.length,
        页数: currentPage - 1
      })
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useMyTools] Error:', err)
      setError(err?.message || '获取工具失败')
      if (!tools) setTools([])
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, tools])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchTools()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchTools()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchTools])
  
  return {
    tools,
    loading,
    error,
    stats,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchTools()
    }
  }
}

// ==================== 资源管理 ====================

export function useMyResources(options?: {
  enabled?: boolean
  useStats?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { 
    enabled = true, 
    useStats = false, 
    autoRefresh = false, 
    refreshInterval = 60000 
  } = options || {}
  
  const [resources, setResources] = useState<ResourceBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchResources = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useMyResources] Fetching resources, useStats:', useStats)
      
      if (useStats) {
        const response = await productionApi.resources.getResourceStats()
        console.log('[useMyResources] Stats response:', response)
        
        const data = response?.data || response
        if (data?.resources) {
          const balance: ResourceBalance = {
            wood: data.resources.wood?.available || 0,
            iron: data.resources.iron?.available || 0,
            stone: data.resources.stone?.available || 0,
            yld: data.wallet?.yld_balance || 0,
            grain: data.resources.food?.available || data.resources.grain?.available || 0,
            food: data.resources.food?.available || data.resources.grain?.available || 0,
            seed: data.resources.seed?.available || 0,
            brick: data.resources.brick?.available || 0
          }
          setResources(balance)
        } else {
          console.warn('[useMyResources] Unexpected stats response format:', response)
          if (!resources) {
            setResources({
              wood: 0, iron: 0, stone: 0, yld: 0,
              grain: 0, food: 0, seed: 0, brick: 0
            })
          }
        }
      } else {
        const response = await productionApi.resources.getMyResources()
        console.log('[useMyResources] Resources response:', response)
        
        if (response?.results) {
          const balance: ResourceBalance = {
            wood: 0, iron: 0, stone: 0, yld: 0,
            grain: 0, food: 0, seed: 0, brick: 0
          }
          
          response.results.forEach((resource: any) => {
            const amount = parseFloat(resource.available_amount || resource.amount || '0')
            if (resource.resource_type === 'food' || resource.resource_type === 'grain') {
              balance.grain = amount
              balance.food = amount
            } else if (resource.resource_type in balance) {
              balance[resource.resource_type as keyof ResourceBalance] = amount
            }
          })
          
          setResources(balance)
        } else {
          console.warn('[useMyResources] Unexpected response format:', response)
          if (!resources) {
            setResources({
              wood: 0, iron: 0, stone: 0, yld: 0,
              grain: 0, food: 0, seed: 0, brick: 0
            })
          }
        }
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useMyResources] Error:', err)
      setError(err?.message || '获取资源失败')
      if (!resources) {
        setResources({
          wood: 0, iron: 0, stone: 0, yld: 0,
          grain: 0, food: 0, seed: 0, brick: 0
        })
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, useStats, resources])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchResources()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchResources()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchResources])
  
  return {
    resources,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchResources()
    }
  }
}

// ==================== 资源统计 ====================

export function useResourceStats(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchStats = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useResourceStats] Fetching stats...')
      const response = await productionApi.resources.getResourceStats()
      console.log('[useResourceStats] Raw response:', response)
      
      setStats(response)
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useResourceStats] Error:', err)
      setError(err?.message || '获取资源统计失败')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchStats()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchStats()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchStats])
  
  return {
    stats,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchStats()
    }
  }
}

// ==================== 挖矿会话管理（修复分页） ====================

export function useMiningSessions(options?: {
  status?: 'active' | 'paused' | 'completed'
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { 
    status = 'active', 
    enabled = true, 
    autoRefresh = false, 
    refreshInterval = 30000 
  } = options || {}
  
  const [sessions, setSessions] = useState<MiningSession[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchSessions = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useMiningSessions] Fetching sessions with page_size: 200')
      
      // 重要修复：使用 page_size: 200
      const response = await productionApi.mining.getMySessions({
        status,
        page_size: 200  // 从默认的 20 改为 200
      })
      
      console.log('[useMiningSessions] Raw response:', response)
      
      if (response?.results) {
        setSessions(response.results)
        
        // 添加警告
        if (response.next) {
          console.warn('[useMiningSessions] 警告：会话数量超过200个')
          toast.error('会话数量过多，部分会话可能未显示')
        }
        
        console.log(`[useMiningSessions] 成功获取 ${response.results.length} 个会话`)
      } else if (Array.isArray(response)) {
        setSessions(response)
      } else {
        console.warn('[useMiningSessions] Unexpected response format:', response)
        setSessions([])
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useMiningSessions] Error:', err)
      setError(err?.message || '获取会话失败')
      if (!sessions) setSessions([])
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, status, sessions])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchSessions()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchSessions()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchSessions])
  
  return {
    sessions,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchSessions()
    }
  }
}

// ==================== 土地相关 Hooks（修复分页） ====================

export function useUserLands(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchLands = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useUserLands] Fetching lands with page_size: 200')
      
      // 重要修复：使用 page_size: 200
      const response = await productionApi.lands.getAvailableLands({
        ownership: 'mine',
        page_size: 200  // 从默认的 20 改为 200
      })
      
      console.log('[useUserLands] Response from getAvailableLands:', response)
      
      if (response?.data?.results) {
        setLands(response.data.results)
        
        // 添加警告
        if (response.data.next) {
          console.warn('[useUserLands] 警告：土地数量超过200个')
          toast.error('土地数量过多，部分土地可能未显示')
        }
        
        console.log(`[useUserLands] 成功获取 ${response.data.results.length} 块土地`)
      } else if (response?.results) {
        setLands(response.results)
      } else if (Array.isArray(response)) {
        setLands(response)
      } else {
        console.warn('[useUserLands] Unexpected response format:', response)
        setLands([])
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useUserLands] Error fetching lands:', err)
      
      // 尝试备用接口
      try {
        console.log('[useUserLands] Trying alternate endpoint getUserLands...')
        const alternateResponse = await productionApi.lands.getUserLands()
        
        if (alternateResponse?.data?.results) {
          setLands(alternateResponse.data.results)
        } else if (alternateResponse?.results) {
          setLands(alternateResponse.results)
        } else {
          setLands([])
        }
      } catch (alternateErr) {
        console.error('[useUserLands] All attempts failed:', alternateErr)
        setLands([])
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchLands()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchLands()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchLands])
  
  return {
    lands,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchLands()
    }
  }
}

// ==================== 挖矿操作 ====================

export function useStartSelfMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const startMining = useCallback(async (data: StartSelfMiningRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.startSelfMining(data)
      toast.success('挖矿已开始！')
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.detail || 
                          err?.message || 
                          '开始挖矿失败'
      setError(errorMessage)
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

export function useStopProduction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const stopProduction = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.stopProduction({
        session_id: sessionId
      })
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '停止生产失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    stopProduction,
    loading,
    error
  }
}

export function useCollectOutput() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const collectOutput = useCallback(async (sessionId: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.collectOutput({
        session_id: sessionId
      })
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '收取失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    collectOutput,
    loading,
    error
  }
}

export function useStopAllSessions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const stopAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.stopAllSessions()
      const stoppedCount = response?.data?.stopped_count || response?.stopped_count || 0
      toast.success(`已停止 ${stoppedCount} 个会话`)
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '批量停止失败'
      setError(errorMessage)
      toast.error(errorMessage)
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

// ==================== 合成系统 ====================

export function useSynthesizeTool() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const synthesize = useCallback(async (data: SynthesizeToolRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.synthesis.synthesizeTool(data)
      toast.success(`成功合成 ${data.quantity} 个工具！`)
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '合成失败'
      setError(errorMessage)
      toast.error(errorMessage)
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

// ==================== 粮食状态 ====================

export function useGrainStatus(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchStatus = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useGrainStatus] Fetching status...')
      const response = await productionApi.stats.checkFoodStatus()
      console.log('[useGrainStatus] Raw response:', response)
      
      const data = response?.data || response
      setStatus(data)
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useGrainStatus] Error:', err)
      setError(err?.message || '获取粮食状态失败')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchStatus()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchStatus()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchStatus])
  
  return {
    status,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchStatus()
    }
  }
}

// ==================== YLD系统监控 ====================

export function useYLDStatus(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchStatus = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useYLDStatus] Fetching status...')
      const response = await productionApi.yld.getSystemStatus()
      console.log('[useYLDStatus] Raw response:', response)
      
      const data = response?.data || response
      setStatus(data)
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useYLDStatus] Error:', err)
      setError(err?.message || '获取YLD状态失败')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchStatus()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchStatus()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchStatus])
  
  return {
    status,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchStatus()
    }
  }
}

// ==================== 挖矿预检查 ====================

export function useMiningPreCheck() {
  const [checkResult, setCheckResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const performCheck = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.preCheck()
      const data = response?.data || response
      setCheckResult(data)
      return data
    } catch (err: any) {
      console.error('[useMiningPreCheck] Error:', err)
      setError(err?.message || '预检查失败')
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

// ==================== 挖矿汇总 ====================

export function useMiningSummary(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const lastFetchRef = useRef<number>(0)
  const hasFetchedRef = useRef(false)
  
  const getDefaultSummary = () => ({
    active_sessions: {
      count: 0,
      sessions: [],
      total_hourly_output: 0,
      total_food_consumption: 0,
      total_pending_rewards: 0
    },
    resources: {
      iron: 0,
      stone: 0,
      wood: 0,
      food: 0,
      grain: 0,
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
      total: 0,
      distributed: { amount: 0 },
      pending: { amount: 0, hours: 0 }
    },
    yld_status: {
      daily_limit: 208,
      remaining: 208,
      percentage_used: 0,
      is_exhausted: false,
      current_hourly_rate: 0
    }
  })
  
  const fetchSummary = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    const now = Date.now()
    if (now - lastFetchRef.current < 10000) {
      console.log('[useMiningSummary] Skipping - too frequent')
      return
    }
    
    fetchingRef.current = true
    lastFetchRef.current = now
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useMiningSummary] Fetching summary...')
      const response = await productionApi.mining.getSummary()
      console.log('[useMiningSummary] Raw response:', response)
      
      const data = response?.data || response
      if (data) {
        setSummary(data)
      } else {
        setSummary(getDefaultSummary())
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useMiningSummary] Error:', err)
      if (!summary) {
        setSummary(getDefaultSummary())
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, summary])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current && !summary) {
      fetchSummary()
    }
  }, [enabled])
  
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        lastFetchRef.current = 0
        fetchSummary()
      }
    }, Math.max(refreshInterval, 60000))
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval])
  
  return {
    summary,
    loading,
    error,
    refetch: () => {
      lastFetchRef.current = 0
      hasFetchedRef.current = false
      return fetchSummary()
    }
  }
}

// ==================== 会话产出率历史 ====================

export function useSessionRateHistory(sessionId: number | null, options?: {
  enabled?: boolean
}) {
  const { enabled = true } = options || {}
  
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchHistory = useCallback(async () => {
    if (!enabled || !sessionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.mining.getSessionRateHistory(sessionId)
      const data = response?.data || response
      setHistory(data)
    } catch (err: any) {
      console.error('[useSessionRateHistory] Error:', err)
      setError(err?.message || '获取历史失败')
    } finally {
      setLoading(false)
    }
  }, [enabled, sessionId])
  
  useEffect(() => {
    if (enabled && sessionId) {
      fetchHistory()
    }
  }, [enabled, sessionId, fetchHistory])
  
  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  }
}

// ==================== 其他可用土地 ====================

export function useAvailableLands(options?: {
  enabled?: boolean
}) {
  const { enabled = true } = options || {}
  
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchLands = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (productionApi.lands?.getAvailableLands) {
        const response = await productionApi.lands.getAvailableLands({
          page_size: 200  // 修复：增加 page_size
        })
        
        if (response?.results) {
          setLands(response.results)
        } else if (response?.data?.results) {
          setLands(response.data.results)
        } else if (response?.data && Array.isArray(response.data)) {
          setLands(response.data)
        } else {
          setLands([])
        }
      } else {
        setLands([])
      }
    } catch (err: any) {
      console.error('[useAvailableLands] Error:', err)
      setLands([])
    } finally {
      setLoading(false)
    }
  }, [enabled])
  
  useEffect(() => {
    if (enabled) {
      fetchLands()
    }
  }, [enabled, fetchLands])
  
  return {
    lands,
    loading,
    error,
    refetch: fetchLands
  }
}

export function useLandMiningInfo(landId: string | null, options?: {
  enabled?: boolean
}) {
  const { enabled = true } = options || {}
  
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchInfo = useCallback(async () => {
    if (!enabled || !landId) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (productionApi.lands?.getLandMiningInfo) {
        const response = await productionApi.lands.getLandMiningInfo(landId)
        const data = response?.data || response
        setInfo(data)
      } else {
        setInfo(null)
      }
    } catch (err: any) {
      console.error('[useLandMiningInfo] Error:', err)
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [enabled, landId])
  
  useEffect(() => {
    if (enabled && landId) {
      fetchInfo()
    }
  }, [enabled, landId, fetchInfo])
  
  return {
    info,
    loading,
    error,
    refetch: fetchInfo
  }
}

export function useHandleYLDExhausted() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleExhausted = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.yld.handleExhausted()
      toast.success('YLD耗尽处理完成')
      return response
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || '处理失败'
      setError(errorMessage)
      toast.error(errorMessage)
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

// ==================== 待收取收益查询 ====================

export function useCollectPending(options?: {
  resourceType?: string
  enabled?: boolean
}) {
  const { resourceType, enabled = true } = options || {}
  
  const [pendingData, setPendingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchPending = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useCollectPending] Fetching pending rewards...')
      
      const params = resourceType ? { resource_type: resourceType } : {}
      const response = await productionApi.mining.getCollectPending(params)
      
      console.log('[useCollectPending] Response:', response)
      
      const data = response?.data || response
      setPendingData(data)
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useCollectPending] Error:', err)
      setError(err?.message || '获取待收取收益失败')
      
      if (!pendingData) {
        setPendingData({
          total_pending: 0,
          sessions: [],
          can_collect: false,
          summary: {
            active_sessions: 0,
            total_hours_settled: 0
          }
        })
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, resourceType, pendingData])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchPending()
    }
  }, [enabled])
  
  return {
    pendingData,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchPending()
    }
  }
}

// ==================== 小时结算状态查询 ====================

export function useHourlySettlement(options?: {
  hours?: number
  resourceType?: string
  enabled?: boolean
}) {
  const { hours = 24, resourceType = 'yld', enabled = true } = options || {}
  
  const [settlementData, setSettlementData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchSettlement = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useHourlySettlement] Fetching settlement status...')
      
      const response = await productionApi.mining.getHourlySettlement({ 
        hours, 
        resource_type: resourceType 
      })
      
      console.log('[useHourlySettlement] Response:', response)
      
      const data = response?.data || response
      setSettlementData(data)
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useHourlySettlement] Error:', err)
      setError(err?.message || '获取结算状态失败')
      
      if (!settlementData) {
        setSettlementData({
          resource_type: resourceType,
          snapshots: [],
          current_hour: null,
          user_settlements: [],
          query_hours: hours
        })
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, hours, resourceType, settlementData])
  
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchSettlement()
    }
  }, [enabled])
  
  return {
    settlementData,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchSettlement()
    }
  }
}
