// src/types/trading.ts
// 交易市场类型定义
// 版本：1.0.0 - 定义交易相关的所有类型

/**
 * ============================================
 * 文件创建说明
 * ============================================
 * 创建原因：统一定义交易市场相关的 TypeScript 类型
 * 主要内容：
 * 1. 商品和订单类型
 * 2. API 请求和响应类型
 * 3. 状态和枚举类型
 * 
 * 依赖关系：
 * - 被 /lib/api/trading.ts 使用
 * - 被 /hooks/useTrading.ts 使用
 * - 被交易相关页面组件使用
 * 
 * ⚠️ 重要说明：
 * - 类型定义与后端 API 保持一致
 * - 金额和数量字段使用 number 类型
 * ============================================
 */

// ==================== 基础类型 ====================

// 商品类型
export type ItemType = 'material' | 'tool'

// 材料类型
export type MaterialType = 'iron' | 'stone' | 'wood' | 'yld' | 'food'

// 工具类型
export type ToolType = 'pickaxe' | 'axe' | 'hoe'

// 订单状态
export type OrderStatus = 'pending_confirm' | 'active' | 'completed' | 'cancelled' | 'expired'

// 交易类型
export type TransactionType = 'buy' | 'sell' | 'purchase' | 'sale'

// ==================== 市场相关类型 ====================

// 市场商品
export interface MarketItem {
  order_id: number
  item_type: string
  item_name: string
  unit_price: number
  remaining_quantity: number
  seller_nickname: string
  seller_id?: number
  created_at: string
  expire_at: string
  status?: OrderStatus
  original_quantity?: number
}

// 市场统计
export interface MarketStats {
  total_volume_24h: number
  volume_change_24h: number
  active_orders: number
  active_sellers: number
  active_buyers: number
  success_rate: number
  avg_order_size: number
  popular_items: Array<{
    item_type: string
    item_name: string
    transaction_count: number
    total_volume: number
  }>
}

// ==================== 订单相关类型 ====================

// 出售订单
export interface SellOrder {
  order_id: number
  item_type: string
  item_name: string
  quantity: number
  remaining_quantity: number
  unit_price: number
  total_amount: number
  fee_rate: number
  fee_amount: number
  expected_income: number
  status: OrderStatus
  created_at: string
  expire_at: string
  can_cancel: boolean
}

// 购买订单（预览）
export interface BuyOrder {
  transaction_id: string
  order_id: number
  item_type: string
  item_name: string
  quantity: number
  unit_price: number
  total_cost: number
  balance: number
  balance_after: number
  status: 'pending_confirm'
}

// 交易记录
export interface Transaction {
  transaction_id: string
  type: TransactionType
  item_type: string
  item_name: string
  quantity: number
  unit_price: number
  total_amount: number
  seller?: string
  seller_id?: number
  buyer?: string
  buyer_id?: number
  buyer_nickname?: string
  fee_amount?: number
  paid_amount?: number
  created_at: string
}

// ==================== 价格相关类型 ====================

// 价格指导
export interface PriceGuide {
  item_type: string
  item_name: string
  yesterday_price: number
  day_before_price?: number
  price_range: {
    min: number
    max: number
    fluctuation_rate: number
  }
  market_status?: {
    min_price: number
    max_price: number
    avg_price: number
    total_quantity: number
    order_count: number
  }
  suggested_price: number
  min_allowed: number
  max_allowed: number
  updated_at: string
}

// 价格历史点
export interface PricePoint {
  time: string
  price: number
  volume: number
  high?: number
  low?: number
}

// ==================== API 请求类型 ====================

// 创建出售订单请求
export interface CreateSellOrderRequest {
  item_type: string
  quantity: number
  unit_price: number
}

// 创建购买订单请求
export interface CreateBuyOrderRequest {
  order_id: number
  quantity: number
}

// ==================== API 响应类型 ====================

// 通用交易响应
export interface TradingResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: Record<string, any>
}

// 分页响应
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  pagination?: {
    current_page: number
    total_pages: number
    total_items: number
    page_size: number
  }
}

// ==================== 状态管理类型 ====================

// 交易状态
export interface TradingState {
  // 市场数据
  marketItems: MarketItem[]
  marketStats: MarketStats | null
  hotItems: MarketItem[]
  recentTransactions: Transaction[]
  
  // 用户数据
  sellableResources: {
    materials: Record<string, any>
    tools: Record<string, any>
    price_guidance: Record<string, PriceGuide>
  } | null
  
  myOrders: SellOrder[]
  myTransactions: Transaction[]
  
  // 价格数据
  priceGuides: Record<string, PriceGuide>
  priceHistory: Record<string, PricePoint[]>
  
  // UI 状态
  loading: boolean
  error: string | null
  creating: boolean
  buying: boolean
}

// 筛选条件
export interface MarketFilters {
  type?: ItemType
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'time_desc'
  search?: string
  page?: number
  pageSize?: number
}

// 订单筛选条件
export interface OrderFilters {
  status?: OrderStatus
  type?: 'sell' | 'buy'
  itemType?: string
  startDate?: string
  endDate?: string
  timeRange?: 'today' | 'week' | 'month' | 'all'
  page?: number
  pageSize?: number
}

// ==================== 工具函数类型 ====================

// 价格验证结果
export interface PriceValidation {
  isValid: boolean
  minPrice: number
  maxPrice: number
  message?: string
}

// 订单操作结果
export interface OrderOperationResult {
  success: boolean
  message: string
  data?: any
  error?: string
}
