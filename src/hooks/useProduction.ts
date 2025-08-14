// src/hooks/useProduction.ts
// 挖矿生产系统 Hook
//
// 文件说明：
// 1. 本文件提供挖矿生产相关的数据获取和操作 Hook
// 2. 包括挖矿会话、工具、资源、合成等
// 3. 自动处理加载状态、错误处理和数据缓存
//
// 关联文件：
// - src/lib/api/production.ts: 生产系统 API 接口
// - src/types/production.ts: 生产系统类型定义
// - src/app/mining/page.tsx: 挖矿页面使用这些 Hook

import { useState, useEffect, useCallback } from 'react'
import { productionApi } from '@/lib/api/production'
import { ApiError } from '@/lib/api'
import type {
  MiningSession,
  Tool,
  ResourceBalance,
  StartSelfMiningRequest,
  StartHiredMiningWithToolRequest,
  StartHiredMiningWithoutToolRequest,
  SynthesizeToolRequest
} from '@/types/production'
import toast from 'react-hot-toast'

// ==================== 获取我的挖矿会话 ====================
export function useMiningSessions(status?: 'active' | 'paused' | 'completed') {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.mining.getMySessions({
        status,
        page_size: 50
      })
      
      setSessions(response.results)
      setStats(response.stats)
    } catch (err) {
      console.error('[useMiningSessions] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { sessions, loading, error, stats, refetch: fetchSessions }
}

// ==================== 获取我的工具 ====================
export function useMyTools(filters?: {
  tool_type?: 'pickaxe' | 'axe' | 'hoe'
  status?: 'idle' | 'working' | 'damaged'
}) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.tools.getMyTools({
        ...filters,
        page_size: 100
      })
      
      setTools(response.results)
      setStats(response.stats)
    } catch (err) {
      console.error('[useMyTools] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [filters?.tool_type, filters?.status])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  return { tools, loading, error, stats, refetch: fetchTools }
}

// ==================== 获取我的资源 ====================
export function useMyResources() {
  const [resources, setResources] = useState<ResourceBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.resources.getMyResources()
      
      if (response.success) {
        setResources(response.data.balance)
      }
    } catch (err) {
      console.error('[useMyResources] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return { resources, loading, error, refetch: fetchResources }
}

// ==================== 获取可用土地 ====================
export function useAvailableLands(ownership: 'mine' | 'others' | 'all' = 'all') {
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLands = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.lands.getAvailableLands({
        ownership,
        page_size: 100
      })
      
      setLands(response.results)
    } catch (err) {
      console.error('[useAvailableLands] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [ownership])

  useEffect(() => {
    fetchLands()
  }, [fetchLands])

  return { lands, loading, error, refetch: fetchLands }
}

// ==================== 开始自主挖矿 ====================
export function useStartSelfMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startMining = useCallback(async (data: StartSelfMiningRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.mining.startSelfMining(data)
      
      if (response.success) {
        toast.success(response.message || '开始挖矿成功')
        if (response.data.warning) {
          toast(response.data.warning, { icon: '⚠️' })
        }
        return response.data.session
      } else {
        throw new Error(response.message || '开始挖矿失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { startMining, loading, error }
}

// ==================== 开始打工挖矿 ====================
export function useStartHiredMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startWithTool = useCallback(async (data: StartHiredMiningWithToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.hiring.startWithTool(data)
      
      if (response.success) {
        toast.success('开始带工具打工')
        return response.data.session
      } else {
        throw new Error(response.message || '开始打工失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startWithoutTool = useCallback(async (data: StartHiredMiningWithoutToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.hiring.startWithoutTool(data)
      
      if (response.success) {
        toast.success('开始无工具打工')
        return response.data.session
      } else {
        throw new Error(response.message || '开始打工失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { startWithTool, startWithoutTool, loading, error }
}

// ==================== 合成工具 ====================
export function useSynthesizeTool() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const synthesize = useCallback(async (data: SynthesizeToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.synthesis.synthesizeTool(data)
      
      if (response.success) {
        toast.success(`成功合成 ${data.quantity} 个工具`)
        return response.data
      } else {
        throw new Error(response.message || '合成失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { synthesize, loading, error }
}

// ==================== 停止生产 ====================
export function useStopProduction() {
  const [loading, setLoading] = useState(false)

  const stopProduction = useCallback(async (sessionId: number) => {
    try {
      setLoading(true)
      
      const response = await productionApi.mining.stopProduction({
        session_id: sessionId
      })
      
      if (response.success) {
        toast.success('已停止生产')
        return response.data
      } else {
        throw new Error(response.message || '停止失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { stopProduction, loading }
}

// ==================== 收取产出 ====================
export function useCollectOutput() {
  const [loading, setLoading] = useState(false)

  const collectOutput = useCallback(async (sessionId: number) => {
    try {
      setLoading(true)
      
      const response = await productionApi.mining.collectOutput({
        session_id: sessionId
      })
      
      if (response.success) {
        toast.success(`收取了 ${response.data.collected_amount} ${response.data.resource_type}`)
        return response.data
      } else {
        throw new Error(response.message || '收取失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '操作失败'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { collectOutput, loading }
}

// ==================== 检查粮食状态 ====================
export function useGrainStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.resources.checkGrainStatus()
      
      if (response.success) {
        setStatus(response.data)
        
        // 如果粮食不足，显示警告
        if (response.data.warning) {
          toast(response.data.message || '粮食储备不足', { icon: '⚠️' })
        }
      }
    } catch (err) {
      console.error('[useGrainStatus] Error:', err)
      setError(err instanceof Error ? err.message : '检查失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
    // 每5分钟检查一次
    const interval = setInterval(checkStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return { status, loading, error, refetch: checkStatus }
}

// ==================== 获取生产统计 ====================
export function useProductionStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.stats.getProductionStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('[useProductionStats] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
