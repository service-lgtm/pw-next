// src/lib/api/production.ts
// 挖矿生产系统 API - 生产级完整版本
//
// 文件说明：
// 1. 本文件包含所有挖矿生产相关的 API 接口
// 2. 包括自主挖矿、招募挖矿、打工挖矿、合成系统等
// 3. 使用 JWT 认证，自动处理 token
// 4. 统一处理不同的响应格式（标准格式和分页格式）
// 5. 完善的错误处理和重试机制
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/production.ts: 生产系统类型定义
// - src/hooks/useProduction.ts: 生产系统 Hook
// - src/app/mining/MiningSessions.tsx: 挖矿会话组件
// - backend/production/urls.py: 后端路由定义
// - backend/production/views.py: 后端视图
//
// 更新历史：
// - 2024-12: 添加响应格式标准化处理
// - 2024-12: 完善错误处理，添加友好的错误消息
// - 2024-12: 添加请求重试机制

import { request } from './index'
import type {
  Tool,
  UserResource,
  MiningSession,
  StartSelfMiningRequest,
  AddToolToMiningRequest,
  RemoveToolFromMiningRequest,
  DepositToolsRequest,
  StartHiredMiningWithToolRequest,
  StartHiredMiningWithoutToolRequest,
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  CollectOutputRequest,
  StopProductionRequest,
  StartMiningResponse,
  AddToolResponse,
  RemoveToolResponse,
  SynthesisResponse,
  CollectOutputResponse,
  StopProductionResponse,
  ProductionStatsResponse,
  MiningSessionListResponse,
  ToolListResponse,
  ResourceBalance,
  StandardResponse,
  ApiErrorResponse,
  PaginatedResponse
} from '@/types/production'

// ==================== 响应格式标准化 ====================

/**
 * 标准化不同格式的API响应
 * 处理分页格式和标准格式的差异
 */
function normalizeResponse<T = any>(response: any): StandardResponse<T> {
  // 如果已经是标准格式
  if ('success' in response && typeof response.success === 'boolean') {
    return response as StandardResponse<T>
  }
  
  // 如果是分页格式
  if ('results' in response && Array.isArray(response.results)) {
    return {
      success: true,
      message: '获取成功',
      data: response as T
    }
  }
  
  // 如果是直接的数据
  return {
    success: true,
    message: '操作成功',
    data: response as T
  }
}

/**
 * 处理API错误，提供友好的错误信息
 */
function handleApiError(error: any): never {
  console.error('[Production API] Error:', error)
  
  // 提取错误信息
  let message = '操作失败'
  let data: any = null
  
  if (error?.response?.data) {
    const responseData = error.response.data
    
    // 尝试从不同字段获取错误信息
    message = responseData.message || 
              responseData.detail || 
              responseData.error || 
              message
    
    // 保留错误响应中的数据
    data = responseData.data || responseData
  } else if (error?.message) {
    message = error.message
  }
  
  // 构造标准错误响应
  const errorResponse: ApiErrorResponse = {
    success: false,
    message,
    data,
    error: message,
    code: error?.code || 'UNKNOWN_ERROR'
  }
  
  // 抛出错误，保留原始错误信息
  const enhancedError = new Error(message) as any
  enhancedError.response = { data: errorResponse }
  enhancedError.isApiError = true
  
  throw enhancedError
}

/**
 * 带重试的请求函数
 */
async function requestWithRetry<T>(
  endpoint: string,
  options?: any,
  maxRetries: number = 1
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await request<T>(endpoint, options)
      return response
    } catch (error: any) {
      lastError = error
      
      // 不重试的错误类型
      if (
        error?.response?.status === 400 || // 请求错误
        error?.response?.status === 401 || // 未授权
        error?.response?.status === 403 || // 禁止访问
        error?.response?.status === 404    // 未找到
      ) {
        throw error
      }
      
      // 如果还有重试次数，等待后重试
      if (i < maxRetries) {
        console.log(`[Production API] Retrying request ${i + 1}/${maxRetries}...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// ==================== API 接口实现 ====================

export const productionApi = {
  // ==================== 自主挖矿 ====================
  mining: {
    /**
     * 开始自主挖矿
     * POST /production/mining/self/start/
     */
    startSelfMining: async (data: StartSelfMiningRequest): Promise<StartMiningResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/mining/self/start/', {
          method: 'POST',
          body: data,
        })
        
        // 标准化响应
        const normalized = normalizeResponse<StartMiningResponse['data']>(response)
        
        // 确保返回正确的格式
        return {
          success: normalized.success,
          message: normalized.message,
          data: normalized.data || response.data || response
        }
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 添加工具到挖矿会话
     * POST /production/mining/self/add-tools/
     */
    addTools: async (data: AddToolToMiningRequest): Promise<AddToolResponse> => {
      try {
        const response = await request<any>('/production/mining/self/add-tools/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 从挖矿会话移除工具
     * POST /production/mining/self/remove-tools/
     */
    removeTools: async (data: RemoveToolFromMiningRequest): Promise<RemoveToolResponse> => {
      try {
        const response = await request<any>('/production/mining/self/remove-tools/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取我的挖矿会话列表
     * GET /production/sessions/
     */
    getMySessions: async (params?: {
      status?: 'active' | 'paused' | 'completed'
      is_active?: boolean
      page?: number
      page_size?: number
    }): Promise<MiningSessionListResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/sessions/', { params })
        
        // 处理分页格式
        if ('results' in response) {
          return response as MiningSessionListResponse
        }
        
        // 处理标准格式
        if (response.success && response.data) {
          return response.data
        }
        
        // 直接返回
        return response
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 收取产出
     * POST /production/collect/
     */
    collectOutput: async (data: CollectOutputRequest): Promise<CollectOutputResponse> => {
      try {
        const response = await request<any>('/production/collect/', {
          method: 'POST',
          body: data,
        })
        
        const normalized = normalizeResponse<CollectOutputResponse['data']>(response)
        
        return {
          success: normalized.success,
          message: normalized.message,
          data: normalized.data || response.data || response
        }
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 停止生产
     * POST /production/stop/
     */
    stopProduction: async (data: StopProductionRequest): Promise<StopProductionResponse> => {
      try {
        const response = await request<any>('/production/stop/', {
          method: 'POST',
          body: data,
        })
        
        const normalized = normalizeResponse<StopProductionResponse['data']>(response)
        
        return {
          success: normalized.success,
          message: normalized.message,
          data: normalized.data || response.data || response
        }
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 招募与打工 ====================
  hiring: {
    /**
     * 存入工具供招募
     * POST /production/mining/recruit/deposit-tools/
     */
    depositTools: async (data: DepositToolsRequest): Promise<StandardResponse> => {
      try {
        const response = await request<any>('/production/mining/recruit/deposit-tools/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 带工具打工
     * POST /production/mining/work/with-tools/
     */
    startWithTools: async (data: StartHiredMiningWithToolRequest): Promise<StartMiningResponse> => {
      try {
        const response = await request<any>('/production/mining/work/with-tools/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 无工具打工（借用工具）
     * POST /production/mining/work/without-tools/
     */
    startWithoutTools: async (data: StartHiredMiningWithoutToolRequest): Promise<StartMiningResponse> => {
      try {
        const response = await request<any>('/production/mining/work/without-tools/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 合成系统 ====================
  synthesis: {
    /**
     * 合成工具
     * POST /production/synthesis/tool/
     */
    synthesizeTool: async (data: SynthesizeToolRequest): Promise<SynthesisResponse> => {
      try {
        const response = await request<any>('/production/synthesis/tool/', {
          method: 'POST',
          body: data,
        })
        
        const normalized = normalizeResponse<SynthesisResponse['data']>(response)
        
        return {
          success: normalized.success,
          message: normalized.message,
          data: normalized.data || response.data || response
        }
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 合成砖头
     * POST /production/synthesis/bricks/
     */
    synthesizeBricks: async (data: SynthesizeBrickRequest): Promise<SynthesisResponse> => {
      try {
        const response = await request<any>('/production/synthesis/bricks/', {
          method: 'POST',
          body: data,
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取合成配方
     * GET /production/synthesis/recipes/
     */
    getRecipes: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/synthesis/recipes/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 工具管理 ====================
  tools: {
    /**
     * 获取我的工具列表
     * GET /production/tools/
     */
    getMyTools: async (params?: {
      tool_type?: 'pickaxe' | 'axe' | 'hoe'
      status?: 'normal' | 'damaged' | 'repairing'
      is_in_use?: boolean
      page?: number
      page_size?: number
      ordering?: string
    }): Promise<ToolListResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/tools/', { params })
        
        // 处理分页格式
        if ('results' in response) {
          return response as ToolListResponse
        }
        
        // 处理标准格式
        if (response.success && response.data) {
          return response.data
        }
        
        return response
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取工具详情
     * GET /production/tools/{id}/
     */
    getToolDetail: async (toolId: number): Promise<StandardResponse<Tool>> => {
      try {
        const response = await request<any>(`/production/tools/${toolId}/`)
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 资源管理 ====================
  resources: {
    /**
     * 获取用户资源列表
     * GET /production/resources/
     */
    getMyResources: async (): Promise<{
      results: UserResource[]
      stats?: any
    }> => {
      try {
        const response = await requestWithRetry<any>('/production/resources/')
        
        // 处理分页格式
        if ('results' in response) {
          return response
        }
        
        // 处理标准格式
        if (response.success && response.data) {
          return response.data
        }
        
        // 兼容旧格式
        if (Array.isArray(response)) {
          return { results: response }
        }
        
        return response
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取资源统计（增强版）
     * GET /production/resources/stats/
     */
    getResourceStats: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/resources/stats/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取资源价格
     * GET /production/prices/
     */
    getPrices: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/prices/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 统计与分析 ====================
  stats: {
    /**
     * 获取生产统计
     * GET /production/stats/
     */
    getProductionStats: async (): Promise<ProductionStatsResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/stats/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取生产记录
     * GET /production/records/
     */
    getProductionRecords: async (params?: {
      resource_type?: string
      session?: number
      start_date?: string
      end_date?: string
      page?: number
      page_size?: number
      ordering?: string
    }): Promise<PaginatedResponse<any>> => {
      try {
        const response = await requestWithRetry<any>('/production/records/', { params })
        
        if ('results' in response) {
          return response
        }
        
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
          ...response
        }
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 检查粮食状态
     * GET /production/food-status/
     */
    checkFoodStatus: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/food-status/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 土地相关 ====================
  lands: {
    /**
     * 获取可用于挖矿的土地
     * GET /production/lands/available/
     */
    getAvailableLands: async (params?: {
      ownership?: 'mine' | 'others' | 'all'
      land_type?: string
      has_tools?: boolean
      page?: number
      page_size?: number
    }): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/lands/available/', { params })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取土地挖矿详情
     * GET /production/lands/{id}/mining-info/
     */
    getLandMiningInfo: async (landId: number): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>(`/production/lands/${landId}/mining-info/`)
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取用户的土地列表
     * GET /production/lands/mine/
     */
    getUserLands: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/lands/mine/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 粮食购买 ====================
  food: {
    /**
     * 购买粮食
     * POST /production/food/buy/
     */
    buyFood: async (quantity: number): Promise<StandardResponse> => {
      try {
        const response = await request<any>('/production/food/buy/', {
          method: 'POST',
          body: { quantity }
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },

    /**
     * 获取粮食购买状态
     * GET /production/food/purchase-status/
     */
    getPurchaseStatus: async (): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/food/purchase-status/')
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },

  // ==================== 库存管理 ====================
  inventory: {
    /**
     * 获取用户库存
     * GET /production/inventory/
     */
    getInventory: async (params?: {
      category?: 'all' | 'materials' | 'tools' | 'special'
      include_prices?: boolean
    }): Promise<StandardResponse> => {
      try {
        const response = await requestWithRetry<any>('/production/inventory/', {
          params: {
            ...params,
            include_prices: params?.include_prices ? 'true' : 'false'
          }
        })
        return normalizeResponse(response)
      } catch (error) {
        handleApiError(error)
      }
    },
  },
}

// ==================== 辅助函数 ====================

/**
 * 格式化资源返回数据为 ResourceBalance
 */
export function formatResourceBalance(resources: UserResource[]): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    seed: 0,
    brick: 0
  }

  resources.forEach(resource => {
    const key = resource.resource_type as keyof ResourceBalance
    if (key in balance) {
      const amount = parseFloat(resource.available_amount || resource.amount)
      balance[key] = isNaN(amount) ? 0 : amount
    }
    
    // 处理 food -> grain 的映射
    if (resource.resource_type === 'food') {
      const amount = parseFloat(resource.available_amount || resource.amount)
      balance.grain = isNaN(amount) ? 0 : amount
      balance.food = balance.grain
    }
  })

  return balance
}

/**
 * 从资源统计数据中提取 ResourceBalance
 */
export function formatResourceStatsToBalance(stats: any): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    seed: 0,
    brick: 0
  }

  if (stats?.resources) {
    Object.entries(stats.resources).forEach(([key, resource]: [string, any]) => {
      // 处理 food -> grain 映射
      const resourceKey = key === 'food' ? 'grain' : key
      
      if (resourceKey in balance) {
        const amount = resource.available ?? resource.amount ?? 0
        balance[resourceKey as keyof ResourceBalance] = amount
        
        // 同时设置 food 字段以保持兼容性
        if (key === 'food') {
          balance.food = amount
        }
      }
    })
  }

  // 加上钱包中的 YLD（如果需要）
  if (stats?.wallet?.yld_balance) {
    balance.yld += stats.wallet.yld_balance
  }

  return balance
}

/**
 * 检查API响应是否成功
 */
export function isApiSuccess(response: any): boolean {
  return response?.success === true || 
         (response && !response.error && !response.message?.includes('失败'))
}

/**
 * 获取API错误消息
 */
export function getApiErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error?.message) {
    return error.message
  }
  return '操作失败，请重试'
}
