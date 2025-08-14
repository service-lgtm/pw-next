// src/lib/api/assets.ts
// 资产 API - 包含 YLD 矿山接口
// 
// 文件说明：
// 1. 本文件包含所有资产相关的 API 接口
// 2. 包括区域、土地蓝图、土地、YLD矿山等
// 3. 使用 JWT 认证，自动处理 token
// 4. 支持公开和需要认证的端点
//
// 关联文件：
// - src/lib/api/index.ts: 基础请求函数和认证管理
// - src/types/assets.ts: 资产相关类型定义
// - src/hooks/useLands.ts: 土地相关的 Hook
// - src/hooks/useYLDMines.ts: YLD矿山相关的 Hook（需创建）

import { API_BASE_URL, request, ApiError } from './index'
import type { 
  Region, 
  Land, 
  LandDetail, 
  LandBlueprint, 
  LandTransaction,
  PaginatedResponse
} from '@/types/assets'

// YLD 矿山类型定义（临时定义，应该移到 types/assets.ts）
export interface YLDMine {
  id: number
  land_id: string
  blueprint_name: string
  land_type: string
  land_type_display: string
  size_sqm: number
  region_name: string
  coordinate_x: number
  coordinate_y: number
  owner: number
  owner_username: string
  status: string
  status_display: string
  current_price: string
  initial_price: string
  is_special: boolean
  special_type: string
  is_producing: boolean
  production_started_at: string | null
  accumulated_output: string
  metadata: {
    batch_id?: string
    conversion_date?: string
    yld_amount?: string
    daily_output?: string
    [key: string]: any
  }
  created_at: string
  owned_at: string
}

export interface YLDMineDetail extends YLDMine {
  blueprint: LandBlueprint
  region: Region
  transaction_count: number
  last_transaction_price: string
  total_transaction_volume: string
  last_transaction_at: string | null
  construction_level: number
  is_under_construction: boolean
  construction_started_at: string | null
  is_rented: boolean
  tenant: number | null
  tenant_info: any
  rental_price: string | null
  recent_transactions: LandTransaction[]
}

export interface YLDMineStats {
  total_stats: {
    total_mines: number
    total_yld_capacity: number
    total_users: number
    producing_count: number
  }
  batch_stats: Array<{
    batch_id: string
    created_at: string
    mines_count: number
    yld_converted: number
    users_processed: number
  }>
  top_users: Array<{
    user_id: number
    username: string
    mines_count: number
    total_yld: number
  }>
}

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
    
    // 购买土地
    buy: (data: {
      land_id: number
      payment_password: string
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
  
  // ==================== YLD 矿山相关 ====================
  // 对应后端的 YLD 矿山接口
  yldMines: {
    // 获取我的 YLD 矿山列表
    // 对应后端: /assets/yld-mines/
    list: (params?: {
      search?: string
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<{
      count: number
      next: string | null
      previous: string | null
      results: YLDMine[]
      stats?: {
        total_mines: number
        total_yld_capacity: number
        total_accumulated_output: number
        producing_count: number
        by_batch: Array<{
          batch_id: string
          count: number
          total_yld: number
        }>
      }
    }>('/assets/yld-mines/', { params }),
    
    // 获取 YLD 矿山详情
    // 对应后端: /assets/yld-mines/<id>/
    get: (id: number) => assetsRequest<YLDMineDetail>(`/assets/yld-mines/${id}/`),
    
    // 开始生产（需要后续实现）
    // 对应后端: /assets/yld-mines/<id>/start-production/
    startProduction: (id: number) => assetsRequest<{
      success: boolean
      message: string
      data: {
        land_id: string
        is_producing: boolean
        production_started_at: string
      }
    }>(`/assets/yld-mines/${id}/start-production/`, {
      method: 'POST',
    }),
    
    // 收取产出（需要后续实现）
    // 对应后端: /assets/yld-mines/<id>/collect/
    collectOutput: (id: number) => assetsRequest<{
      success: boolean
      message: string
      data: {
        land_id: string
        output_amount: number
        accumulated_output: number
        new_balance: number
      }
    }>(`/assets/yld-mines/${id}/collect/`, {
      method: 'POST',
    }),
    
    // 获取全平台统计（需要管理员权限）
    // 对应后端: /assets/yld-mines/stats/
    getAllStats: () => assetsRequest<{
      success: boolean
      data: YLDMineStats
    }>('/assets/yld-mines/stats/'),
  },
}
