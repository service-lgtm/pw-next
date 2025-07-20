// src/hooks/useLands.ts
// 土地数据Hook - 修复循环请求问题

import { useState, useEffect, useCallback, useMemo } from 'react'
import { assetsApi } from '@/lib/api/assets'
import type { Land, LandDetail, PaginatedResponse, FilterState } from '@/types/assets'

// 获取可购买的土地列表
export function useLands(filters: Partial<FilterState> | null = {}) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<any>(null)
  
  // 使用 useMemo 稳定请求参数
  const stableParams = useMemo(() => {
    if (filters === null) return null
    
    const params: any = {
      page: filters.page || 1,
      page_size: filters.page_size || 20,
      ordering: filters.ordering || '-created_at',
    }
    
    if (filters.land_type && filters.land_type !== 'all') {
      params.blueprint__land_type = filters.land_type
    }
    
    if (filters.priceRange?.min) {
      params.min_price = filters.priceRange.min
    }
    
    if (filters.priceRange?.max) {
      params.max_price = filters.priceRange.max
    }
    
    if (filters.search) {
      params.search = filters.search
    }
    
    if (filters.region_id) {
      params.region_id = filters.region_id
    }
    
    return params
  }, [
    filters?.page,
    filters?.page_size,
    filters?.ordering,
    filters?.land_type,
    filters?.priceRange?.min,
    filters?.priceRange?.max,
    filters?.search,
    filters?.region_id
  ])
  
  const fetchLands = useCallback(async () => {
    // 如果 filters 为 null，说明不应该加载土地
    if (stableParams === null) {
      setLands([])
      setLoading(false)
      return
    }
    
    let cancelled = false
    
    const doFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useLands] Fetching lands with params:', stableParams)
        
        const response = await assetsApi.lands.available(stableParams)
        
        if (cancelled) {
          console.log('[useLands] Request cancelled')
          return
        }
        
        setLands(response.results)
        setHasMore(!!response.next)
        setTotalCount(response.count)
        setStats(response.stats)
        
        console.log('[useLands] Loaded lands:', response.results.length)
      } catch (err) {
        if (cancelled) return
        
        setError(err instanceof Error ? err.message : '加载失败')
        console.error('[useLands] Error:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    doFetch()
    
    return () => {
      cancelled = true
    }
  }, [stableParams])
  
  useEffect(() => {
    const cleanup = fetchLands()
    return cleanup
  }, [fetchLands])
  
  return { lands, loading, error, hasMore, totalCount, stats, refetch: fetchLands }
}

// 获取土地详情
export function useLandDetail(id: number) {
  const [land, setLand] = useState<LandDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    let cancelled = false
    
    const fetchLand = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useLandDetail] Fetching land:', id)
        
        const data = await assetsApi.lands.get(id)
        
        if (cancelled) {
          console.log('[useLandDetail] Request cancelled')
          return
        }
        
        setLand(data)
        console.log('[useLandDetail] Loaded land:', data.land_id)
      } catch (err) {
        if (cancelled) return
        
        setError(err instanceof Error ? err.message : '加载失败')
        console.error('[useLandDetail] Error:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    if (id) {
      fetchLand()
    }
    
    return () => {
      cancelled = true
    }
  }, [id])
  
  return { land, loading, error }
}

// 获取用户的所有土地
export function useMyLands() {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  const fetchMyLands = useCallback(async () => {
    let cancelled = false
    
    const doFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useMyLands] Fetching user lands')
        
        const response = await assetsApi.lands.myLands({
          page_size: 100 // 获取更多数据
        })
        
        if (cancelled) {
          console.log('[useMyLands] Request cancelled')
          return
        }
        
        setLands(response.results)
        setStats(response.stats)
        
        console.log('[useMyLands] Loaded user lands:', response.results.length)
      } catch (err) {
        if (cancelled) return
        
        setError(err instanceof Error ? err.message : '加载失败')
        console.error('[useMyLands] Error:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    doFetch()
    
    return () => {
      cancelled = true
    }
  }, [])
  
  useEffect(() => {
    const cleanup = fetchMyLands()
    return cleanup
  }, [fetchMyLands])
  
  return { lands, loading, error, stats, refetch: fetchMyLands }
}

// 获取用户在特定区域的土地
export function useMyLandsInRegion(regionId: number | null, regionName?: string) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 使用 useMemo 确保依赖项稳定
  const stableRegionId = useMemo(() => regionId, [regionId])
  const stableRegionName = useMemo(() => regionName, [regionName])
  
  const fetchMyLandsInRegion = useCallback(async () => {
    if (!stableRegionId) {
      setLands([])
      setLoading(false)
      return
    }
    
    let cancelled = false
    
    const doFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useMyLandsInRegion] Fetching lands for region:', stableRegionId, stableRegionName)
        
        // 获取用户所有土地
        const response = await assetsApi.lands.myLands({
          page_size: 100 // 确保获取所有土地
        })
        
        if (cancelled) {
          console.log('[useMyLandsInRegion] Request cancelled')
          return
        }
        
        console.log('[useMyLandsInRegion] Total user lands:', response.results.length)
        
        // 过滤出在当前区域的土地
        const landsInRegion = response.results.filter(land => {
          // 方法1: 如果土地有 region_id 字段
          if ('region_id' in land && land.region_id === stableRegionId) {
            return true
          }
          
          // 方法2: 通过区域名称匹配
          if (stableRegionName && land.region_name === stableRegionName) {
            return true
          }
          
          // 方法3: 解析 land_id 中的区域代码
          // land_id 格式可能是: LAND-CN-BJ-CY-xxxxx
          // 这需要知道区域的代码
          
          return false
        })
        
        console.log('[useMyLandsInRegion] Filtered lands in region:', landsInRegion.length)
        
        // 如果没有找到该区域的土地，返回所有土地（临时解决方案）
        if (landsInRegion.length === 0 && response.results.length > 0) {
          console.log('[useMyLandsInRegion] No lands in specific region, showing all lands')
          setLands(response.results)
        } else {
          setLands(landsInRegion)
        }
      } catch (err) {
        if (cancelled) return
        
        console.error('[useMyLandsInRegion] Error:', err)
        // 如果是认证错误，不显示错误，只是返回空数组
        if (err instanceof Error && err.message.includes('401')) {
          setLands([])
        } else {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    doFetch()
    
    return () => {
      cancelled = true
    }
  }, [stableRegionId, stableRegionName])
  
  useEffect(() => {
    const cleanup = fetchMyLandsInRegion()
    return cleanup
  }, [fetchMyLandsInRegion])
  
  return { lands, loading, error, refetch: fetchMyLandsInRegion }
}
