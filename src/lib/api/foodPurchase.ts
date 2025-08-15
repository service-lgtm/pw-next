// src/lib/api/foodPurchase.ts
// 粮食购买API接口

import { request } from '../api'

// ==================== 类型定义 ====================

export interface BuyFoodRequest {
  quantity: number  // 购买数量，1-48
}

export interface BuyFoodResponse {
  success: boolean
  message: string
  data: {
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

export interface FoodPurchaseStatus {
  current_food: number
  tdb_balance: number
  today_purchased: number
  today_remaining: number
  daily_limit: number
  unit_price: number
  can_buy: boolean
  next_reset_time: string
}

// ==================== API 接口 ====================

export const foodPurchaseApi = {
  /**
   * 购买粮食
   * @param quantity 购买数量（1-48）
   */
  buyFood: async (quantity: number): Promise<BuyFoodResponse> => {
    return request<BuyFoodResponse>('/production/food/buy/', {
      method: 'POST',
      body: { quantity }
    })
  },

  /**
   * 获取购买状态
   */
  getPurchaseStatus: async (): Promise<{
    success: boolean
    data: FoodPurchaseStatus
  }> => {
    return request('/production/food/purchase-status/')
  }
}

// ==================== React Hook ====================

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

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
      
      const response = await foodPurchaseApi.getPurchaseStatus()
      
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

  // 购买粮食
  const buyFood = useCallback(async (quantity: number) => {
    if (!status) {
      toast.error('请先等待状态加载')
      return
    }

    if (quantity < 1 || quantity > 48) {
      toast.error('购买数量必须在1-48之间')
      return
    }

    if (status.today_purchased + quantity > status.daily_limit) {
      toast.error(`超过每日限额，您今天还可以购买${status.today_remaining}个`)
      return
    }

    const totalCost = quantity * status.unit_price
    if (status.tdb_balance < totalCost) {
      toast.error(`TDB余额不足，需要${totalCost.toFixed(2)} TDB`)
      return
    }

    try {
      setBuying(true)
      setError(null)
      
      const response = await foodPurchaseApi.buyFood(quantity)
      
      if (response.success) {
        toast.success(response.message || `成功购买${quantity}个粮食`)
        
        // 更新本地状态
        setStatus(prev => prev ? {
          ...prev,
          current_food: response.data.food_balance_after,
          tdb_balance: response.data.tdb_balance_after,
          today_purchased: response.data.today_purchased,
          today_remaining: response.data.today_remaining,
          can_buy: response.data.today_remaining > 0 && response.data.tdb_balance_after >= prev.unit_price
        } : null)
        
        return response.data
      } else {
        toast.error(response.message || '购买失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '购买失败'
      toast.error(message)
      setError(message)
      throw err
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
