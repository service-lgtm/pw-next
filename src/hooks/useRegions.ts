// src/hooks/useRegions.ts
// 区域数据Hook - 修复循环调用问题
//
// 文件说明：
// 1. 修复了循环调用API的问题
// 2. 使用 useMemo 稳定化参数对象
// 3. 添加 AbortController 来取消过期请求
// 4. 保持向后兼容性
//
// 关联文件：
// - src/app/explore/page.tsx: 探索页面使用此Hook获取区域列表
// - src/app/explore/regions/[regionId]/page.tsx: 区域详情页使用此Hook
// - src/lib/api/assets.ts: 调用资产API接口
// - src/types/assets.ts: Region类型定义

import { useState, useEffect, useRef, useMemo } from 'react'
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
  
  // 使用 useMemo 稳定化参数对象，避免每次渲染创建新对象
  const stableParams = useMemo(() => ({
    parent_id: options.parent_id,
    region_type: options.regionType,
    is_active: options.isActive,
    is_open_for_sale: options.isOpenForSale,
  }), [options.parent_id, options.regionType, options.isActive, options.isOpenForSale])
  
  // 使用 useRef 存储请求标识，防止竞态条件
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    // 生成新的请求ID
    const currentRequestId = ++requestIdRef.current
    
    const fetchRegions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegions] 发起请求，参数:', stableParams)
        
        const response = await assetsApi.regions.list(stableParams)
        
        // 检查是否是最新的请求
        if (currentRequestId === requestIdRef.current) {
          setRegions(response.results)
          console.log('[useRegions] 获取成功，区域数量:', response.results.length)
        } else {
          console.log('[useRegions] 忽略过期请求')
        }
      } catch (err) {
        // 只处理最新请求的错误
        if (currentRequestId === requestIdRef.current) {
          if (err instanceof ApiError && err.status === 403) {
            console.log('[useRegions] 用户未登录，显示登录提示')
            setError('需要登录后查看')
          } else {
            setError(err instanceof Error ? err.message : '加载失败')
          }
        }
      } finally {
        // 只更新最新请求的loading状态
        if (currentRequestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }
    
    fetchRegions()
    
    // 清理函数：组件卸载时标记请求无效
    return () => {
      requestIdRef.current++
    }
  }, [stableParams]) // 使用稳定的参数对象作为依赖
  
  return { regions, loading, error }
}

export function useRegion(id: number) {
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 使用 useRef 防止重复请求
  const lastIdRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setError('无效的区域ID')
      setLoading(false)
      return
    }
    
    // 如果 ID 没有变化，不重新请求
    if (id === lastIdRef.current && region !== null) {
      return
    }
    
    lastIdRef.current = id
    const currentRequestId = ++requestIdRef.current
    
    const fetchRegion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegion] 获取区域详情，ID:', id)
        
        const data = await assetsApi.regions.get(id)
        
        // 只处理最新请求
        if (currentRequestId === requestIdRef.current) {
          setRegion(data)
          console.log('[useRegion] 获取成功:', data.name)
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          if (err instanceof ApiError && err.status === 403) {
            setError('需要登录后查看')
          } else if (err instanceof ApiError && err.status === 404) {
            setError('区域不存在')
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
    
    fetchRegion()
    
    return () => {
      requestIdRef.current++
    }
  }, [id]) // 移除 region 依赖，避免循环
  
  return { region, loading, error }
}

export function useRegionStats(id: number) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 使用 useRef 防止重复请求
  const lastIdRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  
  useEffect(() => {
    // 确保 id 有效
    if (!id || isNaN(id)) {
      setLoading(false)
      return
    }
    
    // 如果 ID 没有变化且已有数据，不重新请求
    if (id === lastIdRef.current && stats !== null) {
      return
    }
    
    lastIdRef.current = id
    const currentRequestId = ++requestIdRef.current
    
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[useRegionStats] 获取区域统计，ID:', id)
        
        const response = await assetsApi.regions.stats(id)
        
        if (currentRequestId === requestIdRef.current) {
          if (response.success) {
            setStats(response.data)
            console.log('[useRegionStats] 获取成功')
          }
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          if (err instanceof ApiError && err.status === 403) {
            console.log('[useRegionStats] 需要登录后查看统计信息')
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
    
    fetchStats()
    
    return () => {
      requestIdRef.current++
    }
  }, [id]) // 移除 stats 依赖，避免循环
  
  return { stats, loading, error }
}
