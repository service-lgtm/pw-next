// src/hooks/useYLDMines.ts
// YLD 矿山数据 Hook
//
// 文件说明：
// 1. 本文件提供 YLD 矿山相关的数据获取 Hook
// 2. 包括列表获取、详情获取、生产操作等
// 3. 自动处理加载状态、错误处理和数据缓存
//
// 关联文件：
// - src/lib/api/assets.ts: YLD 矿山 API 接口
// - src/types/assets.ts: YLD 矿山类型定义
// - src/app/mining/page.tsx: 挖矿页面使用这些 Hook

import { useState, useEffect, useCallback } from 'react'
import { assetsApi } from '@/lib/api/assets'
import { ApiError } from '@/lib/api'
import type { YLDMine, YLDMineDetail, YLDMineListResponse } from '@/types/assets'

// ==================== 获取我的 YLD 矿山列表 ====================
export function useMyYLDMines(params?: {
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}) {
  const [mines, setMines] = useState<YLDMine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<YLDMineListResponse['stats'] | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  
  const fetchMines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMyYLDMines] 开始获取 YLD 矿山列表')
      
      const response = await assetsApi.yldMines.list({
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        search: params?.search,
        ordering: params?.ordering || '-created_at',
      })
      
      console.log('[useMyYLDMines] 获取成功:', {
        count: response.count,
        results: response.results.length,
        stats: response.stats
      })
      
      setMines(response.results)
      setTotalCount(response.count)
      setHasMore(!!response.next)
      
      if (response.stats) {
        setStats(response.stats)
      }
    } catch (err) {
      console.error('[useMyYLDMines] 获取失败:', err)
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('请先登录')
        } else if (err.status === 403) {
          setError('无权限查看')
        } else if (err.status === 404) {
          // 404 可能表示没有矿山，这不是错误
          setMines([])
          setTotalCount(0)
          setError(null)
        } else {
          setError(err.message || '加载失败')
        }
      } else {
        setError('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }, [params?.page, params?.page_size, params?.search, params?.ordering])
  
  useEffect(() => {
    fetchMines()
  }, [fetchMines])
  
  return {
    mines,
    loading,
    error,
    stats,
    totalCount,
    hasMore,
    refetch: fetchMines
  }
}

// ==================== 获取 YLD 矿山详情 ====================
export function useYLDMineDetail(id: number | null) {
  const [mine, setMine] = useState<YLDMineDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!id || id <= 0) {
      setMine(null)
      setLoading(false)
      return
    }
    
    const fetchMineDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useYLDMineDetail] 获取矿山详情, ID:', id)
        
        const data = await assetsApi.yldMines.get(id)
        
        console.log('[useYLDMineDetail] 获取成功:', data)
        
        setMine(data)
      } catch (err) {
        console.error('[useYLDMineDetail] 获取失败:', err)
        
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setError('请先登录')
          } else if (err.status === 403) {
            setError('您没有权限查看此矿山')
          } else if (err.status === 404) {
            setError('矿山不存在')
          } else {
            setError(err.message || '加载失败')
          }
        } else {
          setError('网络错误，请稍后重试')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchMineDetail()
  }, [id])
  
  return { mine, loading, error }
}

// ==================== 开始矿山生产（预留接口） ====================
export function useStartMineProduction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const startProduction = useCallback(async (mineId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useStartMineProduction] 开始生产, 矿山ID:', mineId)
      
      const response = await assetsApi.yldMines.startProduction(mineId)
      
      console.log('[useStartMineProduction] 开始生产成功:', response)
      
      return response
    } catch (err) {
      console.error('[useStartMineProduction] 开始生产失败:', err)
      
      let errorMessage = '操作失败'
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = '请先登录'
        } else if (err.status === 403) {
          errorMessage = '无权限操作'
        } else if (err.status === 404) {
          errorMessage = '矿山不存在'
        } else if (err.status === 400) {
          errorMessage = err.message || '矿山已在生产中'
        } else {
          errorMessage = err.message || '操作失败'
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    startProduction,
    loading,
    error
  }
}

// ==================== 收取矿山产出（预留接口） ====================
export function useCollectMineOutput() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const collectOutput = useCallback(async (mineId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useCollectMineOutput] 收取产出, 矿山ID:', mineId)
      
      const response = await assetsApi.yldMines.collectOutput(mineId)
      
      console.log('[useCollectMineOutput] 收取成功:', response)
      
      return response
    } catch (err) {
      console.error('[useCollectMineOutput] 收取失败:', err)
      
      let errorMessage = '操作失败'
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = '请先登录'
        } else if (err.status === 403) {
          errorMessage = '无权限操作'
        } else if (err.status === 404) {
          errorMessage = '矿山不存在'
        } else if (err.status === 400) {
          errorMessage = err.message || '产出太少或矿山未在生产'
        } else {
          errorMessage = err.message || '操作失败'
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return {
    collectOutput,
    loading,
    error
  }
}

// ==================== 获取 YLD 矿山统计信息（管理员功能） ====================
export function useYLDMineStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await assetsApi.yldMines.getAllStats()
        
        if (response.success) {
          setStats(response.data)
        }
      } catch (err) {
        // 非管理员用户会返回 403，这是正常的
        if (err instanceof ApiError && err.status === 403) {
          console.log('[useYLDMineStats] 非管理员用户，跳过统计信息')
        } else {
          console.error('[useYLDMineStats] 获取统计失败:', err)
          setError('获取统计信息失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  return { stats, loading, error }
}
