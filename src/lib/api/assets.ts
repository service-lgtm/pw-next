// src/lib/api/assets.ts
// 土地资产API服务层

import { API_BASE_URL } from '@/lib/api'
import type { 
  Region, 
  Land, 
  LandDetail, 
  LandBlueprint, 
  LandTransaction,
  PaginatedResponse 
} from '@/types/assets'

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<T> {
  const { params, ...init } = options
  
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
  
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
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
  
  // 蓝图相关
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
    available: (params?: {
      blueprint__land_type?: string
      region_id?: number
      min_price?: number
      max_price?: number
      ordering?: string
      page?: number
      page_size?: number
    }) => request<PaginatedResponse<Land>>('/assets/lands/available/', { params }),
    
    myLands: (params?: {
      blueprint__land_type?: string
      status?: string
      is_special?: boolean
      is_rented?: boolean
      ordering?: string
      page?: number
      page_size?: number
    }) => request<PaginatedResponse<Land>>('/assets/lands/my-lands/', { params }),
    
    get: (id: number) => request<LandDetail>(`/assets/lands/${id}/`),
    
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
    }),
    
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
    }),
    
    transactions: (landId: number, params?: {
      transaction_type?: string
      ordering?: string
    }) => request<PaginatedResponse<LandTransaction>>(
      `/assets/lands/${landId}/transactions/`,
      { params }
    ),
  },
}
