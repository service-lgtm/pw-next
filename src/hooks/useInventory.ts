// src/hooks/useInventory.ts
// 用户库存数据 Hook

import { useState, useEffect, useCallback } from 'react'
import { request } from '@/lib/api'

// ==================== 类型定义 ====================

interface MaterialItem {
  amount: number
  value?: number
  unit_price?: number
  display_name: string
  frozen?: number
}

interface ToolItem {
  count: number
  working: number
  idle: number
  damaged: number
  total_durability: number
  avg_durability_percent: number
  display_name: string
  unit_price?: number
  value?: number
}

interface SpecialItem {
  amount: number
  display_name: string
  unit_price?: number
  unit_price_usd?: number
  value?: number
  value_tdb?: number
  value_rmb?: number
}

interface InventoryData {
  materials: {
    iron?: MaterialItem
    stone?: MaterialItem
    wood?: MaterialItem
    food?: MaterialItem
    seed?: MaterialItem
  }
  tools: {
    pickaxe?: ToolItem
    axe?: ToolItem
    hoe?: ToolItem
  }
  special: {
    brick?: SpecialItem
    yld?: SpecialItem
  }
  summary: {
    total_value_tdb: number
    total_value_usd: number
    total_value_rmb: number
    exchange_rates: {
      tdb_to_usd: number
      yld_to_usd: number
      usd_to_rmb: number
    }
  }
  stats?: {
    active_mining_sessions: number
    tool_utilization_rate: number
    resource_types_owned: number
    tools: {
      total: number
      in_use: number
      damaged: number
    }
  }
}

interface UseInventoryOptions {
  category?: 'all' | 'materials' | 'tools' | 'special'
  includePrices?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

// ==================== Hook 实现 ====================

export function useInventory(options?: UseInventoryOptions) {
  const [inventory, setInventory] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    category = 'all',
    includePrices = true,
    autoRefresh = false,
    refreshInterval = 60000 // 1分钟
  } = options || {}

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 暂时返回模拟数据，等后端接口实现后替换
      const mockData: InventoryData = {
        materials: {
          iron: { amount: 0, value: 0, unit_price: 10, display_name: '铁矿' },
          stone: { amount: 0, value: 0, unit_price: 8, display_name: '石材' },
          wood: { amount: 0, value: 0, unit_price: 6, display_name: '木材' },
          food: { amount: 0, value: 0, unit_price: 5, display_name: '粮食' },
          seed: { amount: 0, value: 0, unit_price: 3, display_name: '种子' }
        },
        tools: {
          pickaxe: { 
            count: 0, working: 0, idle: 0, damaged: 0, 
            total_durability: 0, avg_durability_percent: 0, 
            display_name: '镐头', value: 0 
          },
          axe: { 
            count: 0, working: 0, idle: 0, damaged: 0, 
            total_durability: 0, avg_durability_percent: 0, 
            display_name: '斧头', value: 0 
          },
          hoe: { 
            count: 0, working: 0, idle: 0, damaged: 0, 
            total_durability: 0, avg_durability_percent: 0, 
            display_name: '锄头', value: 0 
          }
        },
        special: {
          brick: { amount: 0, display_name: '砖头', value: 0 },
          yld: { amount: 0, display_name: '陨石通证', value_tdb: 0, value_rmb: 0 }
        },
        summary: {
          total_value_tdb: 0,
          total_value_usd: 0,
          total_value_rmb: 0,
          exchange_rates: {
            tdb_to_usd: 1.0,
            yld_to_usd: 2.84,
            usd_to_rmb: 7.3
          }
        }
      }
      
      setInventory(mockData)
      
      // 真实API调用（后端实现后启用）
      /*
      const response = await request<{
        success: boolean
        data: InventoryData
      }>('/production/inventory/', {
        params: {
          category,
          include_prices: includePrices
        }
      })
      
      if (response.success && response.data) {
        setInventory(response.data)
      }
      */
    } catch (err) {
      console.error('[useInventory] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [category, includePrices])

  useEffect(() => {
    fetchInventory()
    
    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(fetchInventory, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchInventory, autoRefresh, refreshInterval])

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory
  }
}

// ==================== 辅助函数 ====================

// 格式化价值显示
export function formatValue(amount: number, currency: 'TDB' | 'USD' | 'RMB'): string {
  const symbols = {
    TDB: '',
    USD: '$',
    RMB: '¥'
  }
  
  const symbol = symbols[currency]
  const formatted = amount.toLocaleString('zh-CN', {
    minimumFractionDigits: currency === 'TDB' ? 0 : 2,
    maximumFractionDigits: 2
  })
  
  return `${symbol}${formatted}${currency === 'TDB' ? ' TDB' : ''}`
}

// 获取资源图标
export function getResourceIcon(resourceType: string): string {
  const icons: { [key: string]: string } = {
    iron: '⛏️',
    stone: '🪨',
    wood: '🪵',
    food: '🌾',
    seed: '🌱',
    brick: '🧱',
    yld: '💎',
    pickaxe: '⛏️',
    axe: '🪓',
    hoe: '🔧'
  }
  
  return icons[resourceType] || '📦'
}
