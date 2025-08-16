// src/hooks/useMiningLands.ts
// 挖矿土地适配器 - 连接现有的土地系统和挖矿系统
// 
// 功能说明：
// 1. 适配现有的 useLands.ts 到挖矿系统
// 2. 提供统一的土地数据接口
// 3. 处理土地数据格式转换
// 4. 兼容挖矿系统的需求
// 
// 关联文件：
// - 被 @/app/mining/page.tsx 使用
// - 被 @/app/mining/MiningSessions.tsx 间接使用
// - 使用 @/hooks/useLands 中的 useMyLands
// - 使用 @/types/assets 中的 Land 类型
// 
// 创建时间：2024-12
// 更新历史：
// - 2024-12: 创建此文件解决土地数据兼容性问题

'use client'

import { useMyLands } from '@/hooks/useLands'
import { useMemo, useCallback, useState, useEffect } from 'react'
import type { Land } from '@/types/assets'
import { productionApi } from '@/lib/api/production'

/**
 * 获取用户土地列表（挖矿系统专用）
 * 优先使用生产系统API，失败时降级到资产系统
 */
export function useUserLands(options?: { 
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}) {
  const { enabled = true, autoRefresh = false, refreshInterval = 60000 } = options || {}
  
  // 使用现有的 useMyLands Hook 作为备用
  const { 
    lands: myLands, 
    loading: myLandsLoading, 
    error: myLandsError, 
    refetch: refetchMyLands 
  } = useMyLands()
  
  // 生产系统土地状态
  const [productionLands, setProductionLands] = useState<Land[] | null>(null)
  const [productionLoading, setProductionLoading] = useState(false)
  const [productionError, setProductionError] = useState<string | null>(null)
  
  // 获取生产系统土地
  const fetchProductionLands = useCallback(async () => {
    if (!enabled) return
    
    setProductionLoading(true)
    setProductionError(null)
    
    try {
      // 尝试多个可能的API路径
      let response = null
      
      // 路径1: /production/lands/mine/
      try {
        response = await productionApi.lands.getUserLands()
        console.log('[useUserLands] Got lands from production API')
      } catch (err) {
        console.warn('[useUserLands] Production API failed, trying alternatives')
      }
      
      // 路径2: 使用资产系统的土地
      if (!response && myLands) {
        console.log('[useUserLands] Using lands from assets system')
        setProductionLands(myLands)
        setProductionLoading(false)
        return
      }
      
      if (response?.data?.results) {
        setProductionLands(response.data.results)
      } else if (response?.results) {
        setProductionLands(response.results as any)
      } else if (Array.isArray(response)) {
        setProductionLands(response as any)
      }
    } catch (err: any) {
      console.error('[useUserLands] Error:', err)
      setProductionError(err?.message || '获取土地失败')
      
      // 降级到资产系统
      if (myLands) {
        console.log('[useUserLands] Falling back to assets system')
        setProductionLands(myLands)
      }
    } finally {
      setProductionLoading(false)
    }
  }, [enabled, myLands])
  
  // 初始加载
  useEffect(() => {
    if (enabled) {
      fetchProductionLands()
    }
  }, [enabled, fetchProductionLands])
  
  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !enabled) return
    
    const interval = setInterval(fetchProductionLands, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, enabled, refreshInterval, fetchProductionLands])
  
  // 转换土地格式以适配挖矿系统
  const lands = useMemo(() => {
    const sourceLands = productionLands || myLands
    if (!sourceLands) return null
    
    return sourceLands.map(land => ({
      ...land,
      // 确保必要字段存在
      id: land.id,
      land_id: land.land_id || `LAND-${land.id}`,
      land_type_display: land.land_type_display || 
                        land.blueprint?.land_type_display || 
                        land.land_type || 
                        '未知类型',
      region_name: land.region_name || 
                  land.region_info?.name || 
                  land.region || 
                  '未知区域',
      can_mine: land.can_mine !== false, // 默认为true
      is_mining: land.is_mining || false,
      has_session: land.has_session || false,
      // 添加blueprint字段（如果缺失）
      blueprint: land.blueprint || {
        land_type_display: land.land_type_display || land.land_type || '未知类型'
      }
    }))
  }, [productionLands, myLands])
  
  // 合并加载状态
  const loading = productionLoading || (myLandsLoading && !productionLands)
  const error = productionError || (!productionLands && myLandsError)
  
  // 刷新函数
  const refetch = useCallback(async () => {
    await fetchProductionLands()
    if (!productionLands) {
      await refetchMyLands()
    }
  }, [fetchProductionLands, refetchMyLands, productionLands])
  
  return {
    lands,
    loading,
    error,
    refetch
  }
}

/**
 * 获取可用土地列表（招募挖矿）
 */
export function useAvailableLands(options?: {
  ownership?: 'mine' | 'others' | 'all'
  land_type?: string
  has_tools?: boolean
  enabled?: boolean
}) {
  const {
    ownership = 'all',
    land_type,
    has_tools,
    enabled = true
  } = options || {}
  
  const [lands, setLands] = useState<Land[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchLands = useCallback(async () => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.lands.getAvailableLands({
        ownership,
        land_type,
        has_tools,
        page_size: 100
      })
      
      if (response?.data?.results) {
        setLands(response.data.results)
      } else {
        setLands([])
      }
    } catch (err: any) {
      console.error('[useAvailableLands] Error:', err)
      setError(err?.message || '获取可用土地失败')
      setLands([])
    } finally {
      setLoading(false)
    }
  }, [enabled, ownership, land_type, has_tools])
  
  useEffect(() => {
    if (enabled) {
      fetchLands()
    }
  }, [enabled, fetchLands])
  
  return {
    lands,
    loading,
    error,
    refetch: fetchLands
  }
}

/**
 * 获取土地挖矿信息
 */
export function useLandMiningInfo(landId: number | null) {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchInfo = useCallback(async () => {
    if (!landId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await productionApi.lands.getLandMiningInfo(landId)
      
      if (response?.data) {
        setInfo(response.data)
      }
    } catch (err: any) {
      console.error('[useLandMiningInfo] Error:', err)
      setError(err?.message || '获取土地挖矿信息失败')
    } finally {
      setLoading(false)
    }
  }, [landId])
  
  useEffect(() => {
    if (landId) {
      fetchInfo()
    }
  }, [landId, fetchInfo])
  
  return {
    info,
    loading,
    error,
    refetch: fetchInfo
  }
}

// 导出默认的 useUserLands
export default useUserLands
