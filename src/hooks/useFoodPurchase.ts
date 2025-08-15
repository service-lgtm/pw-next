// src/hooks/useFoodPurchase.ts
// 粮食购买 Hook - 使用 TDB 购买

import { useState, useEffect, useCallback } from 'react'
import { request } from '@/lib/api'
import toast from 'react-hot-toast'

// ==================== 类型定义 ====================

export interface FoodPurchaseStatus {
  current_food: number      // 当前粮食数量
  tdb_balance: number       // TDB余额（用于购买）
  today_purchased: number   // 今日已购买
  today_remaining: number   // 今日剩余额度
  daily_limit: number       // 每日限额（48个）
  unit_price: number        // 单价（0.01 TDB）
  can_buy: boolean         // 是否可以购买
  next_reset_time: string  // 下次重置时间
}

export interface BuyFoodResponse {
  success: boolean
  message: string
  data?: {
    transaction_id: string
    quantity: number
    unit_price: number
    total_cost: number
    tdb_balance_before: number
    tdb_balance_after: number
    food_balance_before: number
    food_balance_after: number
    today_purchased: number
    today_remaining: number
    daily_limit: number
  }
}

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
      
      const response = await request<{
        success: boolean
        data: FoodPurchaseStatus
      }>('/production/food/purchase-status/')
      
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
  const buyFood = useCallback(async (quantity: number): Promise<boolean> => {
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
      
      const response = await request<BuyFoodResponse>('/production/food/buy/', {
        method: 'POST',
        body: { quantity }
      })
      
      if (response.success && response.data) {
        toast.success(response.message || `成功购买${quantity}个粮食`)
        
        // 更新本地状态
        setStatus(prev => prev ? {
          ...prev,
          current_food: response.data!.food_balance_after,
          tdb_balance: response.data!.tdb_balance_after,
          today_purchased: response.data!.today_purchased,
          today_remaining: response.data!.today_remaining,
          can_buy: response.data!.today_remaining > 0 && response.data!.tdb_balance_after >= prev.unit_price
        } : null)
        
        // 显示详细信息
        toast.success(
          `花费 ${response.data.total_cost.toFixed(2)} TDB，当前粮食：${response.data.food_balance_after}个`,
          { duration: 4000 }
        )
        
        // 如果达到每日限额，提醒
        if (response.data.today_remaining === 0) {
          toast('今日购买额度已用完，明天0点重置', { 
            icon: '⏰',
            duration: 5000 
          })
        }
        
        return true
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
