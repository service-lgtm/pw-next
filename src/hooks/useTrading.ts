// src/hooks/useTrading.ts
// 交易市场相关 Hook
// 版本：1.2.0 - 接入真实的用户统计和增强订单API

/**
 * ============================================
 * 文件修改说明
 * ============================================
 * 修改原因：接入真实的后端API，替换假数据
 * 主要修改：
 * 1. useTradingOrders - 接入真实的用户统计API
 * 2. 增强订单查询功能，支持时间筛选
 * 3. 移除假数据，使用真实API响应
 * 
 * 新增API接入：
 * - ✅ /production/trading/user-stats/ - 用户交易统计
 * - ✅ /production/trading/my-orders/ - 增强版订单查询（支持时间筛选）
 * 
 * 主要功能：
 * 1. useTrading - 交易主页数据
 * 2. useTradingMarket - 市场浏览功能
 * 3. useTradingSell - 出售管理功能
 * 4. useTradingOrders - 订单管理功能（已更新）
 * 5. usePriceGuide - 价格指导功能
 * 
 * 依赖关系：
 * - /lib/api/trading.ts - API 接口
 * - /types/trading.ts - 类型定义
 * 
 * ⚠️ 重要说明：
 * - 使用 React Query 进行数据缓存和同步
 * - 错误处理使用 toast 通知
 * - 支持乐观更新以提升用户体验
 * ============================================
 */

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tradingApi } from '@/lib/api/trading'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import type {
  MarketItem,
  MarketFilters,
  OrderFilters,
  CreateSellOrderRequest,
  CreateBuyOrderRequest
} from '@/types/trading'

// ==================== 交易主页 Hook ====================

export function useTrading() {
  const { isAuthenticated } = useAuth()
  
  // 获取市场汇总数据（使用新的统一接口）
  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ['trading', 'market-summary'],
    queryFn: async () => {
      const response = await tradingApi.market.getMarketSummary()
      console.log('[useTrading] 市场汇总数据:', response)
      return response.data
    },
    enabled: isAuthenticated,
    refetchInterval: 30000 // 30秒刷新一次
  })
  
  // 整理数据格式以匹配页面需要的结构
  const marketStats = summaryData ? {
    total_volume_24h: summaryData.summary_24h.trade_volume,
    volume_change_24h: 0, // 可以根据历史数据计算
    active_orders: summaryData.active_market.total_orders,
    active_sellers: 0, // API暂未提供
    active_buyers: 0, // API暂未提供
    success_rate: 0, // API暂未提供
    avg_order_size: summaryData.summary_24h.avg_trade,
    popular_items: []
  } : null
  
  // 转换热门商品数据格式
  const hotItems = summaryData?.hot_items?.map(item => ({
    order_id: 0, // 热门商品统计没有具体订单ID
    item_type: item.item_type,
    item_name: item.item_name,
    unit_price: item.trade_volume / item.trade_quantity, // 计算平均单价
    remaining_quantity: item.trade_quantity,
    seller_nickname: '',
    created_at: new Date().toISOString(),
    expire_at: new Date().toISOString(),
    // 额外信息用于显示
    rank: item.rank,
    trade_count: item.trade_count,
    trade_volume: item.trade_volume
  })) || []
  
  // 转换最新成交记录格式
  const recentTransactions = summaryData?.recent_trades?.map(trade => ({
    transaction_id: trade.transaction_id,
    type: 'buy' as const,
    item_type: trade.item_type,
    item_name: trade.item_name,
    quantity: trade.quantity,
    unit_price: trade.unit_price,
    total_amount: trade.total_amount,
    seller: trade.seller,
    buyer: trade.buyer,
    buyer_nickname: trade.buyer,
    created_at: trade.created_at,
    time_ago: trade.time_ago // 额外的时间描述
  })) || []
  
  const refreshData = useCallback(() => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: ['trading', 'market-summary'] })
  }, [])
  
  return {
    marketStats,
    hotItems,
    recentTransactions,
    priceChanges: summaryData?.price_changes || [], // 额外返回价格涨跌数据
    activeMarket: summaryData?.active_market, // 额外返回在售市场详情
    loading: isLoading,
    error,
    refreshData
  }
}

// ==================== 市场浏览 Hook ====================

export function useTradingMarket(initialFilters: MarketFilters = {}) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<MarketFilters>({
    page: 1,
    pageSize: 20,
    ...initialFilters
  })
  
  // 获取商品列表
  const { data: itemsData, isLoading, refetch } = useQuery({
    queryKey: ['trading', 'market', filters],
    queryFn: async () => {
      const response = await tradingApi.market.getItems({
        type: filters.type,
        category: filters.category,
        page: filters.page,
        page_size: filters.pageSize,
        sort: filters.sort
      })
      return response
    },
    enabled: isAuthenticated,
    keepPreviousData: true
  })
  
  // 购买商品
  const buyMutation = useMutation({
    mutationFn: async ({ orderId, quantity }: { orderId: number; quantity: number }) => {
      // 1. 创建购买订单
      const buyOrder = await tradingApi.buy.createOrder({ order_id: orderId, quantity })
      if (!buyOrder.success || !buyOrder.data) {
        throw new Error(buyOrder.message || '创建订单失败')
      }
      
      // 2. 确认购买
      const result = await tradingApi.buy.confirmOrder(buyOrder.data.transaction_id)
      if (!result.success) {
        throw new Error(result.message || '购买失败')
      }
      
      return result
    },
    onSuccess: () => {
      // 刷新市场数据
      queryClient.invalidateQueries({ queryKey: ['trading', 'market'] })
      // 刷新用户信息（包含余额）
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '购买失败')
    }
  })
  
  // 获取当前页商品
  const fetchItems = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])
  
  // 购买商品
  const buyItem = useCallback(async (orderId: number, quantity: number) => {
    try {
      const result = await buyMutation.mutateAsync({ orderId, quantity })
      return result
    } catch (error) {
      return { success: false, error }
    }
  }, [buyMutation])
  
  return {
    items: itemsData?.data?.items || [],
    loading: isLoading,
    hasMore: itemsData?.data?.pagination ? itemsData.data.pagination.current_page < itemsData.data.pagination.total_pages : false,
    currentPage: itemsData?.data?.pagination?.current_page || 1,
    totalPages: itemsData?.data?.pagination?.total_pages || 1,
    fetchItems,
    buyItem,
    buying: buyMutation.isLoading,
    setFilters,
    refetch
  }
}

// ==================== 出售管理 Hook ====================

export function useTradingSell() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // 获取可售资源
  const { data: sellableData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['trading', 'sellable'],
    queryFn: async () => {
      const response = await tradingApi.sell.getSellableResources()
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 获取我的订单（修复：使用正确的响应格式）
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['trading', 'my-orders', 'sell'],
    queryFn: async () => {
      const response = await tradingApi.orders.getMyOrders({ 
        type: 'sell',
        status: undefined // 不传status参数，获取所有状态的订单
      })
      console.log('[useTradingSell] 我的订单响应:', response)
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 创建出售订单
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateSellOrderRequest) => {
      const response = await tradingApi.sell.createOrder(data)
      if (!response.success) {
        throw new Error(response.message || '创建订单失败')
      }
      return response
    },
    onError: (error: any) => {
      toast.error(error.message || '创建订单失败')
    }
  })
  
  // 确认出售订单
  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await tradingApi.sell.confirmOrder(orderId)
      if (!response.success) {
        throw new Error(response.message || '确认订单失败')
      }
      return response
    },
    onSuccess: () => {
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['trading', 'sellable'] })
      queryClient.invalidateQueries({ queryKey: ['trading', 'my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '确认订单失败')
    }
  })
  
  // 取消订单
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await tradingApi.sell.cancelOrder(orderId)
      if (!response.success) {
        throw new Error(response.message || '取消订单失败')
      }
      return response
    },
    onSuccess: () => {
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['trading', 'sellable'] })
      queryClient.invalidateQueries({ queryKey: ['trading', 'my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '取消订单失败')
    }
  })
  
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trading', 'sellable'] })
    queryClient.invalidateQueries({ queryKey: ['trading', 'my-orders'] })
  }, [queryClient])
  
  return {
    sellableResources: sellableData,
    myOrders: ordersData?.orders || [], // 修复：从response.data.orders获取
    priceGuidance: sellableData?.price_guidance,
    loading: resourcesLoading || ordersLoading,
    refreshData,
    createSellOrder: createOrderMutation.mutateAsync,
    confirmSellOrder: confirmOrderMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    creating: createOrderMutation.isLoading || confirmOrderMutation.isLoading
  }
}

// ==================== 订单管理 Hook（更新版） ====================

export function useTradingOrders(filters: OrderFilters = {}) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // 映射时间范围到API期望的period参数
  const getPeriodParam = (timeRange?: string) => {
    switch(timeRange) {
      case 'today': return 'today'
      case 'week': return 'week'
      case 'month': return 'month'
      case 'all': 
      default: return undefined
    }
  }
  
  // 获取用户交易统计（使用真实API）
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['trading', 'user-stats', filters.timeRange],
    queryFn: async () => {
      const response = await tradingApi.orders.getUserStats({
        period: getPeriodParam(filters.timeRange)
      })
      console.log('[useTradingOrders] 用户统计响应:', response)
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 获取出售订单（增强版API）
  const { data: sellOrdersData, isLoading: sellLoading } = useQuery({
    queryKey: ['trading', 'orders', 'sell', filters],
    queryFn: async () => {
      // 映射状态值到API期望的格式
      let apiStatus = filters.sellStatus
      if (filters.sellStatus === 'all') {
        apiStatus = undefined // API会返回所有状态
      } else if (filters.sellStatus === 'active') {
        apiStatus = 'selling' // API使用 'selling' 而不是 'active'
      }
      
      const response = await tradingApi.orders.getMyOrders({
        type: 'sell',
        status: apiStatus,
        period: getPeriodParam(filters.timeRange),
        page: filters.page,
        page_size: filters.pageSize,
        sort: filters.sort
      })
      console.log('[useTradingOrders] 卖单响应:', response)
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 获取购买记录（增强版API）
  const { data: buyOrdersData, isLoading: buyLoading } = useQuery({
    queryKey: ['trading', 'orders', 'buy', filters],
    queryFn: async () => {
      const response = await tradingApi.orders.getMyOrders({
        type: 'buy',
        status: filters.buyStatus === 'all' ? undefined : filters.buyStatus,
        period: getPeriodParam(filters.timeRange),
        page: filters.page,
        page_size: filters.pageSize,
        sort: filters.sort
      })
      console.log('[useTradingOrders] 买单响应:', response)
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 从真实API数据构建统计对象
  const orderStats = statsData ? {
    total_volume: statsData.total_volume || 0,
    volume_trend: statsData.volume_trend || 0,
    total_income: statsData.total_income || 0,
    income_trend: statsData.income_trend || 0,
    total_expense: statsData.total_expense || 0,
    expense_trend: statsData.expense_trend || 0,
    total_transactions: statsData.total_transactions || 0,
    // 额外的详细信息
    details: statsData.details,
    hot_items: statsData.hot_items,
    period: statsData.period,
    date_range: statsData.date_range
  } : null
  
  // 取消订单
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await tradingApi.sell.cancelOrder(orderId)
      if (!response.success) {
        throw new Error(response.message || '取消订单失败')
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['trading', 'user-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '取消订单失败')
    }
  })
  
  const refreshOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trading', 'orders'] })
    queryClient.invalidateQueries({ queryKey: ['trading', 'user-stats'] })
  }, [queryClient])
  
  return {
    sellOrders: sellOrdersData?.orders,
    buyOrders: buyOrdersData?.orders,
    orderStats,
    loading: sellLoading || buyLoading || statsLoading,
    refreshOrders,
    cancelOrder: cancelOrderMutation.mutateAsync
  }
}

// ==================== 价格指导 Hook ====================

export function usePriceGuide(params: {
  category?: string
  itemType?: string
} = {}) {
  const { isAuthenticated } = useAuth()
  
  // 获取价格指导
  const { data: priceGuidesData, isLoading: guidesLoading } = useQuery({
    queryKey: ['trading', 'price-guide', params.itemType],
    queryFn: async () => {
      const response = await tradingApi.prices.getPriceGuide(params.itemType)
      return response.data
    },
    enabled: isAuthenticated
  })
  
  // 获取价格历史
  const { data: priceHistoryData, isLoading: historyLoading } = useQuery({
    queryKey: ['trading', 'price-history', params.itemType],
    queryFn: async () => {
      if (!params.itemType) return null
      const response = await tradingApi.prices.getPriceHistory(params.itemType, 7)
      return response.data
    },
    enabled: isAuthenticated && !!params.itemType
  })
  
  // 获取市场深度
  const { data: marketDepthData, isLoading: depthLoading } = useQuery({
    queryKey: ['trading', 'market-depth', params.itemType],
    queryFn: async () => {
      if (!params.itemType) return null
      const response = await tradingApi.prices.getMarketDepth(params.itemType)
      return response.data
    },
    enabled: isAuthenticated && !!params.itemType
  })
  
  const refreshPrices = useCallback(() => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: ['trading', 'price-guide'] })
    queryClient.invalidateQueries({ queryKey: ['trading', 'price-history'] })
    queryClient.invalidateQueries({ queryKey: ['trading', 'market-depth'] })
  }, [])
  
  return {
    priceGuides: priceGuidesData,
    priceHistory: priceHistoryData,
    marketDepth: marketDepthData,
    loading: guidesLoading || historyLoading || depthLoading,
    refreshPrices
  }
}
