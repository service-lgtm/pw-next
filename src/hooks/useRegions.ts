// src/hooks/useRegions.ts
// 区域数据Hook - 修复循环请求问题

import { useState, useEffect, useMemo } from 'react'
import { assetsApi } from '@/lib/api/assets'
import { ApiError } from '@/lib/api'
import type { Region } from '@/types/assets'

interface UseRegionsOptions {
  parent_id?: number
  regionType?: string
  isActive?: boolean
  isOpenForSale?: boolean
}

export function useRegions(options: UseRegionsOptions = {}) {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 使用 useMemo 来稳定请求参数，避免对象引用变化导致的重复请求
  const stableParams = useMemo(() => ({
    parent_id: options.parent_id,
    region_type: options.regionType,
    is_active: options.isActive,
    is_open_for_sale: options.isOpenForSale,
  }), [options.parent_id, options.regionType, options.isActive, options.isOpenForSale])
  
  useEffect(() => {
    // 添加取消标志，防止组件卸载后更新状态
    let cancelled = false
    
    const fetchRegions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegions] Fetching regions with params:', stableParams)
        
        const response = await assetsApi.regions.list(stableParams)
        
        // 如果组件已卸载，不要更新状态
        if (cancelled) {
          console.log('[useRegions] Request cancelled, skipping state update')
          return
        }
        
        setRegions(response.results)
        console.log('[useRegions] Loaded regions:', response.results.length)
      } catch (err) {
        // 如果组件已卸载，不要更新状态
        if (cancelled) {
          console.log('[useRegions] Error handling cancelled')
          return
        }
        
        if (err instanceof ApiError && err.status === 403) {
          console.log('[useRegions] 用户未登录，显示登录提示')
          setError('需要登录后查看')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        // 如果组件已卸载，不要更新状态
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchRegions()
    
    // 清理函数：组件卸载时设置取消标志
    return () => {
      cancelled = true
      console.log('[useRegions] Cleanup: setting cancelled flag')
    }
  }, [stableParams.parent_id, stableParams.region_type, stableParams.is_active, stableParams.is_open_for_sale])
  
  return { regions, loading, error }
}

export function useRegion(id: number) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // 添加取消标志
    let cancelled = false
    
    const fetchRegion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegion] Fetching region:', id)
        
        const data = await assetsApi.regions.get(id)
        
        if (cancelled) {
          console.log('[useRegion] Request cancelled, skipping state update')
          return
        }
        
        setRegion(data)
        console.log('[useRegion] Loaded region:', data.name)
      } catch (err) {
        if (cancelled) {
          console.log('[useRegion] Error handling cancelled')
          return
        }
        
        if (err instanceof ApiError && err.status === 403) {
          setError('需要登录后查看')
        } else if (err instanceof ApiError && err.status === 404) {
          setError('区域不存在')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    if (id) {
      fetchRegion()
    }
    
    return () => {
      cancelled = true
      console.log('[useRegion] Cleanup: setting cancelled flag')
    }
  }, [id])
  
  return { region, loading, error }
}

export function useRegionStats(id: number) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    let cancelled = false
    
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegionStats] Fetching stats for region:', id)
        
        const response = await assetsApi.regions.stats(id)
        
        if (cancelled) {
          console.log('[useRegionStats] Request cancelled, skipping state update')
          return
        }
        
        if (response.success) {
          setStats(response.data)
          console.log('[useRegionStats] Loaded stats:', response.data)
        }
      } catch (err) {
        if (cancelled) {
          console.log('[useRegionStats] Error handling cancelled')
          return
        }
        
        if (err instanceof ApiError && err.status === 403) {
          console.log('[useRegionStats] 需要登录后查看统计信息')
          // 不设置错误，让UI显示登录提示
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    if (id) {
      fetchStats()
    }
    
    return () => {
      cancelled = true
      console.log('[useRegionStats] Cleanup: setting cancelled flag')
    }
  }, [id])
  
  return { stats, loading, error }
}
