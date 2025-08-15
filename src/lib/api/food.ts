// src/lib/api/food.ts
// 粮食购买 API 接口 - 使用 TDB 支付

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
    currency: string  // 'TDB' (改为TDB)
    tdb_balance_before: number  // TDB余额（之前）
    tdb_balance_after: number   // TDB余额（之后）
    food_balance_before: number
    food_balance_after: number
    today_purchased: number
    today_remaining: number
    daily_limit: number
  }
}

export interface FoodPurchaseStatus {
  current_food: number      // 当前粮食数量
  tdb_balance: number       // TDB余额（用于购买）
  yld_balance: number       // YLD余额（仅供参考）
  today_purchased: number   // 今日已购买
  today_remaining: number   // 今日剩余额度
  daily_limit: number       // 每日限额（48个）
  unit_price: number        // 单价（0.01 TDB）
  currency: string          // 'TDB'
  can_buy: boolean         // 是否可以购买
  next_reset_time: string  // 下次重置时间
}

// ==================== API 接口 ====================

export const foodApi = {
  /**
   * 购买粮食（使用 TDB）
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
