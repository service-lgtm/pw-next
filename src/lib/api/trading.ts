// src/lib/api/trading.ts
// 交易市场 API 接口封装
// 版本：1.2.0 - 新增用户统计和增强订单查询接口

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：接入新的用户统计API和增强版订单查询接口
 * 主要修改：
 * 1. 新增 getUserStats 接口 - 获取用户交易统计
 * 2. 增强 getMyOrders 接口 - 支持时间筛选和排序
 * 3. 移除导出订单相关代码
 * 
 * 新增API端点：
 * - /production/trading/user-stats/ - 用户交易统计（带趋势）
 * - /production/trading/my-orders/ - 增强版订单查询
 * 
 * 依赖关系：
 * - /lib/api/index.ts - 基础请求函数
 * - /types/trading.ts - 交易相关类型定义
 * 
 * ⚠️ 重要说明：
 * - 所有请求需要 JWT 认证
 * - 价格限制在 API 层验证
 * - 错误处理遵循统一格式
 * ============================================
 */

import { request } from './index'
import type {
  MarketItem,
  SellOrder,
  BuyOrder,
  Transaction,
  PriceGuide,
  MarketStats,
  CreateSellOrderRequest,
  CreateBuyOrderRequest,
  TradingResponse,
  PaginatedResponse
} from '@/types/trading'

// ==================== 市场浏览 API ====================

export const tradingApi = {
  /**
   * 获取市场商品列表
   */
  market: {
    // 获取在售商品
    getItems: (params?: {
      type?: 'material' | 'tool'
      category?: string
      page?: number
      page_size?: number
      sort?: string
    }) => request<{
      success: boolean
      message: string
      data: {
        items: MarketItem[]
        pagination: {
          current_page: number
          total_pages: number
          total_items: number
          page_size: number
        }
      }
    }>('/production/trading/market/items/', {
      params
    }),
    
    // 获取市场统计
    getStats: () => request<{
      success: boolean
      data: MarketStats
    }>('/production/trading/market/stats/'),
    
    // 获取市场汇总数据（新接口）
    getMarketSummary: () => request<{
      success: boolean
      data: {
        summary_24h: {
          trade_volume: number
          trade_count: number
          avg_trade: number
        }
        active_market: {
          total_orders: number
          total_items: number
          total_value: number
          by_type: Array<{
            item_type: string
            item_name: string
            order_count: number
            total_quantity: number
            total_value: number
          }>
        }
        hot_items: Array<{
          rank: number
          item_type: string
          item_name: string
          trade_count: number
          trade_volume: number
          trade_quantity: number
        }>
        recent_trades: Array<{
          transaction_id: string
          item_type: string
          item_name: string
          quantity: number
          unit_price: number
          total_amount: number
          buyer: string
          seller: string
          time_ago: string
          created_at: string
        }>
        price_changes: Array<{
          item_type: string
          item_name: string
          current_price: number
          yesterday_price: number
          change_rate: number
          trend: 'up' | 'down' | 'flat'
        }>
        updated_at: string
      }
    }>('/production/trading/market-summary/'),
  },
  
  // ==================== 出售功能 API ====================
  
  sell: {
    // 查看可出售资源
    getSellableResources: () => request<{
      success: boolean
      data: {
        materials: Record<string, {
          name: string
          available: number
          frozen: number
          total: number
        }>
        tools: Record<string, {
          name: string
          available: number
          conditions: string
        }>
        price_guidance: Record<string, PriceGuide>
      }
    }>('/production/trading/sellable/'),
    
    // 创建出售订单（预览）
    createOrder: (data: CreateSellOrderRequest) => request<TradingResponse<SellOrder>>('/production/trading/orders/sell/', {
      method: 'POST',
      body: data
    }),
    
    // 确认出售订单
    confirmOrder: (orderId: number) => request<TradingResponse<{
      order_id: number
      expire_at: string
    }>>(`/production/trading/orders/${orderId}/confirm-sell/`, {
      method: 'POST'
    }),
    
    // 下架订单
    cancelOrder: (orderId: number) => request<TradingResponse<{
      returned_quantity: number
    }>>(`/production/trading/orders/${orderId}/cancel/`, {
      method: 'POST'
    })
  },
  
  // ==================== 购买功能 API ====================
  
  buy: {
    // 创建购买订单（预览）
    createOrder: (data: CreateBuyOrderRequest) => request<TradingResponse<BuyOrder>>('/production/trading/orders/buy/', {
      method: 'POST',
      body: data
    }),
    
    // 确认购买
    confirmOrder: (transactionId: string) => request<TradingResponse<{
      transaction_id: string
      item_acquired: number
      total_paid: number
      new_balance: number
    }>>(`/production/trading/orders/${transactionId}/confirm-buy/`, {
      method: 'POST'
    })
  },
  
  // ==================== 订单管理 API ====================
  
  orders: {
    // 获取我的订单（增强版）
    getMyOrders: (params?: {
      type?: 'sell' | 'buy'
      status?: string
      period?: 'today' | 'week' | 'month'
      start_date?: string
      end_date?: string
      sort?: 'time_desc' | 'time_asc' | 'price_desc' | 'price_asc' | 'quantity_desc' | 'quantity_asc'
      page?: number
      page_size?: number
    }) => request<{
      success: boolean
      data: {
        orders: any[] // 根据type不同，返回SellOrder或BuyOrder
        pagination: {
          current_page: number
          total_pages: number
          total_items: number
          page_size: number
        }
        stats?: {
          order_count: number
          total_value: number
          status: string
        }
        filters?: {
          status: string
          type: string
          period?: string
          date_range?: {
            start: string | null
            end: string | null
          }
        }
      }
    }>('/production/trading/my-orders/', {
      params: {
        type: params?.type || 'sell',
        ...(params?.status && { status: params.status }),
        ...(params?.period && { period: params.period }),
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date }),
        ...(params?.sort && { sort: params.sort }),
        page: params?.page || 1,
        page_size: params?.page_size || 20
      }
    }),
    
    // 获取用户交易统计（新增）
    getUserStats: (params?: {
      period?: 'today' | 'week' | 'month' | 'all'
      start_date?: string
      end_date?: string
    }) => request<{
      success: boolean
      data: {
        total_volume: number           // 总交易额
        volume_trend: number           // 交易额趋势%
        total_income: number           // 总收入
        income_trend: number           // 收入趋势%
        total_expense: number          // 总支出
        expense_trend: number          // 支出趋势%
        total_transactions: number     // 交易总次数
        
        details?: {                    // 详细信息
          total_gross_sales: number    // 销售总额（未扣手续费）
          total_fees_paid: number      // 支付的手续费
          net_profit: number           // 净利润
          buy_count: number            // 购买次数
          sell_count: number           // 销售次数
          avg_buy_amount: number       // 平均购买金额
          avg_sell_amount: number      // 平均销售金额
        }
        
        hot_items?: Array<{            // 热门交易商品TOP3
          item_type: string
          item_name: string
          trade_count: number
          total_volume: number
        }>
        
        period?: string                // 查询周期
        date_range?: {                 // 时间范围
          start: string
          end: string
        }
      }
    }>('/production/trading/user-stats/', { 
      params: {
        ...(params?.period && { period: params.period }),
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date })
      }
    }),
    
    // 获取订单详情
    getOrderDetail: (orderId: number) => request<TradingResponse<SellOrder>>(`/production/trading/orders/${orderId}/`)
  },
  
  // ==================== 价格数据 API ====================
  
  prices: {
    // 获取价格指导
    getPriceGuide: (itemType?: string) => request<{
      success: boolean
      data: itemType extends string ? PriceGuide : Record<string, PriceGuide>
    }>(itemType ? `/production/trading/price-guide/${itemType}/` : '/production/trading/price-guide/'),
    
    // 获取价格历史
    getPriceHistory: (itemType: string, days: number = 7) => request<{
      success: boolean
      data: Array<{
        time: string
        price: number
        volume: number
      }>
    }>(`/production/trading/price-history/${itemType}/`, {
      params: { days }
    }),
    
    // 获取市场深度
    getMarketDepth: (itemType: string) => request<{
      success: boolean
      data: {
        buy: Array<{ price: number; quantity: number }>
        sell: Array<{ price: number; quantity: number }>
      }
    }>(`/production/trading/market-depth/${itemType}/`),
    
    // 获取配置信息
    getConfig: () => request<{
      success: boolean
      data: {
        fee_rate: number
        price_fluctuation_rate: number
        order_expire_hours: number
        material_types: Array<{ code: string; name: string }>
        tool_types: Array<{ code: string; name: string }>
      }
    }>('/production/trading/config/')
  }
}

// ==================== 辅助函数 ====================

/**
 * 计算手续费
 */
export function calculateFee(amount: number, feeRate: number = 0.03): number {
  return Number((amount * feeRate).toFixed(2))
}

/**
 * 计算价格范围
 */
export function calculatePriceRange(basePrice: number, fluctuationRate: number = 0.15): {
  min: number
  max: number
} {
  return {
    min: Number((basePrice * (1 - fluctuationRate)).toFixed(2)),
    max: Number((basePrice * (1 + fluctuationRate)).toFixed(2))
  }
}

/**
 * 验证价格是否在允许范围内
 */
export function isPriceValid(
  price: number, 
  yesterdayPrice: number, 
  fluctuationRate: number = 0.15
): boolean {
  const { min, max } = calculatePriceRange(yesterdayPrice, fluctuationRate)
  return price >= min && price <= max
}

/**
 * 格式化剩余时间
 */
export function formatTimeRemaining(expireAt: string): string {
  const now = new Date()
  const expire = new Date(expireAt)
  const diff = expire.getTime() - now.getTime()
  
  if (diff <= 0) return '已过期'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    return `${days}天${hours % 24}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

/**
 * 格式化交易类型
 */
export function formatTransactionType(type: string): string {
  const types: Record<string, string> = {
    'buy': '购买',
    'sell': '出售',
    'purchase': '购买',
    'sale': '出售'
  }
  return types[type] || type
}
