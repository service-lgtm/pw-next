// src/hooks/useRegions.ts
// 区域数据Hook

import { useState, useEffect } from 'react'
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
  
  // 使用 JSON.stringify 来比较对象内容而非引用
  const optionsKey = JSON.stringify({
    parent_id: options.parent_id,
    region_type: options.regionType,
    is_active: options.isActive,
    is_open_for_sale: options.isOpenForSale,
  })
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await assetsApi.regions.list({
          parent_id: options.parent_id,
          region_type: options.regionType,
          is_active: options.isActive,
          is_open_for_sale: options.isOpenForSale,
        })
        
        setRegions(response.results)
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          console.log('[useRegions] 用户未登录，显示登录提示')
          setError('需要登录后查看')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchRegions()
  }, [optionsKey])
  
  return { regions, loading, error }
}

export function useRegion(id: number) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setError('无效的区域ID')
      setLoading(false)
      return
    }
    
    const fetchRegion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await assetsApi.regions.get(id)
        setRegion(data)
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setError('需要登录后查看')
        } else if (err instanceof ApiError && err.status === 404) {
          setError('区域不存在')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchRegion()
  }, [id])
  
  return { region, loading, error }
}

export function useRegionStats(id: number) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setLoading(false)
      return
    }
    
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
          console.log('[useRegionStats] 需要登录后查看统计信息')
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [id])
  
  return { stats, loading, error }
}
