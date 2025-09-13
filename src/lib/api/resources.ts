// src/lib/api/resources.ts
// 资源购买系统 API 接口 - 支持多种资源类型购买
//
// 文件说明：
// 1. 本文件包含资源购买系统的所有 API 接口
// 2. 支持5种资源类型：铁矿、石材、木材、YLD陨石、粮食
// 3. 提供统一的购买接口和状态查询
// 4. 向后兼容旧版粮食购买API
//
// 版本历史：
// - 2025-01-28: 初始版本，支持新的统一资源购买API
//   - 添加统一购买接口 /api/production/resources/buy/
//   - 添加状态查询接口 /api/production/resources/purchase-status/
//   - 添加价格列表接口 /api/production/resources/prices/
//
// 关联文件：
// - src/lib/api/food.ts: 旧版粮食购买API（保留兼容性）
// - src/hooks/useResourcePurchase.ts: 资源购买Hook
// - src/app/market/page.tsx: 交易市场页面
// - API文档：资源购买系统 API 接入文档 v3.0.0

import { RESOURCE_NAMES, RESOURCE_TYPES } from '@/utils/resourceTool'
import { request } from '../api'

// ==================== 类型定义 ====================

// 资源类型枚举
export type ResourceType = 'iron' | 'stone' | 'wood' | 'yld' | 'food'

// 资源信息映射
export const RESOURCE_INFO: Record<ResourceType, {
  name: string
  icon: RESOURCE_TYPES
  unitPrice: number
  dailyLimit: number
  singleLimit: number
  description: string
}> = {
  iron: {
    // 铁矿
    name: RESOURCE_NAMES[RESOURCE_TYPES.IRON_ORE],
    icon: RESOURCE_TYPES.IRON_ORE,
    unitPrice: 1.85,
    dailyLimit: 100,
    singleLimit: 20,
    description: '用于合成工具和建造的基础材料'
  },
  stone: {
    // 石头
    name: RESOURCE_NAMES[RESOURCE_TYPES.STONE],
    icon: RESOURCE_TYPES.STONE,
    unitPrice: 0.18,
    dailyLimit: 500,
    singleLimit: 100,
    description: '建造和合成砖块的必需材料'
  },
  wood: {
    // 木材
    name: RESOURCE_NAMES[RESOURCE_TYPES.WOOD],
    icon: RESOURCE_TYPES.WOOD,
    unitPrice: 0.04,
    dailyLimit: 1000,
    singleLimit: 200,
    description: '用于合成工具和建造的基础材料'
  },
  yld: {
    name: 'YLD陨石',
    icon: RESOURCE_TYPES.METEORITE,
    unitPrice: 2.84,
    dailyLimit: 50,
    singleLimit: 10,
    description: '稀有资源，用于高级合成和交易'
  },
  food: {
    // 粮食
    name: RESOURCE_NAMES[RESOURCE_TYPES.GRAIN],
    icon: RESOURCE_TYPES.GRAIN,
    unitPrice: 0.01,
    dailyLimit: 48,
    singleLimit: 48,
    description: '挖矿生产必需品，每小时消耗2个/工具'
  }
}

// 购买请求
export interface BuyResourceRequest {
  resource_type: ResourceType
  quantity: number
}

// 购买响应
export interface BuyResourceResponse {
  success: boolean
  message: string
  data?: {
    transaction_id: string
    resource_type: string
    resource_name: string
    quantity: number
    unit_price: number
    total_cost: number
    currency: string  // 'TDB'
    balance_before: number  // TDB余额（之前）
    balance_after: number   // TDB余额（之后）
    resource_before: number // 资源数量（之前）
    resource_after: number  // 资源数量（之后）
    today_purchased: number
    today_remaining: number
    daily_limit: number
  }
}

// 单个资源状态
export interface ResourceStatus {
  name: string
  current_amount: number
  unit_price: number
  today_purchased: number
  today_remaining: number
  daily_limit: number
  single_limit: number
  can_buy: boolean
  max_can_buy: number  // 当前最多可购买数量（考虑余额和限额）
}

// 购买状态响应
export interface ResourcePurchaseStatusResponse {
  success: boolean
  data?: {
    resources: Record<ResourceType, ResourceStatus>
    wallet: {
      tdb_balance: number
      yld_balance: number
    }
    next_reset_time: string
  }
}

// 价格列表响应
export interface ResourcePricesResponse {
  success: boolean
  data?: {
    prices: Record<ResourceType, {
      name: string
      price: number
      currency: string
      daily_limit: number
      single_limit: number
    }>
    last_updated: string
  }
}

// ==================== API 错误类型 ====================

export interface ResourceApiError {
  success: false
  message: string
  data?: {
    required?: number
    current_balance?: number
    shortage?: number
    today_purchased?: number
    daily_limit?: number
    next_reset_time?: string
  }
}

// ==================== API 接口 ====================

export const resourceApi = {
  /**
   * 统一资源购买接口
   * @param resource_type 资源类型
   * @param quantity 购买数量
   */
  buyResource: async (
    resource_type: ResourceType,
    quantity: number
  ): Promise<BuyResourceResponse> => {
    try {
      return await request<BuyResourceResponse>('/production/resources/buy/', {
        method: 'POST',
        body: { resource_type, quantity }
      })
    } catch (error: any) {
      // 处理特定错误
      if (error?.status === 400) {
        const errorData = error?.details || error?.data || {}

        // 构造统一的错误响应
        return {
          success: false,
          message: error?.message || '购买失败',
          data: errorData
        } as any
      }
      throw error
    }
  },

  /**
   * 获取资源购买状态
   * @param resource_type 可选，指定资源类型
   */
  getPurchaseStatus: async (
    resource_type?: ResourceType
  ): Promise<ResourcePurchaseStatusResponse> => {
    const params = resource_type ? { resource_type } : undefined
    return request<ResourcePurchaseStatusResponse>(
      '/production/resources/purchase-status/',
      { params }
    )
  },

  /**
   * 获取资源价格列表
   */
  getPrices: async (): Promise<ResourcePricesResponse> => {
    return request<ResourcePricesResponse>('/production/resources/prices/')
  },

  // ==================== 兼容旧版粮食API ====================

  /**
   * 购买粮食（兼容旧版API）
   * @deprecated 使用 buyResource('food', quantity) 代替
   */
  buyFood: async (quantity: number): Promise<BuyResourceResponse> => {
    // 使用新的统一接口，但保持兼容旧的调用方式
    const response = await resourceApi.buyResource('food', quantity)

    // 如果响应成功，转换字段名以兼容旧版
    if (response.success && response.data) {
      const data = response.data
      return {
        ...response,
        data: {
          ...data,
          // 添加兼容字段
          food_balance_before: data.resource_before,
          food_balance_after: data.resource_after,
          tdb_balance_before: data.balance_before,
          tdb_balance_after: data.balance_after,
        } as any
      }
    }

    return response
  },

  /**
   * 获取粮食购买状态（兼容旧版API）
   * @deprecated 使用 getPurchaseStatus('food') 代替
   */
  getFoodPurchaseStatus: async () => {
    const response = await resourceApi.getPurchaseStatus('food')

    if (response.success && response.data) {
      const foodStatus = response.data.resources.food

      // 转换为旧版格式
      return {
        success: true,
        data: {
          current_food: foodStatus.current_amount,
          tdb_balance: response.data.wallet.tdb_balance,
          yld_balance: response.data.wallet.yld_balance,
          today_purchased: foodStatus.today_purchased,
          today_remaining: foodStatus.today_remaining,
          daily_limit: foodStatus.daily_limit,
          unit_price: foodStatus.unit_price,
          currency: 'TDB',
          can_buy: foodStatus.can_buy,
          next_reset_time: response.data.next_reset_time
        }
      }
    }

    return response
  }
}

// ==================== 辅助函数 ====================

/**
 * 计算最大可购买数量
 * @param balance TDB余额
 * @param unitPrice 单价
 * @param todayRemaining 今日剩余额度
 * @param singleLimit 单次限购
 */
export function calculateMaxPurchase(
  balance: number,
  unitPrice: number,
  todayRemaining: number,
  singleLimit: number
): number {
  const maxByBalance = Math.floor(balance / unitPrice)
  const maxByDailyLimit = todayRemaining
  const maxBySingleLimit = singleLimit

  return Math.min(maxByBalance, maxByDailyLimit, maxBySingleLimit)
}

/**
 * 格式化重置时间
 * @param resetTime ISO时间字符串
 */
export function formatResetTime(resetTime: string): string {
  const date = new Date(resetTime)
  const now = new Date()

  // 如果是今天，只显示时间
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  // 如果是明天
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `明天 ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  // 其他情况显示完整日期
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取购买状态文字
 * @param status 资源状态
 */
export function getPurchaseStatusText(status: ResourceStatus): string {
  if (!status.can_buy) {
    if (status.today_remaining === 0) {
      return '今日额度已用完'
    }
    return '暂时无法购买'
  }

  if (status.max_can_buy === 0) {
    return 'TDB余额不足'
  }

  return `可购买 ${status.max_can_buy} 个`
}

// 导出类型
export type { ResourceType as ResourceTypeEnum }
