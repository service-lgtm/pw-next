// src/hooks/useSynthesis.ts
// 合成系统专用 React Hooks - v2.0.0
//
// 文件说明：
// - 独立的合成系统 Hooks 模块，从 useProduction.ts 中分离出来
// - 提供合成工具、合成砖头、获取配方等功能的 React Hooks
// - 包含自动刷新、错误处理、加载状态管理等功能
//
// 关联文件：
// - src/lib/api/synthesisApi.ts: 合成系统 API 接口
// - src/app/mining/SynthesisSystem.tsx: 使用这些 Hooks
// - src/app/mining/ToolManagement.tsx: 使用这些 Hooks
//
// 创建时间：2024-12-26
// 最后更新：2024-12-26 - 适配新 API 响应格式

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { synthesisApi } from '@/lib/api/synthesisApi'
import toast from 'react-hot-toast'
import type {
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  SynthesizeToolResponse,
  SynthesizeBrickResponse,
  SynthesisRecipesResponse,
  RecipeInfo
} from '@/lib/api/synthesisApi'

// ==================== 合成配方 Hook ====================

/**
 * 获取合成配方
 * 
 * @param options - 配置选项
 * @param options.enabled - 是否启用查询
 * @param options.autoRefresh - 是否自动刷新
 * @param options.refreshInterval - 刷新间隔（毫秒）
 * 
 * @returns 配方信息、加载状态、错误信息和刷新函数
 */
export function useSynthesisRecipes(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  const [recipes, setRecipes] = useState<SynthesisRecipesResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const fetchingRef = useRef(false)
  
  const fetchRecipes = useCallback(async () => {
    if (!enabled || fetchingRef.current) return
    
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useSynthesisRecipes] Fetching recipes...')
      const response = await synthesisApi.getRecipes()
      console.log('[useSynthesisRecipes] Response:', response)
      
      if (response?.success && response?.data) {
        setRecipes(response.data)
      } else {
        console.warn('[useSynthesisRecipes] Unexpected response format:', response)
        setError('获取配方数据格式错误')
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useSynthesisRecipes] Error:', err)
      const errorMessage = err?.message || '获取合成配方失败'
      setError(errorMessage)
      
      // 设置默认配方数据，避免界面崩溃
      if (!recipes) {
        setRecipes({
          recipes: {},
          user_resources: {
            iron: 0,
            wood: 0,
            stone: 0,
            yld: 0
          }
        })
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [enabled, recipes])
  
  // 初始加载
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchRecipes()
    }
  }, [enabled])
  
  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(() => {
      if (!fetchingRef.current) {
        fetchRecipes()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchRecipes])
  
  return {
    recipes: recipes?.recipes || {},
    userResources: recipes?.user_resources || {},
    materialPrices: recipes?.material_prices || {},
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false
      return fetchRecipes()
    }
  }
}

// ==================== 合成工具 Hook ====================

/**
 * 合成工具 Hook
 * 
 * @returns 合成函数、加载状态和错误信息
 */
export function useSynthesizeTool() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<SynthesizeToolResponse['data'] | null>(null)
  
  const synthesize = useCallback(async (data: SynthesizeToolRequest) => {
    console.log('[useSynthesizeTool] 开始合成:', data)
    setLoading(true)
    setError(null)
    
    try {
      const response = await synthesisApi.synthesizeTool(data)
      console.log('[useSynthesizeTool] API响应:', response)
      
      // 检查响应格式 - 兼容多种格式
      let responseData = null
      let isSuccess = false
      
      // 情况1: 标准格式 {success: true, data: {...}}
      if (response?.success === true && response?.data) {
        responseData = response.data
        isSuccess = true
      }
      // 情况2: 直接返回数据 {tools: [...], ...}
      else if (response?.tools && Array.isArray(response.tools)) {
        responseData = response
        isSuccess = true
      }
      // 情况3: 嵌套在 data 中
      else if (response?.data?.tools) {
        responseData = response.data
        isSuccess = true
      }
      
      if (isSuccess && responseData) {
        setLastResult(responseData)
        
        // 提取信息用于提示
        const toolName = responseData.tool_display || 
                        responseData.tool_type || 
                        TOOL_TYPE_MAP[data.tool_type as keyof typeof TOOL_TYPE_MAP] ||
                        data.tool_type
        const quantity = responseData.quantity || data.quantity || 1
        
        // 确保 toast 被调用
        const successMessage = `✅ 成功合成 ${quantity} 个${toolName}！`
        console.log('[useSynthesizeTool] 显示成功提示:', successMessage)
        
        // 使用 setTimeout 确保 toast 在下一个事件循环中执行
        setTimeout(() => {
          toast.success(successMessage, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#10B981',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '16px',
              borderRadius: '8px',
            },
          })
        }, 0)
        
        // 显示消耗的资源
        if (responseData.consumed) {
          const consumedParts = []
          if (responseData.consumed.iron) {
            consumedParts.push(`铁矿 ${responseData.consumed.iron.toFixed(2)}`)
          }
          if (responseData.consumed.wood) {
            consumedParts.push(`木材 ${responseData.consumed.wood.toFixed(2)}`)
          }
          if (responseData.consumed.yld) {
            consumedParts.push(`YLD ${responseData.consumed.yld.toFixed(4)}`)
          }
          
          if (consumedParts.length > 0) {
            const consumedMessage = `📦 消耗：${consumedParts.join(', ')}`
            console.log('[useSynthesizeTool] 显示消耗提示:', consumedMessage)
            
            setTimeout(() => {
              toast(consumedMessage, {
                duration: 3000,
                position: 'top-center',
                style: {
                  background: '#1F2937',
                  color: '#D1D5DB',
                  fontSize: '14px',
                  padding: '12px',
                  borderRadius: '6px',
                },
              })
            }, 500)
          }
        }
        
        // 如果 toast 还是不工作，使用 alert 作为备选
        if (typeof window !== 'undefined' && !document.querySelector('.react-hot-toast')) {
          console.warn('[useSynthesizeTool] Toast 可能未正确加载，使用 alert 作为备选')
          alert(successMessage)
        }
        
        return responseData
      } else {
        throw new Error('合成失败：无效的响应格式')
      }
    } catch (err: any) {
      console.error('[useSynthesizeTool] 合成错误:', err)
      
      let errorMessage = '合成失败'
      
      // 处理不同类型的错误
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.shortage) {
        const shortageText = Object.entries(err.shortage)
          .filter(([_, value]) => value && Number(value) > 0)
          .map(([key, value]) => `${key}缺少${value}`)
          .join(', ')
        errorMessage = `资源不足：${shortageText}`
      }
      
      setError(errorMessage)
      
      // 显示错误提示
      console.log('[useSynthesizeTool] 显示错误提示:', errorMessage)
      setTimeout(() => {
        toast.error(errorMessage, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '8px',
          },
        })
      }, 0)
      
      // 备选错误提示
      if (typeof window !== 'undefined' && !document.querySelector('.react-hot-toast')) {
        alert(`❌ ${errorMessage}`)
      }
      
      throw err
    } finally {
      setLoading(false)
      console.log('[useSynthesizeTool] 合成流程结束')
    }
  }, [])
  
  return {
    synthesize,
    loading,
    error,
    lastResult
  }
}

// ==================== 合成砖头 Hook ====================

/**
 * 合成砖头 Hook
 * 
 * @returns 合成函数、加载状态和错误信息
 */
export function useSynthesizeBricks() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<SynthesizeBrickResponse['data'] | null>(null)
  
  const synthesize = useCallback(async (quantity: number) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useSynthesizeBricks] Synthesizing batches:', quantity)
      const response = await synthesisApi.synthesizeBricks({ quantity })
      console.log('[useSynthesizeBricks] Response:', response)
      
      if (response?.success) {
        setLastResult(response.data)
        
        // 显示成功消息
        const bricksProduced = response.data.produced.bricks
        toast.success(`成功合成 ${bricksProduced} 个砖头！`)
        
        // 显示消耗的资源
        const consumed = response.data.consumed
        const consumedText = `消耗：石材 ${consumed.stone}，木材 ${consumed.wood}，YLD ${consumed.yld}`
        toast.success(consumedText, { duration: 5000 })
        
        return response.data
      } else {
        throw new Error(response?.message || '合成失败')
      }
    } catch (err: any) {
      console.error('[useSynthesizeBricks] Error:', err)
      
      const errorMessage = err?.message || err?.response?.data?.message || '合成砖头失败'
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
    error,
    lastResult
  }
}

// ==================== 合成预检查 Hook ====================

/**
 * 合成预检查 Hook
 * 用于在用户点击合成前进行客户端验证
 * 
 * @param recipes - 配方信息
 * @param resources - 用户资源
 * 
 * @returns 验证函数
 */
export function useSynthesisValidation(
  recipes: { [key: string]: RecipeInfo },
  resources: { iron?: number; wood?: number; stone?: number; yld?: number }
) {
  const validate = useCallback((
    toolType: 'pickaxe' | 'axe' | 'hoe',
    quantity: number
  ): { valid: boolean; errors: string[]; maxAvailable: number } => {
    const recipe = recipes[toolType]
    
    if (!recipe) {
      return {
        valid: false,
        errors: ['配方不存在'],
        maxAvailable: 0
      }
    }
    
    // 计算最大可合成数量
    const maxAvailable = synthesisApi.calculateMaxSynthesizable(recipe, resources)
    
    // 验证合成请求
    const validation = synthesisApi.validateSynthesis(toolType, quantity, recipe, resources)
    
    return {
      ...validation,
      maxAvailable
    }
  }, [recipes, resources])
  
  return { validate }
}

// ==================== 合成状态管理 Hook ====================

/**
 * 合成状态管理 Hook
 * 综合管理配方、资源和合成操作
 * 
 * @param options - 配置选项
 * 
 * @returns 完整的合成系统状态和操作函数
 */
export function useSynthesisSystem(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  // 获取配方
  const {
    recipes,
    userResources,
    materialPrices,
    loading: recipesLoading,
    error: recipesError,
    refetch: refetchRecipes
  } = useSynthesisRecipes(options)
  
  // 合成工具
  const {
    synthesize: synthesizeTool,
    loading: toolLoading,
    error: toolError
  } = useSynthesizeTool()
  
  // 合成砖头
  const {
    synthesize: synthesizeBricks,
    loading: brickLoading,
    error: brickError
  } = useSynthesizeBricks()
  
  // 验证功能
  const { validate } = useSynthesisValidation(recipes, userResources)
  
  // 统一的合成处理函数
  const handleSynthesize = useCallback(async (
    type: 'tool' | 'brick',
    params: any
  ) => {
    try {
      let result
      
      if (type === 'tool') {
        // 先进行客户端验证
        const validation = validate(params.tool_type, params.quantity)
        if (!validation.valid) {
          validation.errors.forEach(error => toast.error(error))
          return null
        }
        
        result = await synthesizeTool(params)
      } else if (type === 'brick') {
        result = await synthesizeBricks(params.quantity)
      }
      
      // 合成成功后刷新配方（更新资源余额）
      await refetchRecipes()
      
      return result
    } catch (error) {
      console.error('[useSynthesisSystem] Synthesis failed:', error)
      return null
    }
  }, [synthesizeTool, synthesizeBricks, validate, refetchRecipes])
  
  return {
    // 数据
    recipes,
    userResources,
    materialPrices,
    
    // 加载状态
    loading: recipesLoading || toolLoading || brickLoading,
    recipesLoading,
    synthesizing: toolLoading || brickLoading,
    
    // 错误信息
    error: recipesError || toolError || brickError,
    
    // 操作函数
    synthesizeTool: (params: SynthesizeToolRequest) => handleSynthesize('tool', params),
    synthesizeBricks: (quantity: number) => handleSynthesize('brick', { quantity }),
    validate,
    refetch: refetchRecipes,
    
    // 辅助函数
    calculateMaxSynthesizable: (toolType: string) => {
      const recipe = recipes[toolType]
      if (!recipe) return 0
      return synthesisApi.calculateMaxSynthesizable(recipe, userResources)
    }
  }
}

// ==================== 合成历史 Hook ====================

/**
 * 获取合成历史记录
 * 
 * @param options - 配置选项
 * @returns 历史记录、分页信息、统计数据等
 */
export function useSynthesisHistory(options?: {
  type?: 'all' | 'tool' | 'brick'
  tool_type?: 'pickaxe' | 'axe' | 'hoe'
  quality?: string
  page?: number
  pageSize?: number
  enabled?: boolean
}) {
  const { 
    type = 'all', 
    tool_type, 
    quality,
    page = 1,
    pageSize = 20,
    enabled = true 
  } = options || {}
  
  const [history, setHistory] = useState<SynthesisHistoryResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchHistory = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await synthesisApi.getHistory({
        type,
        tool_type,
        quality,
        page,
        page_size: pageSize
      })
      
      if (response?.success && response?.data) {
        setHistory(response.data)
      }
    } catch (err: any) {
      console.error('[useSynthesisHistory] Error:', err)
      setError(err?.message || '获取合成历史失败')
    } finally {
      setLoading(false)
    }
  }, [enabled, type, tool_type, quality, page, pageSize])
  
  useEffect(() => {
    if (enabled) {
      fetchHistory()
    }
  }, [enabled, type, tool_type, quality, page, pageSize])
  
  return {
    history: history?.history || [],
    pagination: history?.pagination,
    statistics: history?.statistics,
    loading,
    error,
    refetch: fetchHistory
  }
}

// ==================== 合成统计 Hook ====================

/**
 * 获取合成统计数据
 * 
 * @param options - 配置选项
 * @returns 统计数据
 */
export function useSynthesisStats(options?: {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 300000 } = options || {} // 默认5分钟刷新
  
  const [stats, setStats] = useState<SynthesisStatsResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  
  const fetchStats = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useSynthesisStats] Fetching stats...')
      const response = await synthesisApi.getStats()
      console.log('[useSynthesisStats] Response:', response)
      
      if (response?.success && response?.data) {
        setStats(response.data)
      }
      
      hasFetchedRef.current = true
    } catch (err: any) {
      console.error('[useSynthesisStats] Error:', err)
      setError(err?.message || '获取合成统计失败')
    } finally {
      setLoading(false)
    }
  }, [enabled])
  
  // 初始加载
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      fetchStats()
    }
  }, [enabled])
  
  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(fetchStats, refreshInterval)
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

// ==================== 导出工具函数 ====================

export { TOOL_TYPE_MAP, TOOL_USAGE_MAP, QUALITY_CONFIG } from '@/lib/api/synthesisApi'

// 导出类型
export type {
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  RecipeInfo
} from '@/lib/api/synthesisApi'
