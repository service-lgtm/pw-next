// src/hooks/useLands.ts
// 土地数据Hook - 修复循环调用问题
//
// 文件说明：
// 1. 修复了filters对象不稳定导致的循环调用问题
// 2. 使用深度比较来检测参数是否真正变化
// 3. 添加请求去重和竞态条件处理
// 4. 保持所有现有功能的兼容性
//
// 关联文件：
// - src/app/explore/regions/[regionId]/page.tsx: 区域详情页使用此Hook
// - src/app/assets/page.tsx: 资产页面使用useMyLands
// - src/lib/api/assets.ts: 调用土地相关API
// - src/types/assets.ts: Land, LandDetail类型定义

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { assetsApi } from '@/lib/api/assets'
import type { Land, LandDetail, PaginatedResponse, FilterState } from '@/types/assets'

// 深度比较两个对象是否相等
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  
  return true
}

// 获取可购买的土地列表
export function useLands(filters: Partial<FilterState> | null = {}) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<any>(null)
  
  // 使用 useRef 存储上一次的filters，进行深度比较
  const prevFiltersRef = useRef<Partial<FilterState> | null>()
  const requestIdRef = useRef(0)
  
  // 标准化filters，确保稳定性
  const normalizedFilters = useMemo(() => {
    if (filters === null) return null
    
    return {
      page: filters.page || 1,
      page_size: filters.page_size || 20,
      ordering: filters.ordering || '-created_at',
      land_type: filters.land_type || 'all',
      priceRange: {
        min: filters.priceRange?.min,
        max: filters.priceRange?.max,
      },
      search: filters.search || '',
      region_id: filters.region_id,
    }
  }, [
    filters?.page,
    filters?.page_size,
    filters?.ordering,
    filters?.land_type,
    filters?.priceRange?.min,
    filters?.priceRange?.max,
    filters?.search,
    filters?.region_id,
  ])
  
  const fetchLands = useCallback(async () => {
    // 如果 filters 为 null，说明不应该加载土地
    if (normalizedFilters === null) {
      setLands([])
      setLoading(false)
      return
    }
    
    // 深度比较filters是否真正变化
    if (deepEqual(prevFiltersRef.current, normalizedFilters)) {
      console.log('[useLands] Filters未变化，跳过请求')
      return
    }
    
    prevFiltersRef.current = normalizedFilters
    const currentRequestId = ++requestIdRef.current
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useLands] 发起请求，filters:', normalizedFilters)
      
      const params: any = {
        page: normalizedFilters.page,
        page_size: normalizedFilters.page_size,
        ordering: normalizedFilters.ordering,
      }
      
      if (normalizedFilters.land_type && normalizedFilters.land_type !== 'all') {
        params.blueprint__land_type = normalizedFilters.land_type
      }
      
      if (normalizedFilters.priceRange?.min !== undefined) {
        params.min_price = normalizedFilters.priceRange.min
      }
      
      if (normalizedFilters.priceRange?.max !== undefined) {
        params.max_price = normalizedFilters.priceRange.max
      }
      
      if (normalizedFilters.search) {
        params.search = normalizedFilters.search
      }
      
      if (normalizedFilters.region_id) {
        params.region_id = normalizedFilters.region_id
      }
      
      const response = await assetsApi.lands.available(params)
      
      // 只处理最新请求
      if (currentRequestId === requestIdRef.current) {
        setLands(response.results)
        setHasMore(!!response.next)
        setTotalCount(response.count)
        setStats(response.stats)
        console.log('[useLands] 获取成功，土地数量:', response.results.length)
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : '加载失败')
        console.error('[useLands] 请求失败:', err)
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [normalizedFilters])
  
  useEffect(() => {
    fetchLands()
  }, [fetchLands])
  
  return { lands, loading, error, hasMore, totalCount, stats, refetch: fetchLands }
}

// 获取土地详情
export function useLandDetail(id: number) {
  const [land, setLand] = useState<LandDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const lastIdRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    if (!id || isNaN(id)) {
      setError('无效的土地ID')
      setLoading(false)
      return
    }
    
    // 如果ID未变化且已有数据，跳过请求
    if (id === lastIdRef.current && land !== null) {
      return
    }
    
    lastIdRef.current = id
    const currentRequestId = ++requestIdRef.current
    
    const fetchLand = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useLandDetail] 获取土地详情，ID:', id)
        
        const data = await assetsApi.lands.get(id)
        
        if (currentRequestId === requestIdRef.current) {
          setLand(data)
          console.log('[useLandDetail] 获取成功:', data.land_id)
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }
    
    fetchLand()
    
    return () => {
      requestIdRef.current++
    }
  }, [id]) // 移除land依赖
  
  return { land, loading, error }
}

// 获取用户的所有土地
export function useMyLands() {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  
  const hasFetchedRef = useRef(false)
  const requestIdRef = useRef(0)
  
  const fetchMyLands = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useMyLands] 获取我的土地')
      
      const response = await assetsApi.lands.myLands({
        page_size: 100 // 获取更多数据
      })
      
      if (currentRequestId === requestIdRef.current) {
        setLands(response.results)
        setStats(response.stats)
        console.log('[useMyLands] 获取成功，土地数量:', response.results.length)
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : '加载失败')
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
        hasFetchedRef.current = true
      }
    }
  }, [])
  
  useEffect(() => {
    // 只在首次加载时获取数据
    if (!hasFetchedRef.current) {
      fetchMyLands()
    }
  }, []) // 移除fetchMyLands依赖，避免循环
  
  return { lands, loading, error, stats, refetch: fetchMyLands }
}

// 获取用户在特定区域的土地
export function useMyLandsInRegion(regionId: number | null, regionName?: string) {
  const [lands, setLands] = useState<Land[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const prevRegionIdRef = useRef<number | null>(undefined)
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    // 如果regionId未变化，跳过请求
    if (prevRegionIdRef.current === regionId && lands.length > 0) {
      return
    }
    
    prevRegionIdRef.current = regionId
    const currentRequestId = ++requestIdRef.current
    
    const fetchMyLandsInRegion = async () => {
      if (!regionId) {
        setLands([])
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useMyLandsInRegion] 获取区域土地，区域ID:', regionId, '区域名称:', regionName)
        
        // 获取用户所有土地
        const response = await assetsApi.lands.myLands({
          page_size: 100 // 确保获取所有土地
        })
        
        if (currentRequestId !== requestIdRef.current) return
        
        console.log('[useMyLandsInRegion] 总土地数:', response.results.length)
        
        // 过滤出在当前区域的土地
        const landsInRegion = response.results.filter(land => {
          // 方法1: 如果土地有 region_id 字段
          if ('region_id' in land && land.region_id === regionId) {
            return true
          }
          
          // 方法2: 通过区域名称匹配
          if (regionName && land.region_name === regionName) {
            return true
          }
          
          return false
        })
        
        console.log('[useMyLandsInRegion] 区域内土地数:', landsInRegion.length)
        
        // 如果没有找到该区域的土地，返回所有土地（临时解决方案）
        if (landsInRegion.length === 0 && response.results.length > 0) {
          console.log('[useMyLandsInRegion] 未找到区域土地，显示所有土地')
          setLands(response.results)
        } else {
          setLands(landsInRegion)
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          console.error('[useMyLandsInRegion] 错误:', err)
          // 如果是认证错误，不显示错误，只是返回空数组
          if (err instanceof Error && err.message.includes('401')) {
            setLands([])
          } else {
            setError(err instanceof Error ? err.message : '加载失败')
          }
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }
    
    fetchMyLandsInRegion()
    
    return () => {
      requestIdRef.current++
    }
  }, [regionId, regionName])
  
  const refetchMyLandsInRegion = useCallback(() => {
    prevRegionIdRef.current = undefined // 强制刷新
    const currentRequestId = ++requestIdRef.current
    
    if (!regionId) return
    
    const fetchMyLandsInRegion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await assetsApi.lands.myLands({
          page_size: 100
        })
        
        if (currentRequestId !== requestIdRef.current) return
        
        const landsInRegion = response.results.filter(land => {
          if ('region_id' in land && land.region_id === regionId) {
            return true
          }
          if (regionName && land.region_name === regionName) {
            return true
          }
          return false
        })
        
        if (landsInRegion.length === 0 && response.results.length > 0) {
          setLands(response.results)
        } else {
          setLands(landsInRegion)
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          if (err instanceof Error && err.message.includes('401')) {
            setLands([])
          } else {
            setError(err instanceof Error ? err.message : '加载失败')
          }
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }
    
    fetchMyLandsInRegion()
  }, [regionId, regionName])
  
  return { lands, loading, error, refetch: refetchMyLandsInRegion }
}
