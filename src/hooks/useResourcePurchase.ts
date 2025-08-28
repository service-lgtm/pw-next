// src/hooks/useResourcePurchase.ts
// 资源购买 Hook - 支持多种资源类型的购买
//
// 文件说明：
// 1. 本文件提供通用的资源购买Hook
// 2. 支持所有5种资源类型的购买和状态管理
// 3. 提供缓存、错误处理、自动刷新等功能
// 4. 兼容旧版useFoodPurchase Hook
//
// 版本历史：
// - 2025-01-28: 初始版本
//   - 支持多资源类型购买
//   - 提供统一的状态管理
//   - 优化错误处理和用户反馈
//
// 关联文件：
// - src/lib/api/resources.ts: 资源购买API
// - src/hooks/useFoodPurchase.ts: 旧版粮食购买Hook（保留兼容）
// - src/app/market/page.tsx: 交易市场页面

import { useState, useEffect, useCallback, useRef } from 'react'
import { resourceApi, ResourceType, ResourceStatus, RESOURCE_INFO } from '@/lib/api/resources'
import type { ResourcePurchaseStatusResponse } from '@/lib/api/resources'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'

// ==================== Hook 接口定义 ====================

export interface UseResourcePurchaseOptions {
  resourceType?: ResourceType  // 指定资源类型，不传则获取所有
  autoRefresh?: boolean        // 是否自动刷新状态
  refreshInterval?: number     // 刷新间隔（毫秒）
  onSuccess?: (data: any) => void  // 购买成功回调
  onError?: (error: any) => void   // 购买失败回调
}

export interface UseResourcePurchaseReturn {
  // 状态数据
  status: ResourcePurchaseStatusResponse['data'] | null
  resourceStatus: Record<ResourceType, ResourceStatus> | null
  wallet: { tdb_balance: number; yld_balance: number } | null
  
  // 加载状态
  loading: boolean
  buying: boolean
  error: string | null
  
  // 操作方法
  buyResource: (resourceType: ResourceType, quantity: number) => Promise<any>
  refreshStatus: () => Promise<void>
  clearError: () => void
  
  // 辅助方法
  canBuy: (resourceType: ResourceType) => boolean
  getMaxCanBuy: (resourceType: ResourceType) => number
  getTotalCost: (resourceType: ResourceType, quantity: number) => number
}

// ==================== Hook 实现 ====================

export function useResourcePurchase(
  options: UseResourcePurchaseOptions = {}
): UseResourcePurchaseReturn {
  const {
    resourceType,
    autoRefresh = false,
    refreshInterval = 60000, // 默认60秒
    onSuccess,
    onError
  } = options

  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState<ResourcePurchaseStatusResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 使用ref避免重复请求
  const fetchingRef = useRef(false)
  const refreshTimerRef = useRef<NodeJS.Timeout>()

  // 获取购买状态
  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated || fetchingRef.current) return
    
    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)
      
      const response = await resourceApi.getPurchaseStatus(resourceType)
      
      if (response.success && response.data) {
        setStatus(response.data)
      } else {
        setError(response.message || '加载失败')
      }
    } catch (err: any) {
      console.error('[useResourcePurchase] Error fetching status:', err)
      const message = err?.message || '加载失败'
      setError(message)
      
      // 静默处理401错误（未登录）
      if (err?.status !== 401) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [isAuthenticated, resourceType])

  // 购买资源
  const buyResource = useCallback(async (
    type: ResourceType, 
    quantity: number
  ): Promise<any> => {
    if (!status) {
      toast.error('请先等待状态加载')
      return null
    }

    const resourceInfo = RESOURCE_INFO[type]
    const resourceStatus = status.resources[type]

    // 验证购买条件
    if (!resourceStatus.can_buy) {
      toast.error(`当前无法购买${resourceInfo.name}`)
      return null
    }

    if (quantity < 1 || quantity > resourceStatus.single_limit) {
      toast.error(`购买数量必须在1-${resourceStatus.single_limit}之间`)
      return null
    }

    if (resourceStatus.today_purchased + quantity > resourceStatus.daily_limit) {
      toast.error(`超过每日限额，您今天还可以购买${resourceStatus.today_remaining}个`)
      return null
    }

    const totalCost = quantity * resourceStatus.unit_price
    if (status.wallet.tdb_balance < totalCost) {
      toast.error(`TDB余额不足，需要${totalCost.toFixed(2)} TDB`)
      return null
    }

    try {
      setBuying(true)
      setError(null)
      
      const response = await resourceApi.buyResource(type, quantity)
      console.log('[useResourcePurchase] buyResource response:', response)
      
      if (response.success && response.data) {
        // 更新本地状态
        setStatus(prev => {
          if (!prev) return null
          
          return {
            ...prev,
            resources: {
              ...prev.resources,
              [type]: {
                ...prev.resources[type],
                current_amount: response.data!.resource_after,
                today_purchased: response.data!.today_purchased,
                today_remaining: response.data!.today_remaining,
                can_buy: response.data!.today_remaining > 0 && 
                         response.data!.balance_after >= prev.resources[type].unit_price,
                max_can_buy: Math.min(
                  Math.floor(response.data!.balance_after / prev.resources[type].unit_price),
                  response.data!.today_remaining,
                  prev.resources[type].single_limit
                )
              }
            },
            wallet: {
              ...prev.wallet,
              tdb_balance: response.data!.balance_after
            }
          }
        })
        
        // 成功提示
        toast.success(`成功购买${quantity}个${resourceInfo.name}`)
        
        // 如果达到每日限额，延迟提醒
        if (response.data.today_remaining === 0) {
          setTimeout(() => {
            toast(`${resourceInfo.name}今日购买额度已用完，明天0点重置`, { 
              icon: '⏰',
              duration: 5000 
            })
          }, 2000)
        }
        
        // 触发成功回调
        onSuccess?.(response.data)
        
        // 返回完整的购买结果
        return response.data
      } else {
        const message = response.message || '购买失败'
        toast.error(message)
        onError?.(response)
        return null
      }
    } catch (err: any) {
      const message = err?.message || '购买失败'
      setError(message)
      toast.error(message)
      onError?.(err)
      return null
    } finally {
      setBuying(false)
    }
  }, [status, onSuccess, onError])

  // 辅助方法：检查是否可以购买
  const canBuy = useCallback((type: ResourceType): boolean => {
    if (!status) return false
    return status.resources[type]?.can_buy || false
  }, [status])

  // 辅助方法：获取最大可购买数量
  const getMaxCanBuy = useCallback((type: ResourceType): number => {
    if (!status) return 0
    return status.resources[type]?.max_can_buy || 0
  }, [status])

  // 辅助方法：计算总费用
  const getTotalCost = useCallback((type: ResourceType, quantity: number): number => {
    if (!status) return 0
    const unitPrice = status.resources[type]?.unit_price || 0
    return unitPrice * quantity
  }, [status])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 初始化加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus()
    }
  }, [isAuthenticated, fetchStatus])

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      refreshTimerRef.current = setInterval(() => {
        fetchStatus()
      }, refreshInterval)

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, isAuthenticated, fetchStatus])

  return {
    status,
    resourceStatus: status?.resources || null,
    wallet: status?.wallet || null,
    loading,
    buying,
    error,
    buyResource,
    refreshStatus: fetchStatus,
    clearError,
    canBuy,
    getMaxCanBuy,
    getTotalCost
  }
}

// ==================== 向后兼容：粮食专用Hook ====================

export function useFoodPurchaseCompat() {
  const result = useResourcePurchase({ resourceType: 'food' })
  
  // 转换为旧版格式
  const foodStatus = result.status ? {
    current_food: result.status.resources.food.current_amount,
    tdb_balance: result.status.wallet.tdb_balance,
    yld_balance: result.status.wallet.yld_balance,
    today_purchased: result.status.resources.food.today_purchased,
    today_remaining: result.status.resources.food.today_remaining,
    daily_limit: result.status.resources.food.daily_limit,
    unit_price: result.status.resources.food.unit_price,
    currency: 'TDB',
    can_buy: result.status.resources.food.can_buy,
    next_reset_time: result.status.next_reset_time
  } : null
  
  const buyFood = async (quantity: number) => {
    return result.buyResource('food', quantity)
  }
  
  return {
    status: foodStatus,
    loading: result.loading,
    buying: result.buying,
    error: result.error,
    buyFood,
    refreshStatus: result.refreshStatus
  }
}

// ==================== 导出 ====================

export default useResourcePurchase
