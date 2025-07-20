// src/hooks/useRegions.ts
// 区域数据Hook - 最终修复版本

import { useState, useEffect, useRef } from 'react'
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
  
  // 使用 useRef 来存储上一次的请求参数
  const lastRequestRef = useRef<string>('')
  
  useEffect(() => {
    // 创建请求参数的唯一标识
    const requestKey = JSON.stringify({
      parent_id: options.parent_id,
      region_type: options.regionType,
      is_active: options.isActive,
      is_open_for_sale: options.isOpenForSale,
    })
    
    // 如果参数没有变化，不重新请求
    if (requestKey === lastRequestRef.current) {
      return
    }
    
    // 更新最后一次请求的参数
    lastRequestRef.current = requestKey
    
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
  }, [options.parent_id, options.regionType, options.isActive, options.isOpenForSale])
  
  return { regions, loading, error }
}

export function useRegion(id: number) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 使用 useRef 来防止重复请求
  const lastIdRef = useRef<number | null>(null)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setError('无效的区域ID')
      setLoading(false)
      return
    }
    
    // 如果 ID 没有变化，不重新请求
    if (id === lastIdRef.current) {
      return
    }
    
    lastIdRef.current = id
    
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
  
  // 使用 useRef 来防止重复请求
  const lastIdRef = useRef<number | null>(null)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setLoading(false)
      return
    }
    
    // 如果 ID 没有变化，不重新请求
    if (id === lastIdRef.current) {
      return
    }
    
    lastIdRef.current = id
    
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
