// src/hooks/useProduction.ts
// 挖矿生产系统 Hook - 修复版本
//
// 文件说明：
// 1. 本文件提供挖矿生产相关的数据获取和操作 Hook
// 2. 包括挖矿会话、工具、资源、合成等
// 3. 自动处理加载状态、错误处理和数据缓存
// 4. 修复了条件调用 Hook 的问题，确保 Hook 始终返回一致的结构
//
// 关联文件：
// - src/lib/api/production.ts: 生产系统 API 接口
// - src/types/production.ts: 生产系统类型定义
// - src/app/mining/page.tsx: 挖矿页面使用这些 Hook
//
// 修复说明：
// - 移除了条件参数传递，改为在 Hook 内部处理条件逻辑
// - 确保所有 Hook 始终返回相同的数据结构
// - 添加了 enabled 参数来控制是否执行数据获取

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
interface UseMiningSessionsOptions {
  status?: 'active' | 'paused' | 'completed'
  enabled?: boolean  // 控制是否执行查询
}

export function useMiningSessions(options?: UseMiningSessionsOptions) {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  const { status, enabled = true } = options || {}

  const fetchSessions = useCallback(async () => {
    if (!enabled) {
      setSessions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.mining.getMySessions({
        status,
        page_size: 50
      })
      
      setSessions(response.results || [])
      setStats(response.stats || null)
    } catch (err) {
      console.error('[useMiningSessions] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [status, enabled])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { 
    sessions: sessions || [], 
    loading, 
    error, 
    stats, 
    refetch: fetchSessions 
  }
}

// ==================== 获取资源统计（增强版） ====================
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
    refreshInterval = 30000 // 30秒
  } = options || {}

  const fetchStats = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.resources.getResourceStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('[useResourceStats] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchStats()
    
    // 设置自动刷新
    if (autoRefresh && enabled) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, autoRefresh, enabled, refreshInterval])

  return { 
    stats, 
    loading, 
    error, 
    refetch: fetchStats 
  }
}


// ==================== 获取我的资源（兼容旧版） ====================
export function useMyResources(options?: UseMyResourcesOptions) {
  const [resources, setResources] = useState<ResourceBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchResources = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // 优先尝试使用新的统计接口
      try {
        const statsResponse = await productionApi.resources.getResourceStats()
        
        if (statsResponse.success && statsResponse.data) {
          // 从统计数据中提取资源余额
          const balance: ResourceBalance = {
            wood: 0,
            iron: 0,
            stone: 0,
            yld: 0,
            grain: 0,
            seed: 0,
            brick: 0
          }
          
          // 处理资源数据
          Object.entries(statsResponse.data.resources).forEach(([key, resource]) => {
            if (key in balance) {
              balance[key as keyof ResourceBalance] = resource.available || resource.amount || 0
            }
          })
          
          // 处理钱包中的 YLD
          if (statsResponse.data.wallet?.yld_balance) {
            balance.yld += statsResponse.data.wallet.yld_balance
          }
          
          setResources(balance)
          return
        }
      } catch (statsError) {
        console.log('[useMyResources] 统计接口失败，尝试旧接口')
      }
      
      // 如果新接口失败，回退到旧接口
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
          const key = resource.resource_type as keyof ResourceBalance
          if (key in balance) {
            balance[key] = parseFloat(resource.available_amount || resource.amount)
          }
        })
        
        setResources(balance)
      }
    } catch (err) {
      console.error('[useMyResources] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setResources(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return { 
    resources, 
    loading, 
    error, 
    refetch: fetchResources 
  }
}


// ==================== 获取我的工具 ====================
interface UseMyToolsOptions {
  tool_type?: 'pickaxe' | 'axe' | 'hoe'
  status?: 'normal' | 'damaged' | 'repairing'  // 使用后端的状态值
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
      
      const response = await productionApi.tools.getMyTools({
        tool_type,
        status,
        is_in_use,
        page_size: 100
      })
      
      setTools(response.results || [])
      setStats(response.stats || null)
    } catch (err) {
      console.error('[useMyTools] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setTools([])
    } finally {
      setLoading(false)
    }
  }, [tool_type, status, is_in_use, enabled])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  return { 
    tools: tools || [], 
    loading, 
    error, 
    stats, 
    refetch: fetchTools 
  }
}

// ==================== 获取我的资源 ====================
interface UseMyResourcesOptions {
  enabled?: boolean
}

export function useMyResources(options?: UseMyResourcesOptions) {
  const [resources, setResources] = useState<ResourceBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { enabled = true } = options || {}

  const fetchResources = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.resources.getMyResources()
      
      // 处理后端实际返回的格式
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
          const key = resource.resource_type as keyof ResourceBalance
          if (key in balance) {
            balance[key] = parseFloat(resource.available_amount || resource.amount)
          }
        })
        
        setResources(balance)
      }
    } catch (err) {
      console.error('[useMyResources] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setResources(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return { 
    resources, 
    loading, 
    error, 
    refetch: fetchResources 
  }
}

// ==================== 获取可用土地 ====================
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
      } else {
        setLands([])
      }
    } catch (err) {
      console.error('[useAvailableLands] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
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

// ==================== 获取用户土地 ====================
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
      
      const response = await productionApi.lands.getUserLands()
      
      if (response.success && response.data) {
        setLands(response.data.results || [])
      } else {
        setLands([])
      }
    } catch (err) {
      console.error('[useUserLands] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      setLands([])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchLands()
  }, [fetchLands])

  return { 
    lands: lands || [], 
    loading, 
    error, 
    refetch: fetchLands 
  }
}

// ==================== 获取土地挖矿详情 ====================
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
      
      const response = await productionApi.lands.getLandMiningInfo(landId)
      
      if (response.success && response.data) {
        setLandInfo(response.data)
      } else {
        setLandInfo(null)
      }
    } catch (err) {
      console.error('[useLandMiningInfo] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
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

  return { 
    startMining, 
    loading, 
    error 
  }
}

// ==================== 开始打工挖矿 ====================
export function useStartHiredMining() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startWithTools = useCallback(async (data: StartHiredMiningWithToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.hiring.startWithTools(data)
      
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

  const startWithoutTools = useCallback(async (data: StartHiredMiningWithoutToolRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.hiring.startWithoutTools(data)
      
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

  return { 
    startWithTools, 
    startWithoutTools, 
    loading, 
    error 
  }
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

  return { 
    synthesize, 
    loading, 
    error 
  }
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

  return { 
    stopProduction, 
    loading 
  }
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

  return { 
    collectOutput, 
    loading 
  }
}

// ==================== 检查粮食状态 ====================
interface UseGrainStatusOptions {
  enabled?: boolean
  autoRefresh?: boolean  // 是否自动刷新
  refreshInterval?: number  // 刷新间隔（毫秒）
}

export function useGrainStatus(options?: UseGrainStatusOptions) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { 
    enabled = true, 
    autoRefresh = true, 
    refreshInterval = 5 * 60 * 1000  // 默认5分钟
  } = options || {}

  const checkStatus = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await productionApi.stats.checkFoodStatus()
      
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
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    checkStatus()
    
    // 设置自动刷新
    if (autoRefresh && enabled) {
      const interval = setInterval(checkStatus, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [checkStatus, autoRefresh, enabled, refreshInterval])

  return { 
    status, 
    loading, 
    error, 
    refetch: checkStatus 
  }
}

// ==================== 获取生产统计 ====================
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
      
      const response = await productionApi.stats.getProductionStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('[useProductionStats] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
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
