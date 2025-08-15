// src/hooks/useInventory.ts
// 用户库存数据 Hook - 实现真实API调用

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
      
      // 尝试从资源统计接口获取数据
      const response = await request<{
        success: boolean
        data: any
      }>('/production/resources/stats/')
      
      if (response.success && response.data) {
        // 转换数据格式
        const data = response.data
        const convertedInventory: InventoryData = {
          materials: {},
          tools: {},
          special: {},
          summary: {
            total_value_tdb: data.total_value || 0,
            total_value_usd: 0,
            total_value_rmb: 0,
            exchange_rates: {
              tdb_to_usd: 1.0,
              yld_to_usd: 2.84,
              usd_to_rmb: 7.3
            }
          }
        }
        
        // 处理资源数据
        if (data.resources) {
          // 处理粮食
          if (data.resources.food || data.resources.grain) {
            const food = data.resources.food || data.resources.grain
            convertedInventory.materials.food = {
              amount: food.available || food.amount || 0,
              value: food.value || 0,
              unit_price: food.unit_price || 0.01,
              display_name: '粮食',
              frozen: food.frozen || 0
            }
          }
          
          // 处理木材
          if (data.resources.wood) {
            convertedInventory.materials.wood = {
              amount: data.resources.wood.available || data.resources.wood.amount || 0,
              value: data.resources.wood.value || 0,
              unit_price: data.resources.wood.unit_price || 0,
              display_name: '木材',
              frozen: data.resources.wood.frozen || 0
            }
          }
          
          // 处理铁矿
          if (data.resources.iron) {
            convertedInventory.materials.iron = {
              amount: data.resources.iron.available || data.resources.iron.amount || 0,
              value: data.resources.iron.value || 0,
              unit_price: data.resources.iron.unit_price || 0,
              display_name: '铁矿',
              frozen: data.resources.iron.frozen || 0
            }
          }
          
          // 处理石材
          if (data.resources.stone) {
            convertedInventory.materials.stone = {
              amount: data.resources.stone.available || data.resources.stone.amount || 0,
              value: data.resources.stone.value || 0,
              unit_price: data.resources.stone.unit_price || 0,
              display_name: '石材',
              frozen: data.resources.stone.frozen || 0
            }
          }
          
          // 处理种子
          if (data.resources.seed) {
            convertedInventory.materials.seed = {
              amount: data.resources.seed.available || data.resources.seed.amount || 0,
              value: data.resources.seed.value || 0,
              unit_price: data.resources.seed.unit_price || 0,
              display_name: '种子',
              frozen: data.resources.seed.frozen || 0
            }
          }
        }
        
        // 处理钱包中的特殊资源
        if (data.wallet) {
          if (data.wallet.yld_balance > 0) {
            convertedInventory.special.yld = {
              amount: data.wallet.yld_balance,
              display_name: 'YLD通证',
              unit_price: data.wallet.yld_unit_price || 2.84,
              value: data.wallet.yld_value || (data.wallet.yld_balance * 2.84)
            }
          }
        }
        
        setInventory(convertedInventory)
      } else {
        // 如果统计接口失败，返回空数据
        setInventory({
          materials: {},
          tools: {},
          special: {},
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
        })
      }
    } catch (err) {
      console.error('[useInventory] Error:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      
      // 错误时返回空数据
      setInventory({
        materials: {},
        tools: {},
        special: {},
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
      })
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
    grain: '🌾',
    seed: '🌱',
    brick: '🧱',
    yld: '💎',
    pickaxe: '⛏️',
    axe: '🪓',
    hoe: '🔧'
  }
  
  return icons[resourceType] || '📦'
}
