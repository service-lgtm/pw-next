// src/hooks/useInventory.ts
// 用户库存数据 Hook - 修复版本，使用正确的 inventory 接口
// 
// 关联说明：
// 1. 被 src/app/assets/page.tsx 调用，用于获取用户的材料、工具、特殊资源等库存数据
// 2. 调用后端 API: GET /api/production/inventory/ 
// 3. 后端接口位置: production/views.py -> UserInventoryView
// 4. 相关模型: production/models.py -> Tool, UserResource
//              wallet/models.py -> Wallet
// 
// 修复内容：
// - 从调用 /production/resources/stats/ 改为调用 /production/inventory/
// - inventory 接口能返回完整的工具数据，解决了工具不显示的问题
// - 保持了与现有代码的兼容性，数据结构不变

import { useState, useEffect, useCallback } from 'react'
import { request } from '@/lib/api'

// ==================== 类型定义 ====================
// 这些类型定义与后端 UserInventoryView 返回的数据结构完全对应

/**
 * 材料项数据结构
 * 对应后端的 UserResource 模型
 */
interface MaterialItem {
  amount: number           // 数量
  value?: number          // 总价值（TDB）
  unit_price?: number     // 单价（TDB/个）
  display_name: string    // 显示名称
  frozen?: number         // 冻结数量
}

/**
 * 工具项数据结构
 * 对应后端的 Tool 模型统计数据
 */
interface ToolItem {
  count: number                    // 总数量
  working: number                  // 工作中数量
  idle: number                     // 空闲数量
  damaged: number                  // 损坏数量
  total_durability: number         // 总耐久度
  avg_durability_percent: number   // 平均耐久度百分比
  display_name: string             // 显示名称
  unit_price?: number              // 单价（TDB）
  value?: number                   // 总价值（TDB）
}

/**
 * 特殊物品数据结构
 * 包括砖头和YLD通证
 */
interface SpecialItem {
  amount: number          // 数量
  display_name: string    // 显示名称
  unit_price?: number     // 单价（TDB）
  unit_price_usd?: number // USD单价（用于YLD）
  value?: number          // 总价值（TDB）
  value_tdb?: number      // TDB价值
  value_rmb?: number      // 人民币价值
}

/**
 * 完整的库存数据结构
 * 对应后端 UserInventoryView.get() 返回的 data 字段
 */
interface InventoryData {
  // 材料资源（铁矿、石材、木材、粮食、种子）
  materials: {
    iron?: MaterialItem
    stone?: MaterialItem
    wood?: MaterialItem
    food?: MaterialItem
    seed?: MaterialItem
  }
  
  // 工具（镐头、斧头、锄头）
  tools: {
    pickaxe?: ToolItem
    axe?: ToolItem
    hoe?: ToolItem
  }
  
  // 特殊资源（砖头、YLD）
  special: {
    brick?: SpecialItem
    yld?: SpecialItem
  }
  
  // 汇总信息
  summary: {
    total_value_tdb: number  // 总价值（TDB）
    total_value_usd: number  // 总价值（USD）
    total_value_rmb: number  // 总价值（RMB）
    exchange_rates: {        // 汇率
      tdb_to_usd: number    // TDB到USD汇率 (1:1)
      yld_to_usd: number    // YLD到USD汇率 (1:2.84)
      usd_to_rmb: number    // USD到RMB汇率 (1:7.3)
    }
  }
  
  // 统计信息（可选）
  stats?: {
    active_mining_sessions: number  // 活跃挖矿会话数
    tool_utilization_rate: number   // 工具利用率
    resource_types_owned: number    // 拥有的资源种类数
    tools: {
      total: number      // 工具总数
      in_use: number     // 使用中
      damaged: number    // 损坏的
    }
  }
}

/**
 * Hook 配置选项
 */
interface UseInventoryOptions {
  category?: 'all' | 'materials' | 'tools' | 'special'  // 查询类别
  includePrices?: boolean   // 是否包含价格信息
  autoRefresh?: boolean     // 是否自动刷新
  refreshInterval?: number  // 刷新间隔（毫秒）
}

// ==================== Hook 实现 ====================

/**
 * 用户库存数据 Hook
 * 
 * 使用示例：
 * ```tsx
 * const { inventory, loading, error, refetch } = useInventory({
 *   category: 'all',
 *   includePrices: true
 * })
 * ```
 * 
 * @param options 配置选项
 * @returns 库存数据、加载状态、错误信息和刷新函数
 */
export function useInventory(options?: UseInventoryOptions) {
  const [inventory, setInventory] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 解构配置选项，提供默认值
  const {
    category = 'all',
    includePrices = true,
    autoRefresh = false,
    refreshInterval = 60000 // 默认1分钟
  } = options || {}

  /**
   * 获取库存数据的核心函数
   * 调用后端 /api/production/inventory/ 接口
   */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 调用正确的 inventory 接口（修复的关键点）
      // 之前错误地调用了 /production/resources/stats/ 
      const response = await request<{
        success: boolean
        data: InventoryData
        message?: string
      }>('/production/inventory/', {
        params: {
          category: category,           // 查询类别
          include_prices: includePrices ? 'true' : 'false'  // 是否包含价格
        }
      })
      
      if (response.success && response.data) {
        // 直接使用后端返回的数据结构
        // 不需要转换，因为后端 UserInventoryView 返回的格式已经符合需求
        setInventory(response.data)
        
        // 记录日志用于调试
        console.log('[useInventory] 成功获取库存数据:', {
          materials: Object.keys(response.data.materials || {}),
          tools: Object.keys(response.data.tools || {}),
          special: Object.keys(response.data.special || {}),
          totalValue: response.data.summary?.total_value_tdb
        })
      } else {
        // 如果接口调用失败但没有抛出异常，设置错误信息
        const errorMsg = response.message || '获取库存数据失败'
        setError(errorMsg)
        console.error('[useInventory] API返回失败:', errorMsg)
        
        // 设置空数据结构，保证组件不会因为 null 而崩溃
        setInventory(createEmptyInventory())
      }
    } catch (err) {
      // 捕获网络错误或其他异常
      console.error('[useInventory] 获取库存失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
      
      // 错误时返回空数据结构，保证页面能正常显示
      setInventory(createEmptyInventory())
    } finally {
      setLoading(false)
    }
  }, [category, includePrices])

  /**
   * 初始加载和自动刷新逻辑
   */
  useEffect(() => {
    // 初始加载
    fetchInventory()
    
    // 设置自动刷新
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchInventory, refreshInterval)
      
      // 清理函数
      return () => clearInterval(interval)
    }
  }, [fetchInventory, autoRefresh, refreshInterval])

  // 返回数据和控制函数
  return {
    inventory,    // 库存数据
    loading,      // 加载状态
    error,        // 错误信息
    refetch: fetchInventory  // 手动刷新函数
  }
}

// ==================== 辅助函数 ====================

/**
 * 创建空的库存数据结构
 * 用于初始化或错误时返回，避免组件因 null/undefined 崩溃
 */
function createEmptyInventory(): InventoryData {
  return {
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
  }
}

/**
 * 格式化价值显示
 * @param amount 金额
 * @param currency 货币类型
 * @returns 格式化的字符串
 * 
 * 示例：
 * formatValue(1000, 'TDB') => "1,000 TDB"
 * formatValue(100, 'USD') => "$100.00"
 * formatValue(730, 'RMB') => "¥730.00"
 */
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

/**
 * 获取资源图标
 * @param resourceType 资源类型
 * @returns 对应的 emoji 图标
 * 
 * 这些图标用于在UI中显示，提升用户体验
 */
export function getResourceIcon(resourceType: string): string {
  const icons: { [key: string]: string } = {
    // 材料图标
    iron: '⛏️',      // 铁矿
    stone: '🪨',     // 石材
    wood: '🪵',      // 木材
    food: '🌾',      // 粮食
    grain: '🌾',     // 粮食（别名）
    seed: '🌱',      // 种子
    
    // 特殊资源图标
    brick: '🧱',     // 砖头
    yld: '💎',       // YLD通证
    
    // 工具图标
    pickaxe: '⛏️',   // 镐头
    axe: '🪓',       // 斧头
    hoe: '🔧'        // 锄头
  }
  
  return icons[resourceType] || '📦'  // 默认图标
}

/**
 * 计算资源总价值
 * @param inventory 库存数据
 * @param resourceType 资源类型（可选，不传则计算所有）
 * @returns 总价值（TDB）
 */
export function calculateTotalValue(
  inventory: InventoryData | null,
  resourceType?: 'materials' | 'tools' | 'special'
): number {
  if (!inventory) return 0
  
  let total = 0
  
  // 计算材料价值
  if (!resourceType || resourceType === 'materials') {
    Object.values(inventory.materials || {}).forEach(item => {
      total += item.value || 0
    })
  }
  
  // 计算工具价值
  if (!resourceType || resourceType === 'tools') {
    Object.values(inventory.tools || {}).forEach(item => {
      total += item.value || 0
    })
  }
  
  // 计算特殊资源价值
  if (!resourceType || resourceType === 'special') {
    Object.values(inventory.special || {}).forEach(item => {
      total += item.value || item.value_tdb || 0
    })
  }
  
  return total
}

/**
 * 获取资源数量
 * @param inventory 库存数据
 * @param resourceType 资源类型
 * @param resourceName 资源名称
 * @returns 资源数量
 */
export function getResourceAmount(
  inventory: InventoryData | null,
  resourceType: 'materials' | 'tools' | 'special',
  resourceName: string
): number {
  if (!inventory) return 0
  
  const category = inventory[resourceType]
  if (!category) return 0
  
  const resource = category[resourceName as keyof typeof category]
  if (!resource) return 0
  
  // 工具返回count，其他返回amount
  if (resourceType === 'tools') {
    return (resource as ToolItem).count || 0
  } else {
    return (resource as MaterialItem | SpecialItem).amount || 0
  }
}
