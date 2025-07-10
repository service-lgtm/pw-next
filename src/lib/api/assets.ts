// src/lib/api/assets.ts
// 修复资产 API 导入

import { API_BASE_URL, request, ApiError } from './index'
import type { 
  Region, 
  Land, 
  LandDetail, 
  LandBlueprint, 
  LandTransaction,
  PaginatedResponse 
} from '@/types/assets'

// 增强的请求函数，处理认证错误
async function assetsRequest<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<T> {
  try {
    return await request<T>(endpoint, options)
  } catch (error) {
    // 如果是认证错误，对于某些端点返回空数据
    if (error instanceof ApiError && error.status === 403) {
      // 这些端点在未登录时应该返回空数据而不是报错
      if (endpoint.includes('/regions/') || endpoint.includes('/blueprints/') || endpoint.includes('/lands/available/')) {
        console.warn(`[API] 未认证访问 ${endpoint}，可能需要登录获取完整数据`)
        // 根据端点返回合适的空数据结构
        if (endpoint.includes('/lands/')) {
          return { count: 0, results: [], next: null, previous: null } as any
        }
      }
    }
    throw error
  }
}

export const assetsApi = {
  // 区域相关
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
  
  // 蓝图相关
  blueprints: {
    list: (params?: {
      land_type?: string
      is_active?: boolean
      ordering?: string
    }) => assetsRequest<PaginatedResponse<LandBlueprint>>('/assets/blueprints/', { params }),
    
    get: (id: number) => assetsRequest<LandBlueprint>(`/assets/blueprints/${id}/`),
  },
  
  // 土地相关
  lands: {
    available: (params?: {
      blueprint__land_type?: string
      region_id?: number
      min_price?: number
      max_price?: number
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<PaginatedResponse<Land>>('/assets/lands/available/', { params }),
    
    myLands: (params?: {
      blueprint__land_type?: string
      status?: string
      is_special?: boolean
      is_rented?: boolean
      ordering?: string
      page?: number
      page_size?: number
    }) => assetsRequest<PaginatedResponse<Land>>('/assets/lands/my-lands/', { params }),
    
    get: (id: number) => assetsRequest<LandDetail>(`/assets/lands/${id}/`),
    
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
    
    transactions: (landId: number, params?: {
      transaction_type?: string
      ordering?: string
    }) => assetsRequest<PaginatedResponse<LandTransaction>>(
      `/assets/lands/${landId}/transactions/`,
      { params }
    ),
  },
}
