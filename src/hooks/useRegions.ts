// src/hooks/useRegions.ts
// 区域数据Hook - 改进错误处理

import { useState, useEffect } from 'react'
import { assetsApi } from '@/lib/api/assets'
import { ApiError } from '@/lib/api'
import type { Region, PaginatedResponse } from '@/types/assets'

interface UseRegionsOptions {
  parent_id?: number  // 修改为 parent_id
  regionType?: string
  isActive?: boolean
  isOpenForSale?: boolean
}

export function useRegions(options: UseRegionsOptions = {}) {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await assetsApi.regions.list({
          parent_id: options.parent_id,  // 使用 parent_id
          region_type: options.regionType,
          is_active: options.isActive,
          is_open_for_sale: options.isOpenForSale,
        })
        
        setRegions(response.results)
      } catch (err) {
        // 特殊处理认证错误
        if (err instanceof ApiError && err.status === 403) {
          // 不设置错误，让页面显示登录提示
          console.log('[useRegions] 用户未登录，显示登录提示')
          setError('需要登录后查看')
        } else {
          // 其他错误正常处理
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchRegions()
  }, [options.parent_id, options.regionType, options.isActive, options.isOpenForSale])
  
  return { regions, loading, error }
}
  
  return { regions, loading, error }
}

export function useRegion(id: number) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await assetsApi.regions.get(id)
        setRegion(data)
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setError('需要登录后查看')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchRegion()
    }
  }, [id])
  
  return { region, loading, error }
}

export function useRegionStats(id: number) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await assetsApi.regions.stats(id)
        if (response.success) {
          setStats(response.data)
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          // 统计信息需要登录，但不显示错误，只是没有数据
          console.log('[useRegionStats] 需要登录后查看统计信息')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchStats()
    }
  }, [id])
  
  return { stats, loading, error }
}
