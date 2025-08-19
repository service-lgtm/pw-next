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
    setLoading(true)
    setError(null)
    
    try {
      console.log('[useSynthesizeTool] Synthesizing:', data)
      const response = await synthesisApi.synthesizeTool(data)
      console.log('[useSynthesizeTool] Response:', response)
      
      if (response?.success) {
        setLastResult(response.data)
        
        // 显示成功消息
        const toolName = response.data.tool_display || data.tool_type
        toast.success(`成功合成 ${data.quantity} 个${toolName}！`)
        
        // 显示消耗的资源
        const consumed = response.data.consumed
        const consumedText = Object.entries(consumed)
          .filter(([_, value]) => value && value > 0)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        
        if (consumedText) {
          toast.success(`消耗资源：${consumedText}`, {
            duration: 5000
          })
        }
        
        return response.data
      } else {
        throw new Error(response?.message || '合成失败')
      }
    } catch (err: any) {
      console.error('[useSynthesizeTool] Error:', err)
      
      // 处理资源不足的错误
      if (err?.shortage) {
        const shortageText = Object.entries(err.shortage)
          .filter(([_, value]) => value && Number(value) > 0)
          .map(([key, value]) => `${key}缺少${value}`)
          .join(', ')
        
        const errorMessage = err.message || `资源不足：${shortageText}`
        setError(errorMessage)
        toast.error(errorMessage)
      } else {
        const errorMessage = err?.message || err?.response?.data?.message || '合成失败'
        setError(errorMessage)
        toast.error(errorMessage)
      }
      
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

// ==================== 导出工具函数 ====================

export { TOOL_TYPE_MAP, TOOL_USAGE_MAP } from '@/lib/api/synthesisApi'

// 导出类型
export type {
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  RecipeInfo
} from '@/lib/api/synthesisApi'
