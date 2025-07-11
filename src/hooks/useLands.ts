// src/hooks/useLands.ts
// 土地数据Hook

import { useState, useEffect, useCallback } from 'react'
import { assetsApi } from '@/lib/api/assets'
import type { Land, LandDetail, PaginatedResponse, FilterState } from '@/types/assets'

export function useLands(filters: Partial<FilterState> | null = {}) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<any>(null)
  
  const fetchLands = useCallback(async () => {
    // 如果 filters 为 null，说明不应该加载土地
    if (filters === null) {
      setLands([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
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
      
      const response = await assetsApi.lands.available(params)
      
      setLands(response.results)
      setHasMore(!!response.next)
      setTotalCount(response.count)
      setStats(response.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  useEffect(() => {
    fetchLands()
  }, [fetchLands])
  
  return { lands, loading, error, hasMore, totalCount, stats, refetch: fetchLands }
}

export function useLandDetail(id: number) {
  const [land, setLand] = useState<LandDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchLand = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await assetsApi.lands.get(id)
        setLand(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchLand()
    }
  }, [id])
  
  return { land, loading, error }
}


export function useMyLandsInRegion(regionId: number | null) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchMyLandsInRegion = useCallback(async () => {
    if (!regionId) {
      setLands([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // 获取用户所有土地
      const response = await assetsApi.lands.myLands({
        page_size: 100 // 获取更多数据
      })
      
      // 过滤出在当前区域的土地
      const landsInRegion = response.results.filter(land => {
        // 这里需要根据后端返回的数据结构来判断
        // 假设土地有 region_id 字段
        return land.region_id === regionId || land.region_name === regionId
      })
      
      setLands(landsInRegion)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [regionId])
  
  useEffect(() => {
    fetchMyLandsInRegion()
  }, [fetchMyLandsInRegion])
  
  return { lands, loading, error, refetch: fetchMyLandsInRegion }
}

export function useMyLands() {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  const fetchMyLands = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await assetsApi.lands.myLands()
      
      setLands(response.results)
      setStats(response.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchMyLands()
  }, [fetchMyLands])
  
  return { lands, loading, error, stats, refetch: fetchMyLands }
}
