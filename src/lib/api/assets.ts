// src/lib/api/assets.ts
// 修改API请求以处理认证错误

import { API_BASE_URL } from '@/lib/api'
import type { 
  Region, 
  Land, 
  LandDetail, 
  LandBlueprint, 
  LandTransaction,
  PaginatedResponse 
} from '@/types/assets'

// 基础请求函数 - 增强错误处理
async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any>, requireAuth?: boolean } = {}
): Promise<T> {
  const { params, requireAuth = false, ...init } = options
  
  let url = `${API_BASE_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      
      // 如果是403错误且不需要认证，返回默认值
      if (response.status === 403 && !requireAuth) {
        console.warn(`[API] 未认证访问 ${endpoint}，返回默认数据`)
        // 根据不同的端点返回不同的默认值
        if (endpoint.includes('/lands/my-lands')) {
          return { count: 0, results: [], next: null, previous: null } as any
        }
        // 其他端点继续抛出错误
      }
      
      throw new Error(error.message || error.detail || `HTTP ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    // 网络错误或其他错误
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw error
  }
}

export const assetsApi = {
  // 区域相关 - 这些应该是公开的
  regions: {
    list: (params?: {
      region_type?: string
      parent_id?: number
      level?: number
      is_active?: boolean
      is_open_for_sale?: boolean
      search?: string
    }) => request<PaginatedResponse<Region>>('/assets/regions/', { params }),
    
    get: (id: number) => request<Region>(`/assets/regions/${id}/`),
    
    stats: (id: number) => request<{
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
  
  // 蓝图相关 - 公开
  blueprints: {
    list: (params?: {
      land_type?: string
      is_active?: boolean
      ordering?: string
    }) => request<PaginatedResponse<LandBlueprint>>('/assets/blueprints/', { params }),
    
    get: (id: number) => request<LandBlueprint>(`/assets/blueprints/${id}/`),
  },
  
  // 土地相关
  lands: {
    // 可购买土地列表 - 应该是公开的
    available: (params?: {
      blueprint__land_type?: string
      region_id?: number
      min_price?: number
      max_price?: number
      ordering?: string
      page?: number
      page_size?: number
    }) => request<PaginatedResponse<Land>>('/assets/lands/available/', { params }),
    
    // 我的土地列表 - 需要认证
    myLands: (params?: {
      blueprint__land_type?: string
      status?: string
      is_special?: boolean
      is_rented?: boolean
      ordering?: string
      page?: number
      page_size?: number
    }) => request<PaginatedResponse<Land>>('/assets/lands/my-lands/', { 
      params,
      requireAuth: true  // 标记需要认证
    }),
    
    // 土地详情 - 公开
    get: (id: number) => request<LandDetail>(`/assets/lands/${id}/`),
    
    // 购买土地 - 需要认证
    buy: (data: {
      land_id: number
      payment_password: string
    }) => request<{
      success: boolean
      message: string
      data: LandDetail
    }>('/assets/lands/buy/', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true
    }),
    
    // 转让土地 - 需要认证
    transfer: (data: {
      land_id: number
      to_user_id: number
      payment_password: string
    }) => request<{
      success: boolean
      message: string
      data: { land_id: string; new_owner: string }
    }>('/assets/lands/transfer/', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true
    }),
    
    // 土地交易历史 - 公开
    transactions: (landId: number, params?: {
      transaction_type?: string
      ordering?: string
    }) => request<PaginatedResponse<LandTransaction>>(
      `/assets/lands/${landId}/transactions/`,
      { params }
    ),
  },
}
