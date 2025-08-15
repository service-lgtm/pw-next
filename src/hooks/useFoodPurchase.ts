// src/hooks/useFoodPurchase.ts
// 粮食购买 Hook - 使用 TDB 购买

import { useState, useEffect, useCallback } from 'react'
import { foodApi } from '@/lib/api/food'
import type { FoodPurchaseStatus } from '@/lib/api/food'
import toast from 'react-hot-toast'

// ==================== Hook 实现 ====================

export function useFoodPurchase() {
  const [status, setStatus] = useState<FoodPurchaseStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取购买状态
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await foodApi.getPurchaseStatus()
      
      if (response.success && response.data) {
        setStatus(response.data)
      }
    } catch (err) {
      console.error('[useFoodPurchase] Error fetching status:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 购买粮食（使用 TDB）
  const buyFood = useCallback(async (quantity: number): Promise<any> => {
    if (!status) {
      toast.error('请先等待状态加载')
      return false
    }

    if (quantity < 1 || quantity > 48) {
      toast.error('购买数量必须在1-48之间')
      return false
    }

    if (status.today_purchased + quantity > status.daily_limit) {
      toast.error(`超过每日限额，您今天还可以购买${status.today_remaining}个`)
      return false
    }

    const totalCost = quantity * status.unit_price
    if (status.tdb_balance < totalCost) {
      toast.error(`TDB余额不足，需要${totalCost.toFixed(2)} TDB`)
      return false
    }

    try {
      setBuying(true)
      setError(null)
      
      const response = await foodApi.buyFood(quantity)
      
      if (response.success && response.data) {
        // 更新本地状态
        setStatus(prev => prev ? {
          ...prev,
          current_food: response.data!.food_balance_after,
          tdb_balance: response.data!.tdb_balance_after,
          today_purchased: response.data!.today_purchased,
          today_remaining: response.data!.today_remaining,
          can_buy: response.data!.today_remaining > 0 && response.data!.tdb_balance_after >= prev.unit_price
        } : null)
        
        // 如果达到每日限额，提醒
        if (response.data.today_remaining === 0) {
          setTimeout(() => {
            toast('今日购买额度已用完，明天0点重置', { 
              icon: '⏰',
              duration: 5000 
            })
          }, 1000)
        }
        
        // 返回购买结果数据
        return response.data
      } else {
        toast.error(response.message || '购买失败')
        return false
      }
    } catch (err: any) {
      const message = err?.message || '购买失败'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setBuying(false)
    }
  }, [status])

  // 初始化加载
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    buying,
    error,
    buyFood,
    refreshStatus: fetchStatus
  }
}
