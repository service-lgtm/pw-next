// src/hooks/useFoodPurchase.ts
// 粮食购买 Hook - 使用 YLD 购买

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

  // 购买粮食（使用 YLD）
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
    if (status.yld_balance < totalCost) {
      toast.error(`YLD余额不足，需要${totalCost.toFixed(2)} YLD`)
      return false
    }

    try {
      setBuying(true)
      setError(null)
      
      const response = await foodApi.buyFood(quantity)
      
      if (response.success && response.data) {
        toast.success(response.message || `成功购买${quantity}个粮食`)
        
        // 更新本地状态
        setStatus(prev => prev ? {
          ...prev,
          current_food: response.data!.food_balance_after,
          yld_balance: response.data!.yld_balance_after,
          today_purchased: response.data!.today_purchased,
          today_remaining: response.data!.today_remaining,
          can_buy: response.data!.today_remaining > 0 && response.data!.yld_balance_after >= prev.unit_price
        } : null)
        
        // 显示详细信息
        toast.success(
          `花费 ${response.data.total_cost.toFixed(2)} YLD，当前粮食：${response.data.food_balance_after}个`,
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
