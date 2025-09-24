/**
 * 文件: /src/lib/api/assets.ts
 * 描述: 资产 API - 包含 YLD 矿山接口
 * 
 * 修改历史：
 * - 2025-01-19: 更新支持新的矿山 API 结构
 *   - 新增 mines 命名空间，支持所有类型矿山
 *   - 保留 yldMines 命名空间以保持向后兼容
 *   - 支持 YLD 转换矿山和普通矿山的区分
 * - 2025-01-27: 修复土地购买接口，移除 payment_password 参数
 * 
 * 文件说明：
 * 1. 本文件包含所有资产相关的 API 接口
 * 2. 包括区域、土地蓝图、土地、YLD矿山等
 * 3. 使用 JWT 认证，自动处理 token
 * 4. 支持公开和需要认证的端点
 *
 * 关联文件：
 * - src/lib/api/index.ts: 基础请求函数和认证管理
 * - src/types/assets.ts: 资产相关类型定义
 * - src/hooks/useLands.ts: 土地相关的 Hook
 * - src/hooks/useYLDMines.ts: YLD矿山相关的 Hook
 */

import { API_BASE_URL, request, ApiError } from './index'
import type {
  Region,
  Land,
  LandDetail,
  LandBlueprint,
  LandTransaction,
  PaginatedResponse,
  YLDMine,
  YLDMineDetail,
  YLDMineStats,
  YLDMineListResponse,
  MineLand,
  MineListResponse,
  MineStats
} from '@/types/assets'

// 定义公开访问的端点模式
const PUBLIC_ENDPOINTS = [
  '/assets/regions/',
  '/assets/blueprints/',
  '/assets/lands/available/',
]

// 检查端点是否应该公开访问
function isPublicEndpoint(endpoint: string): boolean {
  return PUBLIC_ENDPOINTS.some(pattern => endpoint.includes(pattern))
}

// 增强的请求函数，优雅处理认证错误
async function assetsRequest<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<T> {
  try {
    // 直接使用基础 request 函数，它会自动处理 JWT 认证
    return await request<T>(endpoint, options)
  } catch (error) {
    // 处理404错误
    if (error instanceof ApiError && error.status === 404) {
      // 如果是获取单个资源的404，直接抛出
      throw error
    }

    // 处理认证错误
    if (error instanceof ApiError && error.status === 401) {
      // 401 错误会被基础 request 函数处理（尝试刷新 token）
      // 如果到这里说明刷新失败，让错误继续抛出
      throw error
    }

    if (error instanceof ApiError && error.status === 403) {
      // 如果是公开端点的 403 错误，可能是因为未登录
      // 返回空数据而不是报错，让用户看到登录提示
      if (isPublicEndpoint(endpoint)) {
        console.log(`[Assets API] 未认证访问公开端点 ${endpoint}，返回空数据`)

        // 根据端点类型返回合适的空数据结构
        if (endpoint.includes('/regions/') && !endpoint.includes('/stats/')) {
          // 区域列表或详情
          if (endpoint.match(/\/regions\/\d+\/$/)) {
            // 单个区域详情 - 仍然抛出错误，因为需要具体数据
            throw error
          }
          // 区域列表
          return {
            count: 0,
            results: [],
            next: null,
            previous: null
          } as any
        }

        if (endpoint.includes('/blueprints/')) {
          return {
            count: 0,
            results: [],
            next: null,
            previous: null
          } as any
        }

        if (endpoint.includes('/lands/available/')) {
          return {
            count: 0,
            results: [],
            next: null,
            previous: null,
            stats: {
              total_count: 0,
              min_price: 0,
              max_price: 0,
              avg_price: 0
            }
          } as any
        }
      }
    }

    // 其他错误或非公开端点的错误，继续抛出
    throw error
  }
}

// 辅助函数：转换矿山数据为 YLD 矿山格式（向后兼容）
function convertMineToYLDMine(mine: MineLand): YLDMine {
  // 获取 YLD 储量（兼容两种存储位置）
  let yldCapacity: string | number = '0'

  if (mine.special_type === 'yld_converted' && mine.initial_price) {
    // 转换矿山：储量在 initial_price
    yldCapacity = mine.initial_price
  } else if (mine.metadata?.yld_reserves) {
    // 普通 YLD 矿山：储量在 metadata.yld_reserves
    yldCapacity = mine.metadata.yld_reserves
  } else if (mine.metadata?.yld_amount) {
    // 兼容旧字段
    yldCapacity = mine.metadata.yld_amount
  }

  return {
    ...mine,
    yld_capacity: yldCapacity,
    batch_id: mine.metadata?.batch_id,
    converted_at: mine.metadata?.converted_at || mine.metadata?.conversion_date
  }
}

export const assetsApi = {
  // ==================== 区域相关 ====================
  regions: {
    list: (params?: {
      region_type?: string
      parent_id?: number
      level?: number
      is_active?: boolean
      is_open_for_sale?: boolean
      search?: string
    }) => assetsRequest<PaginatedResponse<Region>>('/assets/regions/', { params }),

    get: (id: number) => assetsRequest<Region>(`/assets/regions/${id}/`),

    stats: (id: number) => assetsRequest<{
      success: boolean
      data: {
        region: { id: number; name: string; code: string }
        total_lands: number
        available_lands: number
        owned_lands: number
        total_value: number
        average_price: number
        by_type: Record<string, {
          total: number
          available: number
          value: number
        }>
      }
    }>(`/assets/regions/${id}/stats/`),
  },

  // ==================== 蓝图相关 ====================
  blueprints: {
    list: (params?: {
      land_type?: string
      is_active?: boolean
      ordering?: string
    }) => assetsRequest<PaginatedResponse<LandBlueprint>>('/assets/blueprints/', { params }),

    get: (id: number) => assetsRequest<LandBlueprint>(`/assets/blueprints/${id}/`),
  },

  // ==================== 土地相关 ====================
  lands: {
    // 可购买的土地列表
    available: (params?: {
      blueprint__land_type?: string
      region_id?: number
      min_price?: number
      max_price?: number
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<PaginatedResponse<Land>>('/assets/lands/available/', { params }),

    // 我的土地列表
    myLands: (params?: {
      blueprint__land_type?: string
      status?: string
      is_special?: boolean
      is_rented?: boolean
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<PaginatedResponse<Land>>('/assets/lands/my-lands/', { params }),

    // 获取土地详情
    get: (id: number) => assetsRequest<LandDetail>(`/assets/lands/${id}/`),

    // 购买土地 - 已移除 payment_password 参数
    buy: (data: {
      land_id: number
    }) => assetsRequest<{
      success: boolean
      message: string
      data: LandDetail
    }>('/assets/lands/buy/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // 转让土地
    transfer: (data: {
      land_id: number
      to_user_id: number
      payment_password: string
    }) => assetsRequest<{
      success: boolean
      message: string
      data: { land_id: string; new_owner: string }
    }>('/assets/lands/transfer/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    // 土地交易历史
    transactions: (landId: number, params?: {
      transaction_type?: string
      ordering?: string
    }) => assetsRequest<PaginatedResponse<LandTransaction>>(
      `/assets/lands/${landId}/transactions/`,
      { params }
    ),
  },

  // ==================== 新的矿山 API ====================
  mines: {
    // 获取所有可挖矿土地（包括所有类型）
    all: (params?: {
      land_type?: string  // 'yld_mine' | 'iron_mine' | 'stone_mine' | 'forest'
      search?: string
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<MineListResponse>('/assets/mines/all/', { params }),

    // 获取 YLD 转换矿山
    yldConverted: (params?: {
      search?: string
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<MineListResponse>('/assets/mines/yld-converted/', { params }),

    // 获取普通 YLD 矿山
    yldNormal: (params?: {
      search?: string
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<MineListResponse>('/assets/mines/yld-normal/', { params }),

    // 获取矿山详情
    get: (id: number) => assetsRequest<MineLand>(`/assets/mines/${id}/`),

    // 开始生产
    startProduction: (id: number) => assetsRequest<{
      success: boolean
      message: string
      data: {
        land_id: string
        is_producing: boolean
        production_started_at: string
      }
    }>(`/assets/mines/${id}/start-production/`, {
      method: 'POST',
    }),

    // 收取产出
    collectOutput: (id: number) => assetsRequest<{
      success: boolean
      message: string
      data: {
        land_id: string
        output_amount: number
        accumulated_output: number
        new_balance: number
      }
    }>(`/assets/mines/${id}/collect/`, {
      method: 'POST',
    }),

    // 获取统计信息
    stats: () => assetsRequest<{
      success: boolean
      data: MineStats
    }>('/assets/mines/stats/'),
  },

  // ==================== YLD 矿山相关（向后兼容） ====================
  yldMines: {
    // 获取我的所有矿山列表（不仅仅是 YLD）
    list: async (params?: {
      search?: string
      ordering?: string
      page?: number
      page_size?: number
    }) => {
      try {
        // 使用 /api/assets/mines/all/ 获取所有类型的矿山
        const response = await assetsApi.mines.all(params)

        // 转换统计信息格式
        const stats = response.stats ? {
          total_mines: response.stats.total_mines,
          total_yld_capacity: response.stats.total_initial_reserves || 0,
          total_accumulated_output: response.stats.total_accumulated_output || 0,
          producing_count: response.stats.producing_count || 0,
          by_batch: response.stats.by_batch?.map(batch => ({
            batch_id: batch.batch_id,
            count: batch.count,
            total_yld: batch.total_initial_reserves
          })) || []
        } : {
          total_mines: response.results.length,
          total_yld_capacity: response.results.reduce((sum, mine) => {
            // 只计算 YLD 矿山的储量
            if (mine.land_type === 'yld_mine' || mine.special_type === 'yld_converted') {
              const capacity = mine.initial_reserves ||
                parseFloat(mine.yld_capacity || '0') || 0
              return sum + capacity
            }
            return sum
          }, 0),
          total_accumulated_output: response.results.reduce((sum, mine) => {
            return sum + (parseFloat(mine.accumulated_output || '0') || 0)
          }, 0),
          producing_count: response.results.filter(m => m.is_producing).length,
          by_batch: []
        }

        const result: YLDMineListResponse = {
          count: response.count,
          next: response.next,
          previous: response.previous,
          results: response.results as YLDMine[],
          stats,
          pre_stats: response.stats
        }

        return result
      } catch (error) {
        // 如果新 API 失败，尝试旧的 API（如果存在）
        console.warn('[yldMines.list] 新 API 失败，尝试旧接口:', error)

        // 尝试旧的端点
        try {
          return await assetsRequest<YLDMineListResponse>('/assets/yld-mines/', { params })
        } catch (oldError) {
          // 如果旧接口也失败，抛出原始错误
          throw error
        }
      }
    },

    // 获取 YLD 矿山详情（兼容旧接口）
    get: async (id: number) => {
      try {
        // 使用新 API
        const mine = await assetsApi.mines.get(id)
        const yldMine = convertMineToYLDMine(mine)

        // 返回详情格式
        return {
          ...yldMine,
          blueprint: mine.blueprint_info || {} as LandBlueprint,
          region: mine.region_info || {} as Region,
        } as YLDMineDetail
      } catch (error) {
        // 如果新 API 失败，尝试旧的 API
        console.warn('[yldMines.get] 新 API 失败，尝试旧接口:', error)

        try {
          return await assetsRequest<YLDMineDetail>(`/assets/yld-mines/${id}/`)
        } catch (oldError) {
          throw error
        }
      }
    },

    // 开始生产（使用新 API）
    startProduction: (id: number) => assetsApi.mines.startProduction(id),

    // 收取产出（使用新 API）
    collectOutput: (id: number) => assetsApi.mines.collectOutput(id),

    // 获取全平台统计（兼容旧接口）
    getAllStats: async () => {
      try {
        const response = await assetsApi.mines.stats()

        // 转换为旧格式
        const oldFormat: YLDMineStats = {
          total_stats: {
            total_mines: response.data.total_mines,
            total_yld_capacity: response.data.total_yld_capacity || 0,
            total_users: 0,  // 新 API 可能没有这个字段
            producing_count: response.data.producing_count
          },
          batch_stats: [],  // 新 API 可能没有批次统计
          top_users: []  // 新 API 可能没有用户排行
        }

        return {
          success: true,
          data: oldFormat
        }
      } catch (error) {
        // 尝试旧接口
        console.warn('[yldMines.getAllStats] 新 API 失败，尝试旧接口:', error)

        try {
          return await assetsRequest<{
            success: boolean
            data: YLDMineStats
          }>('/assets/yld-mines/stats/')
        } catch (oldError) {
          throw error
        }
      }
    },
  },
}

// ==================== 辅助函数导出 ====================

// 获取 YLD 储量（使用正确的字段）
export function getYLDCapacity(mine: MineLand | YLDMine): number {
  // 1. 首先检查 remaining_reserves（剩余储量）
  if (mine.remaining_reserves !== undefined) {
    return mine.remaining_reserves
  }

  // 2. 检查 yld_capacity（当前储量）
  if (mine.yld_capacity !== undefined) {
    return typeof mine.yld_capacity === 'string'
      ? parseFloat(mine.yld_capacity) || 0
      : mine.yld_capacity
  }

  // 3. 检查 metadata 中的储量
  if (mine.metadata?.remaining_reserves !== undefined) {
    return mine.metadata.remaining_reserves
  }

  if (mine.metadata?.yld_reserves !== undefined) {
    return mine.metadata.yld_reserves
  }

  // 4. 向后兼容：检查 initial_price（旧版本可能用这个）
  if (mine.initial_price) {
    return parseFloat(mine.initial_price) || 0
  }

  return 0
}

// 获取初始 YLD 储量
export function getInitialYLDCapacity(mine: MineLand | YLDMine): number {
  // 1. 首先检查 initial_reserves
  if (mine.initial_reserves !== undefined) {
    return mine.initial_reserves
  }

  // 2. 检查 metadata 中的原始容量
  if (mine.metadata?.yld_capacity) {
    return parseFloat(mine.metadata.yld_capacity) || 0
  }

  // 3. 使用当前储量作为后备
  return getYLDCapacity(mine)
}

// 判断是否为 YLD 矿山
export function isYLDMine(mine: MineLand): boolean {
  // 检查 blueprint_info
  if (mine.blueprint_info?.land_type === 'yld_mine') {
    return true
  }

  // 检查 land_type
  if (mine.land_type === 'yld_mine') {
    return true
  }

  // 检查是否为转换矿山
  if (mine.special_type === 'yld_converted') {
    return true
  }

  return false
}

// 判断是否为转换矿山
export function isConvertedMine(mine: MineLand): boolean {
  return mine.special_type === 'yld_converted'
}
