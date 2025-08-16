// src/hooks/useProduction.ts
// 生产系统 Hooks - 完整修复版
//
// 文件说明：
// 1. 包含所有生产系统相关的 React Hooks
// 2. 修复了API路径问题和循环请求问题
// 3. 提供统一的数据获取和状态管理
//
// 关联文件：
// - src/lib/api/production.ts: API 调用
// - src/types/production.ts: 类型定义
// - src/app/mining/page.tsx: 主页面使用
// - src/app/mining/MiningSessions.tsx: 会话管理使用
//
// 修复历史：
// - 2024-12: 修复循环请求问题
// - 2024-12: 修复API路径错误
// - 2024-12: 移除对不存在的 useMiningLands 的依赖

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

// ==================== 工具管理 ====================

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
 
 const fetchTools = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.tools.getMyTools({
       page_size: 100
     })
     
     setTools(response.results)
     setStats(response.stats)
   } catch (err: any) {
     console.error('[useMyTools] Error:', err)
     setError(err?.message || '获取工具失败')
   } finally {
     setLoading(false)
   }
 }, [enabled])
 
 useEffect(() => {
   if (enabled) {
     fetchTools()
   }
 }, [enabled, fetchTools])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchTools, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchTools])
 
 return {
   tools,
   loading,
   error,
   stats,
   refetch: fetchTools
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
 
 const fetchResources = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     if (useStats) {
       const response = await productionApi.resources.getResourceStats()
       if (response?.data?.resources) {
         const balance: ResourceBalance = {
           wood: response.data.resources.wood?.available || 0,
           iron: response.data.resources.iron?.available || 0,
           stone: response.data.resources.stone?.available || 0,
           yld: response.data.wallet?.yld_balance || 0,
           grain: response.data.resources.food?.available || response.data.resources.grain?.available || 0,
           food: response.data.resources.food?.available || response.data.resources.grain?.available || 0,
           seed: response.data.resources.seed?.available || 0,
           brick: response.data.resources.brick?.available || 0
         }
         setResources(balance)
       }
     } else {
       const response = await productionApi.resources.getMyResources()
       if (response?.results) {
         const balance: ResourceBalance = {
           wood: 0,
           iron: 0,
           stone: 0,
           yld: 0,
           grain: 0,
           food: 0,
           seed: 0,
           brick: 0
         }
         
         response.results.forEach(resource => {
           const amount = parseFloat(resource.available_amount || resource.amount || '0')
           if (resource.resource_type === 'food' || resource.resource_type === 'grain') {
             balance.grain = amount
             balance.food = amount
           } else if (resource.resource_type in balance) {
             balance[resource.resource_type as keyof ResourceBalance] = amount
           }
         })
         
         setResources(balance)
       }
     }
   } catch (err: any) {
     console.error('[useMyResources] Error:', err)
     setError(err?.message || '获取资源失败')
   } finally {
     setLoading(false)
   }
 }, [enabled, useStats])
 
 useEffect(() => {
   if (enabled) {
     fetchResources()
   }
 }, [enabled, fetchResources])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchResources, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchResources])
 
 return {
   resources,
   loading,
   error,
   refetch: fetchResources
 }
}

export function useResourceStats(options?: {
 enabled?: boolean
 autoRefresh?: boolean
 refreshInterval?: number
}) {
 const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
 
 const [stats, setStats] = useState<any>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 
 const fetchStats = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.resources.getResourceStats()
     setStats(response)
   } catch (err: any) {
     console.error('[useResourceStats] Error:', err)
     setError(err?.message || '获取资源统计失败')
   } finally {
     setLoading(false)
   }
 }, [enabled])
 
 useEffect(() => {
   if (enabled) {
     fetchStats()
   }
 }, [enabled, fetchStats])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchStats, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchStats])
 
 return {
   stats,
   loading,
   error,
   refetch: fetchStats
 }
}

// ==================== 挖矿会话管理 ====================

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
 
 const fetchSessions = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.mining.getMySessions({
       status,
       page_size: 100
     })
     
     setSessions(response.results)
   } catch (err: any) {
     console.error('[useMiningSessions] Error:', err)
     setError(err?.message || '获取会话失败')
   } finally {
     setLoading(false)
   }
 }, [enabled, status])
 
 useEffect(() => {
   if (enabled) {
     fetchSessions()
   }
 }, [enabled, fetchSessions])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchSessions, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchSessions])
 
 return {
   sessions,
   loading,
   error,
   refetch: fetchSessions
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
     toast.success(`已停止 ${response.data.stopped_count} 个会话`)
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
 
 const fetchStatus = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.stats.checkFoodStatus()
     setStatus(response.data)
   } catch (err: any) {
     console.error('[useGrainStatus] Error:', err)
     setError(err?.message || '获取粮食状态失败')
   } finally {
     setLoading(false)
   }
 }, [enabled])
 
 useEffect(() => {
   if (enabled) {
     fetchStatus()
   }
 }, [enabled, fetchStatus])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchStatus, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchStatus])
 
 return {
   status,
   loading,
   error,
   refetch: fetchStatus
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
 
 const fetchStatus = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.yld.getSystemStatus()
     setStatus(response.data)
   } catch (err: any) {
     console.error('[useYLDStatus] Error:', err)
     setError(err?.message || '获取YLD状态失败')
   } finally {
     setLoading(false)
   }
 }, [enabled])
 
 useEffect(() => {
   if (enabled) {
     fetchStatus()
   }
 }, [enabled, fetchStatus])
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchStatus, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchStatus])
 
 return {
   status,
   loading,
   error,
   refetch: fetchStatus
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
     setCheckResult(response.data)
     return response.data
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

// ==================== 挖矿汇总（修复循环请求） ====================

export function useMiningSummary(options?: {
 enabled?: boolean
 autoRefresh?: boolean
 refreshInterval?: number
}) {
 const { enabled = true, autoRefresh = false, refreshInterval = 30000 } = options || {}
 
 const [summary, setSummary] = useState<any>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const fetchingRef = useRef(false)
 const lastFetchRef = useRef<number>(0)
 
 const fetchSummary = useCallback(async () => {
   if (!enabled) return
   
   // 防止重复请求
   const now = Date.now()
   if (fetchingRef.current || (now - lastFetchRef.current < 5000)) {
     console.log('[useMiningSummary] Skipping request - too frequent')
     return
   }
   
   fetchingRef.current = true
   lastFetchRef.current = now
   setLoading(true)
   setError(null)
   
   try {
     const response = await productionApi.mining.getSummary()
     setSummary(response.data)
   } catch (err: any) {
     console.error('[useMiningSummary] Error:', err)
     // 不设置错误，使用默认数据
     setSummary({
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
     })
   } finally {
     setLoading(false)
     fetchingRef.current = false
   }
 }, [enabled])
 
 // 初始加载
 useEffect(() => {
   if (enabled && !summary) {
     fetchSummary()
   }
 }, [enabled]) // 移除 fetchSummary 依赖，避免循环
 
 // 自动刷新
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(() => {
     if (!fetchingRef.current) {
       fetchSummary()
     }
   }, refreshInterval)
   
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchSummary])
 
 return {
   summary,
   loading,
   error,
   refetch: fetchSummary
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
     setHistory(response.data)
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

// ==================== 土地相关 ====================

export function useUserLands(options?: {
 enabled?: boolean
 autoRefresh?: boolean
 refreshInterval?: number
}) {
 const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
 
 const [lands, setLands] = useState<any[]>([])
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 
 const fetchLands = useCallback(async () => {
   if (!enabled) return
   
   setLoading(true)
   setError(null)
   
   try {
     // 调用获取用户土地的 API
     // 如果 productionApi.lands 不存在，可以使用其他合适的 API
     // 这里提供一个备用方案
     const response = await fetch('/api/production/lands/user', {
       headers: {
         'Content-Type': 'application/json',
       }
     })
     
     if (!response.ok) {
       throw new Error('获取土地失败')
     }
     
     const data = await response.json()
     setLands(data.results || [])
   } catch (err: any) {
     console.error('[useUserLands] Error:', err)
     setError(err?.message || '获取土地失败')
     // 设置默认空数组，避免页面出错
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
 
 useEffect(() => {
   if (!autoRefresh || !enabled) return
   
   const interval = setInterval(fetchLands, refreshInterval)
   return () => clearInterval(interval)
 }, [autoRefresh, enabled, refreshInterval, fetchLands])
 
 return {
   lands,
   loading,
   error,
   refetch: fetchLands
 }
}

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
     // 调用获取可用土地的 API
     const response = await fetch('/api/production/lands/available', {
       headers: {
         'Content-Type': 'application/json',
       }
     })
     
     if (!response.ok) {
       throw new Error('获取可用土地失败')
     }
     
     const data = await response.json()
     setLands(data.results || [])
   } catch (err: any) {
     console.error('[useAvailableLands] Error:', err)
     setError(err?.message || '获取可用土地失败')
     // 设置默认空数组
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
     // 调用获取土地挖矿信息的 API
     const response = await fetch(`/api/production/lands/${landId}/mining-info`, {
       headers: {
         'Content-Type': 'application/json',
       }
     })
     
     if (!response.ok) {
       throw new Error('获取土地挖矿信息失败')
     }
     
     const data = await response.json()
     setInfo(data)
   } catch (err: any) {
     console.error('[useLandMiningInfo] Error:', err)
     setError(err?.message || '获取土地挖矿信息失败')
     // 设置默认信息
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
