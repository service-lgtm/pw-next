// src/lib/api/assets.ts
// 资产 API - 增加请求缓存和去重功能

import { API_BASE_URL, request, ApiError } from './index'
import type { 
  Region, 
  Land, 
  LandDetail, 
  LandBlueprint, 
  LandTransaction,
  PaginatedResponse 
} from '@/types/assets'

// 请求缓存类
class RequestCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private pending: Map<string, Promise<any>> = new Map()
  private cacheTime = 5000 // 5秒缓存
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // 检查是否有正在进行的请求
    const pending = this.pending.get(key)
    if (pending) {
      console.log('[RequestCache] Returning pending request for:', key)
      return pending
    }
    
    // 检查缓存
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      console.log('[RequestCache] Returning cached data for:', key)
      return cached.data
    }
    
    // 发起新请求
    console.log('[RequestCache] Making new request for:', key)
    const promise = fetcher().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() })
      this.pending.delete(key)
      return data
    }).catch(error => {
      this.pending.delete(key)
      throw error
    })
    
    this.pending.set(key, promise)
    return promise
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
    console.log('[RequestCache] Cache cleared', pattern ? `for pattern: ${pattern}` : 'completely')
  }
}

// 创建缓存实例
const requestCache = new RequestCache()

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
  // 区域相关
  regions: {
    list: (params?: {
      region_type?: string
      parent_id?: number
      level?: number
      is_active?: boolean
      is_open_for_sale?: boolean
      search?: string
    }) => {
      const cacheKey = `regions:list:${JSON.stringify(params || {})}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<PaginatedResponse<Region>>('/assets/regions/', { params })
      )
    },
    
    get: (id: number) => {
      const cacheKey = `regions:get:${id}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<Region>(`/assets/regions/${id}/`)
      )
    },
    
    stats: (id: number) => {
      const cacheKey = `regions:stats:${id}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<{
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
        }>(`/assets/regions/${id}/stats/`)
      )
    },
  },
  
  // 蓝图相关
  blueprints: {
    list: (params?: {
      land_type?: string
      is_active?: boolean
      ordering?: string
    }) => {
      const cacheKey = `blueprints:list:${JSON.stringify(params || {})}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<PaginatedResponse<LandBlueprint>>('/assets/blueprints/', { params })
      )
    },
    
    get: (id: number) => {
      const cacheKey = `blueprints:get:${id}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<LandBlueprint>(`/assets/blueprints/${id}/`)
      )
    },
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
    }) => {
      const cacheKey = `lands:available:${JSON.stringify(params || {})}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<PaginatedResponse<Land>>('/assets/lands/available/', { params })
      )
    },
    
    myLands: (params?: {
      blueprint__land_type?: string
      status?: string
      is_special?: boolean
      is_rented?: boolean
      ordering?: string
      page?: number
      page_size?: number
    }) => {
      // 我的土地不使用缓存，因为需要实时数据
      return assetsRequest<PaginatedResponse<Land>>('/assets/lands/my-lands/', { params })
    },
    
    get: (id: number) => {
      const cacheKey = `lands:get:${id}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<LandDetail>(`/assets/lands/${id}/`)
      )
    },
    
    buy: (data: {
      land_id: number
      payment_password: string
    }) => {
      // 购买操作不使用缓存
      // 购买成功后清除相关缓存
      const result = assetsRequest<{
        success: boolean
        message: string
        data: LandDetail
      }>('/assets/lands/buy/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      // 清除土地相关缓存
      result.then(() => {
        requestCache.clear('lands:')
        requestCache.clear('regions:stats:')
      })
      
      return result
    },
    
    transfer: (data: {
      land_id: number
      to_user_id: number
      payment_password: string
    }) => {
      // 转让操作不使用缓存
      const result = assetsRequest<{
        success: boolean
        message: string
        data: { land_id: string; new_owner: string }
      }>('/assets/lands/transfer/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      // 清除土地相关缓存
      result.then(() => {
        requestCache.clear('lands:')
        requestCache.clear('regions:stats:')
      })
      
      return result
    },
    
    transactions: (landId: number, params?: {
      transaction_type?: string
      ordering?: string
    }) => {
      const cacheKey = `lands:transactions:${landId}:${JSON.stringify(params || {})}`
      return requestCache.get(cacheKey, () => 
        assetsRequest<PaginatedResponse<LandTransaction>>(
          `/assets/lands/${landId}/transactions/`,
          { params }
        )
      )
    },
  },
  
  // 缓存管理
  cache: {
    clear: (pattern?: string) => requestCache.clear(pattern)
  }
}
