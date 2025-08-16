// src/lib/api/production.ts
// 生产系统 API 接口 - 修复路径版本
//
// 修复说明：
// 1. 修正了 API 基础路径为 https://mg.pxsj.net.cn/api/v1/
// 2. 所有生产系统接口路径加上 /api/v1/production/ 前缀
// 3. 导入正确的 request 函数
// 4. 保持与后端 production.urls 的路径一致
//
// API 路径结构：
// - 基础路径: https://mg.pxsj.net.cn/api/v1/
// - 生产系统: /api/v1/production/
// - 认证系统: /api/v1/auth/
// - 资产系统: /api/v1/assets/
// - 商店系统: /api/v1/shop/
//
// 关联文件：
// - src/lib/api/index.ts: API 基础配置和 request 函数
// - src/hooks/useProduction.ts: 使用这些 API 的 Hooks
// - src/types/production.ts: 类型定义
// - backend/production/urls.py: 后端路由配置

import { request } from '@/lib/api'
import type {
  Tool,
  UserResource,
  MiningSession,
  StartSelfMiningRequest,
  AddToolToMiningRequest,
  RemoveToolFromMiningRequest,
  DepositToolsRequest,
  StartHiredMiningWithToolRequest,
  StartHiredMiningWithoutToolRequest,
  SynthesizeToolRequest,
  SynthesizeBrickRequest,
  CollectOutputRequest,
  StopProductionRequest,
  StartMiningResponse,
  AddToolResponse,
  RemoveToolResponse,
  SynthesisResponse,
  CollectOutputResponse,
  ProductionStatsResponse,
  MiningSessionListResponse,
  ToolListResponse,
  ResourceBalance
} from '@/types/production'

// API 基础路径常量 - 注意：不需要 /api/v1 前缀，因为 request 函数已经包含了
const API_PREFIX = '/production'

export const productionApi = {
  // ==================== 自主挖矿 ====================
  mining: {
    // 开始自主挖矿
    startSelfMining: (data: StartSelfMiningRequest) =>
      request<StartMiningResponse>(`${API_PREFIX}/mining/self/start/`, {
        method: 'POST',
        body: data,
      }),

    // 添加工具到挖矿
    addTools: (data: AddToolToMiningRequest) =>
      request<AddToolResponse>(`${API_PREFIX}/mining/self/add-tools/`, {
        method: 'POST',
        body: data,
      }),

    // 从挖矿移除工具
    removeTools: (data: RemoveToolFromMiningRequest) =>
      request<RemoveToolResponse>(`${API_PREFIX}/mining/self/remove-tools/`, {
        method: 'POST',
        body: data,
      }),

    // 获取我的挖矿会话列表
    getMySessions: (params?: {
      status?: 'active' | 'paused' | 'completed'
      is_active?: boolean
      page?: number
      page_size?: number
    }) =>
      request<MiningSessionListResponse>(`${API_PREFIX}/sessions/`, { params }),

    // 收取产出
    collectOutput: (data: CollectOutputRequest) =>
      request<CollectOutputResponse>(`${API_PREFIX}/collect/`, {
        method: 'POST',
        body: data,
      }),

    // 停止生产
    stopProduction: (data: StopProductionRequest) =>
      request<{
        success: boolean
        message: string
        data: {
          final_output: number
          tools_released: number
          total_output?: number
          total_hours?: number
          auto_collected?: number
        }
      }>(`${API_PREFIX}/stop/`, {
        method: 'POST',
        body: data,
      }),

    // 挖矿预检查
    preCheck: () =>
      request<{
        success: boolean
        data: {
          can_mine: boolean
          warnings: string[]
          errors: string[]
          idle_tools: number
          food_amount: number
          yld_status: {
            remaining: number
            percentage_used: number
          }
          active_sessions: number
        }
      }>(`${API_PREFIX}/mining/pre-check/`),

    // 获取挖矿汇总
    getSummary: () =>
      request<{
        success: boolean
        data: {
          active_sessions: {
            count: number
            sessions: Array<{
              session_id: string
              resource_type: string
              land_id: number
              output_rate: number
              tool_count: number
              started_at: string
              hours_worked: number
              hours_collected: number
              uncollected_hours: number
              pending_output: number
              can_collect: boolean
            }>
            total_hourly_output: number
            total_food_consumption: number
          }
          resources: {
            iron: number
            stone: number
            wood: number
            food: number
            brick: number
            yld: number
          }
          tools: {
            total: number
            in_use: number
            idle: number
            damaged: number
          }
          food_sustainability_hours: number
          today_production: {
            total_output: number
            collection_count: number
          }
          yld_status: {
            daily_limit: number
            remaining: number
            percentage_used: number
            is_exhausted: boolean
          }
        }
      }>(`${API_PREFIX}/mining/summary/`),

    // 获取会话产出率历史
    getSessionRateHistory: (sessionId: number) =>
      request<{
        success: boolean
        data: {
          session_id: string
          resource_type: string
          current_rate: number
          rate_history: Array<{
            time: string
            start_hour: number
            rate: number
            tools: number
            total_tools: number
            ratio: number
          }>
          output_segments: Array<{
            period: string
            hours: number
            rate: number
            output: number
            tools: number
            ratio: number
          }>
        }
      }>(`${API_PREFIX}/sessions/${sessionId}/rate-history/`).catch(error => {
        // 如果接口不存在，返回模拟数据或空数据
        console.warn('[API] 产出率历史接口暂未实现，返回默认数据')
        return {
          success: true,
          data: {
            session_id: `SESSION-${sessionId}`,
            resource_type: 'YLD',
            current_rate: 0,
            rate_history: [],
            output_segments: []
          }
        }
      }),

    // 批量停止所有会话
    stopAllSessions: () =>
      request<{
        success: boolean
        message: string
        data: {
          stopped_count: number
          total_collected: number
          sessions: Array<{
            session_id: string
            resource_type: string
            status: string
            output_collected: number
          }>
        }
      }>(`${API_PREFIX}/stop-all/`, {
        method: 'POST',
      }),
  },

  // ==================== YLD系统监控 ====================
  yld: {
    // 获取YLD系统状态
    getSystemStatus: () =>
      request<{
        success: boolean
        data: {
          daily_limit: number
          produced_today: number
          remaining: number
          percentage_used: number
          is_exhausted: boolean
          active_sessions: number
          total_tools: number
          theoretical_hourly: number
          actual_hourly: number
          user_session?: {
            session_id: string
            output_rate: number
            tool_count: number
            started_at: string
          }
          warning?: string
        }
      }>(`${API_PREFIX}/yld/status/`),

    // 检查挖矿前YLD状态
    checkBeforeMining: () =>
      request<{
        can_mine: boolean
        daily_limit: number
        remaining: number
        percentage_used: number
        message: string
      }>(`${API_PREFIX}/yld/check-before-mining/`),

    // 处理YLD耗尽
    handleExhausted: () =>
      request<{
        success: boolean
        data: {
          message: string
          sessions_stopped: number
          total_settled: number
          settlement_details: Array<{
            session_id: string
            user: string
            hours: number
            should_get: number
            actual_get: number
          }>
        }
      }>(`${API_PREFIX}/yld/handle-exhausted/`, {
        method: 'POST',
      }),
  },

  // ==================== 招募与打工 ====================
  hiring: {
    // 存入工具供招募
    depositTools: (data: DepositToolsRequest) =>
      request<{
        success: boolean
        message: string
        data: {
          deposited_tools: number
          land_id: string
        }
      }>(`${API_PREFIX}/mining/recruit/deposit-tools/`, {
        method: 'POST',
        body: data,
      }),

    // 带工具打工
    startWithTools: (data: StartHiredMiningWithToolRequest) =>
      request<StartMiningResponse>(`${API_PREFIX}/mining/work/with-tools/`, {
        method: 'POST',
        body: data,
      }),

    // 无工具打工（借用工具）
    startWithoutTools: (data: StartHiredMiningWithoutToolRequest) =>
      request<StartMiningResponse>(`${API_PREFIX}/mining/work/without-tools/`, {
        method: 'POST',
        body: data,
      }),
  },

  // ==================== 合成系统 ====================
  synthesis: {
    // 合成工具
    synthesizeTool: (data: SynthesizeToolRequest) =>
      request<SynthesisResponse>(`${API_PREFIX}/synthesis/tool/`, {
        method: 'POST',
        body: data,
      }),

    // 合成砖头
    synthesizeBricks: (data: SynthesizeBrickRequest) =>
      request<SynthesisResponse>(`${API_PREFIX}/synthesis/bricks/`, {
        method: 'POST',
        body: data,
      }),

    // 获取合成配方
    getRecipes: () =>
      request<{
        success: boolean
        data: {
          recipes: {
            pickaxe?: { name: string; materials: any; yld_cost: number; durability: number }
            axe?: { name: string; materials: any; yld_cost: number; durability: number }
            hoe?: { name: string; materials: any; yld_cost: number; durability: number }
            brick?: { name: string; materials: any; yld_cost: number; output: number }
          }
          user_resources?: {
            wood: number
            iron: number
            stone: number
            yld: number
          }
        }
      }>(`${API_PREFIX}/synthesis/recipes/`),
  },

  // ==================== 工具管理 ====================
  tools: {
    // 获取我的工具列表
    getMyTools: (params?: {
      tool_type?: 'pickaxe' | 'axe' | 'hoe'
      status?: 'normal' | 'damaged' | 'repairing'
      is_in_use?: boolean
      page?: number
      page_size?: number
      ordering?: string
    }) =>
      request<ToolListResponse>(`${API_PREFIX}/tools/`, { params }),
  },

  // ==================== 资源管理 ====================
  resources: {
    // 获取用户资源（旧接口，保留兼容性）
    getMyResources: () =>
      request<{
        results: UserResource[]
        stats?: {
          total_types: number
          total_value: number
          total_amount: { [key: string]: number }
        }
      }>(`${API_PREFIX}/resources/`),

    // 获取资源统计（增强版）
    getResourceStats: () =>
      request<{
        success: boolean
        data: {
          resources: {
            [key: string]: {
              display_name: string
              amount: number
              frozen: number
              available: number
              total_produced: number
              total_consumed: number
              value?: number
              unit_price?: number
            }
          }
          wallet: {
            yld_balance: number
            tdb_balance: number
            yld_value?: number
            yld_unit_price?: number
            tdb_value?: number
          }
          prices: {
            [key: string]: number
          }
          total_value: number
          summary: {
            total_resources: number
            total_in_wallet: number
            total_value: number
            resource_types: number
          }
          distribution: Array<{
            type: string
            name: string
            value: number
            percentage: number
          }>
        }
      }>(`${API_PREFIX}/resources/stats/`),

    // 购买粮食
    buyFood: (data: { amount: number }) =>
      request<{
        success: boolean
        message: string
        data: {
          amount_purchased: number
          yld_spent: number
          new_food_balance: number
          new_yld_balance: number
        }
      }>(`${API_PREFIX}/food/buy/`, {
        method: 'POST',
        body: data,
      }),

    // 获取粮食购买状态
    getFoodPurchaseStatus: () =>
      request<{
        success: boolean
        data: {
          food_price: number
          yld_balance: number
          food_balance: number
          can_purchase: boolean
          max_purchasable: number
        }
      }>(`${API_PREFIX}/food/purchase-status/`),

    // 获取材料价格
    getPrices: () =>
      request<{
        success: boolean
        data: {
          prices: {
            [key: string]: number
          }
          exchange_rates?: {
            yld_to_tdb?: number
            tdb_to_yld?: number
          }
        }
      }>(`${API_PREFIX}/prices/`),
  },

  // ==================== 土地管理 ====================
  lands: {
    // 获取可用土地列表
    // 根据API文档，使用 /api/v1/production/lands/available/
    // 参数 ownership=mine 获取自己的土地
    getAvailableLands: (params?: {
      ownership?: 'mine' | 'others' | 'all'
      land_type?: string  // 可选：'yld_mine' 筛选YLD矿山
      has_tools?: boolean
      page?: number
      page_size?: number
    }) =>
      request<{
        success: boolean
        data: {
          results: Array<{
            id: number                      // 土地ID（用于开始挖矿）
            land_id: string                 // 土地编号
            is_mine: boolean                // 是否是我的土地
            is_producing: boolean           // 是否正在生产
            blueprint?: {
              land_type: string
              land_type_display?: string
              output_resource: string       // 产出资源类型
              daily_output?: number         // 日产量
            }
            yld_reserves?: number           // YLD剩余储量
            region_name?: string
            coordinate_x?: number
            coordinate_y?: number
            mining_options?: Array<{
              type: string
              name: string
              description: string
            }>
          }>
          count?: number
          total_pages?: number
          current_page?: number
          page_size?: number
        }
      }>(`${API_PREFIX}/lands/available/`, { params }),

    // 获取用户土地列表（备用接口）
    getUserLands: () =>
      request<{
        success: boolean
        data: {
          count: number
          results: any[]
        }
      }>(`${API_PREFIX}/lands/user/`),

    // 获取土地挖矿详情
    getLandMiningInfo: (landId: number | string) =>
      request<{
        success: boolean
        data: any
      }>(`${API_PREFIX}/lands/${landId}/mining-info/`),
  },

  // ==================== 统计数据 ====================
  stats: {
    // 获取生产统计
    getProductionStats: () =>
      request<ProductionStatsResponse>(`${API_PREFIX}/stats/`),

    // 检查粮食状态
    checkFoodStatus: () =>
      request<{
        success: boolean
        data: {
          current_food: number
          consumption_rate: number
          hours_sustainable: number
          hours_remaining?: number  // 兼容字段
          hours_sustainable_display: string
          warning: boolean
          warning_message: string | null
          active_sessions_count: number
        }
      }>(`${API_PREFIX}/food-status/`),
  },
}

// ==================== 辅助函数 ====================

/**
 * 格式化资源余额（从旧接口响应）
 * @param resources - 用户资源数组
 * @returns 格式化后的资源余额对象
 */
export function formatResourceBalance(resources: UserResource[]): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    food: 0,
    seed: 0,
    brick: 0
  }
  
  resources.forEach(resource => {
    const amount = parseFloat(resource.available_amount || resource.amount || '0')
    
    // 处理粮食字段映射（food/grain 兼容性处理）
    if (resource.resource_type === 'food' || resource.resource_type === 'grain') {
      balance.grain = amount
      balance.food = amount  // 同时设置 food 字段保持向后兼容
    } else if (resource.resource_type in balance) {
      balance[resource.resource_type as keyof ResourceBalance] = amount
    }
  })
  
  return balance
}

/**
 * 格式化资源统计到余额（从新接口响应）
 * @param stats - 资源统计数据
 * @returns 格式化后的资源余额对象
 */
export function formatResourceStatsToBalance(stats: any): ResourceBalance {
  const balance: ResourceBalance = {
    wood: 0,
    iron: 0,
    stone: 0,
    yld: 0,
    grain: 0,
    food: 0,
    seed: 0,
    brick: 0
  }
  
  if (stats?.resources) {
    Object.entries(stats.resources).forEach(([key, resource]: [string, any]) => {
      const amount = parseFloat(resource.available ?? resource.amount ?? '0')
      
      // 特别处理粮食字段（food/grain 兼容性处理）
      if (key === 'food' || key === 'grain') {
        balance.grain = amount
        balance.food = amount  // 同时设置 food 字段保持向后兼容
      } else if (key in balance) {
        balance[key as keyof ResourceBalance] = amount
      }
    })
  }
  
  // 如果有钱包数据，添加 YLD
  if (stats?.wallet?.yld_balance !== undefined) {
    balance.yld = parseFloat(stats.wallet.yld_balance)
  }
  
  return balance
}
